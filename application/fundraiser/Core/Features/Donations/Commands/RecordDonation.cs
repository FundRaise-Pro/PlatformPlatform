using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Donations.Commands;

[PublicAPI]
public sealed record RecordDonationCommand : ICommand, IRequest<Result<DonationId>>
{
    public required TransactionId TransactionId { get; init; }

    public bool IsRecurring { get; init; }

    public string? Message { get; init; }

    public bool IsAnonymous { get; init; }

    public DonorProfileId? DonorProfileId { get; init; }
}

public sealed class RecordDonationValidator : AbstractValidator<RecordDonationCommand>
{
    public RecordDonationValidator()
    {
        RuleFor(x => x.Message).MaximumLength(1000);
    }
}

public sealed class RecordDonationHandler(
    IDonationRepository donationRepository,
    ITransactionRepository transactionRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<RecordDonationCommand, Result<DonationId>>
{
    public async Task<Result<DonationId>> Handle(RecordDonationCommand command, CancellationToken cancellationToken)
    {
        var transaction = await transactionRepository.GetByIdAsync(command.TransactionId, cancellationToken);
        if (transaction is null) return Result<DonationId>.NotFound($"Transaction with id '{command.TransactionId}' not found.");

        var donation = Donation.Create(
            executionContext.TenantId!, command.TransactionId,
            command.IsRecurring, command.Message, command.IsAnonymous, command.DonorProfileId
        );

        await donationRepository.AddAsync(donation, cancellationToken);

        events.CollectEvent(new DonationRecorded(donation.Id, command.IsRecurring));
        return donation.Id;
    }
}
