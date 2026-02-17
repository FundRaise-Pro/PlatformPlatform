using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Certificates.Queries;

[PublicAPI]
public sealed record GetCertificateEligibilityQuery(int TaxYear) : IRequest<Result<CertificateEligibilityResponse>>;

[PublicAPI]
public sealed record CertificateEligibilityResponse(
    int TaxYear,
    int TotalDonorsWithProfile,
    int EligibleDonors,
    int IneligibleDonors,
    decimal TotalEligibleAmount,
    DonorEligibilitySummary[] Donors
);

[PublicAPI]
public sealed record DonorEligibilitySummary(
    DonorProfileId DonorProfileId,
    string DonorName,
    bool IsEligible,
    string? IneligibilityReason,
    decimal TotalDonated,
    int DonationCount
);

public sealed class GetCertificateEligibilityHandler(
    IDonationRepository donationRepository,
    ITransactionRepository transactionRepository,
    IDonorProfileRepository donorProfileRepository
) : IRequestHandler<GetCertificateEligibilityQuery, Result<CertificateEligibilityResponse>>
{
    public async Task<Result<CertificateEligibilityResponse>> Handle(GetCertificateEligibilityQuery query, CancellationToken cancellationToken)
    {
        // SA tax year: 1 March to end of February
        var taxYearStart = new DateTime(query.TaxYear, 3, 1);
        var taxYearEnd = new DateTime(query.TaxYear + 1, 2, 28);
        if (DateTime.IsLeapYear(query.TaxYear + 1)) taxYearEnd = new DateTime(query.TaxYear + 1, 2, 29);

        var allDonations = await donationRepository.GetAllAsync(cancellationToken);
        var donationsInYear = allDonations
            .Where(d => d.DonorProfileId is not null && d.DonatedAt >= taxYearStart && d.DonatedAt <= taxYearEnd)
            .GroupBy(d => d.DonorProfileId!)
            .ToList();

        var summaries = new List<DonorEligibilitySummary>();

        foreach (var group in donationsInYear)
        {
            var donorProfileId = group.Key;
            var donor = await donorProfileRepository.GetByIdAsync(donorProfileId, cancellationToken);
            if (donor is null) continue;

            decimal totalDonated = 0;
            var donationCount = 0;

            foreach (var donation in group)
            {
                var transaction = await transactionRepository.GetByIdAsync(donation.TransactionId, cancellationToken);
                if (transaction is not null && transaction.Status == TransactionStatus.Success)
                {
                    totalDonated += transaction.AmountNet ?? transaction.Amount;
                    donationCount++;
                }
            }

            if (totalDonated <= 0) continue;

            var donorName = donor.IsCompany
                ? donor.CompanyName ?? "Unknown"
                : $"{donor.FirstName} {donor.LastName}".Trim();

            if (string.IsNullOrWhiteSpace(donorName)) donorName = "Unknown";

            var isEligible = donor.IsCertificateEligible();
            string? reason = null;
            if (!isEligible)
            {
                if (donor.IsCompany)
                {
                    if (string.IsNullOrWhiteSpace(donor.CompanyName)) reason = "Missing company name";
                    else if (string.IsNullOrWhiteSpace(donor.CompanyRegistration)) reason = "Missing company registration";
                    else reason = "Missing address details";
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(donor.FirstName) || string.IsNullOrWhiteSpace(donor.LastName)) reason = "Missing first or last name";
                    else if (string.IsNullOrWhiteSpace(donor.TaxIdNumber)) reason = "Missing tax ID number";
                    else reason = "Missing address details";
                }
            }

            summaries.Add(new DonorEligibilitySummary(
                donorProfileId, donorName, isEligible, reason, totalDonated, donationCount
            ));
        }

        var eligible = summaries.Where(s => s.IsEligible).ToList();

        return new CertificateEligibilityResponse(
            query.TaxYear,
            summaries.Count,
            eligible.Count,
            summaries.Count - eligible.Count,
            eligible.Sum(s => s.TotalDonated),
            summaries.OrderByDescending(s => s.TotalDonated).ToArray()
        );
    }
}
