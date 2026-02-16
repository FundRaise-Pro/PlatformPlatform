using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Certificates.Domain;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.Fundraiser.Features.Subscriptions;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Certificates.Commands;

[PublicAPI]
public sealed record GenerateCertificatesCommand : ICommand, IRequest<Result<CertificateIssuanceBatchId>>
{
    public required int TaxYear { get; init; }
    public required CertificateTemplateId TemplateId { get; init; }
}

public sealed class GenerateCertificatesValidator : AbstractValidator<GenerateCertificatesCommand>
{
    public GenerateCertificatesValidator()
    {
        RuleFor(x => x.TaxYear).InclusiveBetween(2000, 2100);
    }
}

public sealed class GenerateCertificatesHandler(
    ICertificateTemplateRepository templateRepository,
    ICertificateIssuanceBatchRepository batchRepository,
    IDonationRepository donationRepository,
    ITransactionRepository transactionRepository,
    IDonorProfileRepository donorProfileRepository,
    IReceiptNumberAllocator receiptNumberAllocator,
    PlanFeatureGuard planFeatureGuard,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events,
    ILogger<GenerateCertificatesHandler> logger
) : IRequestHandler<GenerateCertificatesCommand, Result<CertificateIssuanceBatchId>>
{
    public async Task<Result<CertificateIssuanceBatchId>> Handle(GenerateCertificatesCommand command, CancellationToken cancellationToken)
    {
        // Premium gate check
        var featureCheck = await planFeatureGuard.CanGenerateCertificatesAsync(cancellationToken);
        if (!featureCheck.IsAllowed)
        {
            return Result<CertificateIssuanceBatchId>.Forbidden(featureCheck.DenialReason!);
        }

        var tenantId = executionContext.TenantId!;

        // Validate template exists
        var template = await templateRepository.GetByIdAsync(command.TemplateId, cancellationToken);
        if (template is null)
        {
            return Result<CertificateIssuanceBatchId>.NotFound($"Certificate template with id '{command.TemplateId}' not found.");
        }

        // Get all donations for the tax year that have a donor profile
        var taxYearStart = new DateTime(command.TaxYear, 3, 1); // SA tax year: 1 March to 28/29 Feb
        var taxYearEnd = new DateTime(command.TaxYear + 1, 2, 28);
        if (DateTime.IsLeapYear(command.TaxYear + 1)) taxYearEnd = new DateTime(command.TaxYear + 1, 2, 29);

        var allDonations = await donationRepository.GetAllAsync(cancellationToken);
        var donationsWithProfile = allDonations
            .Where(d => d.DonorProfileId is not null && d.DonatedAt >= taxYearStart && d.DonatedAt <= taxYearEnd)
            .ToList();

        if (donationsWithProfile.Count == 0)
        {
            return Result<CertificateIssuanceBatchId>.BadRequest("No eligible donations found for the specified tax year.");
        }

        // Get transaction amounts for these donations
        var transactionIds = donationsWithProfile.Select(d => d.TransactionId).ToArray();
        var donorGroups = donationsWithProfile.GroupBy(d => d.DonorProfileId!).ToList();

        // Create the batch
        var userName = executionContext.UserInfo?.Email ?? "system";
        var batch = CertificateIssuanceBatch.Create(tenantId, command.TaxYear, command.TemplateId, userName);

        // Process each eligible donor
        foreach (var group in donorGroups)
        {
            var donorProfileId = group.Key;
            var donor = await donorProfileRepository.GetByIdAsync(donorProfileId, cancellationToken);
            if (donor is null || !donor.IsCertificateEligible()) continue;

            // Sum successful transaction amounts for this donor's donations
            decimal totalDonated = 0;
            foreach (var donation in group)
            {
                var transaction = await transactionRepository.GetByIdAsync(donation.TransactionId, cancellationToken);
                if (transaction is not null && transaction.Status == TransactionStatus.Success)
                {
                    totalDonated += transaction.AmountNet ?? transaction.Amount;
                }
            }

            if (totalDonated <= 0) continue;

            // Allocate sequential receipt number
            var receiptNumber = await receiptNumberAllocator.NextReceiptNumberAsync(tenantId, command.TaxYear, cancellationToken);

            var donorName = donor.IsCompany
                ? donor.CompanyName ?? "Unknown"
                : $"{donor.FirstName} {donor.LastName}".Trim();

            if (string.IsNullOrWhiteSpace(donorName)) donorName = "Unknown";

            var certificate = batch.AddCertificate(donorProfileId, receiptNumber, totalDonated, donorName);

            // PDF stub: mark as generated with a placeholder URL
            certificate.MarkGenerated($"/certificates/{command.TaxYear}/{receiptNumber}.pdf");

            logger.LogInformation("Generated certificate {ReceiptNumber} for donor {DonorId} — R{Amount:N2}",
                receiptNumber, donorProfileId, totalDonated);
        }

        if (batch.TotalCertificates == 0)
        {
            return Result<CertificateIssuanceBatchId>.BadRequest("No eligible donors found with complete SARS profiles for the specified tax year.");
        }

        batch.MarkCompleted();
        await batchRepository.AddAsync(batch, cancellationToken);

        events.CollectEvent(new CertificateBatchGenerated(batch.Id, batch.TotalCertificates));
        return batch.Id;
    }
}
