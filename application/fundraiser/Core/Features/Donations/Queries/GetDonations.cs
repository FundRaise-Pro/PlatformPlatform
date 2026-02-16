using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Donations.Queries;

// --- Transaction Queries ---
[PublicAPI]
public sealed record GetTransactionsQuery : IRequest<Result<TransactionSummaryResponse[]>>;

[PublicAPI]
public sealed record TransactionSummaryResponse(
    TransactionId Id, string Name, TransactionType Type, TransactionStatus Status,
    decimal Amount, string? PayeeName, DateTime? CompletedAt, DateTimeOffset CreatedAt
);

[PublicAPI]
public sealed record GetTransactionQuery(TransactionId Id) : IRequest<Result<TransactionResponse>>;

[PublicAPI]
public sealed record TransactionResponse(
    TransactionId Id, string Name, string Description, TransactionType Type,
    TransactionStatus Status, PaymentProvider PaymentProvider, string? GatewayPaymentId,
    string? PayeeName, string? PayeeEmail, decimal Amount, decimal? AmountFee, decimal? AmountNet,
    PaymentMethod? PaymentMethod, FundraisingTargetType TargetType, string? TargetId,
    string? MerchantReference, DateTime? CompletedAt, DateTimeOffset CreatedAt, DateTimeOffset? ModifiedAt,
    PaymentProcessingLogResponse[] ProcessingLogs
);

[PublicAPI]
public sealed record PaymentProcessingLogResponse(Guid Id, TransactionStatus PreviousStatus, TransactionStatus NewStatus, DateTime CreatedAt);

// --- Donation Queries ---
[PublicAPI]
public sealed record GetDonationsQuery : IRequest<Result<DonationSummaryResponse[]>>;

[PublicAPI]
public sealed record DonationSummaryResponse(
    DonationId Id, TransactionId TransactionId, bool IsRecurring, bool IsAnonymous,
    DateTime? DonatedAt, DateTimeOffset CreatedAt
);

// --- Subscription Queries ---
[PublicAPI]
public sealed record GetSubscriptionsQuery : IRequest<Result<SubscriptionSummaryResponse[]>>;

[PublicAPI]
public sealed record SubscriptionSummaryResponse(
    SubscriptionId Id, string ItemName, decimal RecurringAmount, string Currency,
    SubscriptionStatus Status, int Frequency, DateTime? NextRunDate, DateTimeOffset CreatedAt
);

// --- Handlers ---
public sealed class GetTransactionsHandler(ITransactionRepository transactionRepository)
    : IRequestHandler<GetTransactionsQuery, Result<TransactionSummaryResponse[]>>
{
    public async Task<Result<TransactionSummaryResponse[]>> Handle(GetTransactionsQuery query, CancellationToken cancellationToken)
    {
        var transactions = await transactionRepository.GetAllAsync(cancellationToken);

        return transactions.Select(t => new TransactionSummaryResponse(
            t.Id, t.Name, t.Type, t.Status, t.Amount, t.PayeeName, t.CompletedAt, t.CreatedAt
        )).ToArray();
    }
}

public sealed class GetTransactionHandler(ITransactionRepository transactionRepository)
    : IRequestHandler<GetTransactionQuery, Result<TransactionResponse>>
{
    public async Task<Result<TransactionResponse>> Handle(GetTransactionQuery query, CancellationToken cancellationToken)
    {
        var t = await transactionRepository.GetByIdAsync(query.Id, cancellationToken);
        if (t is null) return Result<TransactionResponse>.NotFound($"Transaction with id '{query.Id}' not found.");

        return new TransactionResponse(
            t.Id, t.Name, t.Description, t.Type, t.Status, t.PaymentProvider, t.GatewayPaymentId,
            t.PayeeName, t.PayeeEmail, t.Amount, t.AmountFee, t.AmountNet, t.PaymentMethod,
            t.TargetType, t.TargetId, t.MerchantReference,
            t.CompletedAt, t.CreatedAt, t.ModifiedAt,
            t.ProcessingLogs.Select(p => new PaymentProcessingLogResponse(p.Id, p.PreviousStatus, p.NewStatus, p.CreatedAt)).ToArray()
        );
    }
}

public sealed class GetDonationsHandler(IDonationRepository donationRepository)
    : IRequestHandler<GetDonationsQuery, Result<DonationSummaryResponse[]>>
{
    public async Task<Result<DonationSummaryResponse[]>> Handle(GetDonationsQuery query, CancellationToken cancellationToken)
    {
        var donations = await donationRepository.GetAllAsync(cancellationToken);

        return donations.Select(d => new DonationSummaryResponse(
            d.Id, d.TransactionId, d.IsRecurring, d.IsAnonymous, d.DonatedAt, d.CreatedAt
        )).ToArray();
    }
}

public sealed class GetSubscriptionsHandler(IPaymentSubscriptionRepository subscriptionRepository)
    : IRequestHandler<GetSubscriptionsQuery, Result<SubscriptionSummaryResponse[]>>
{
    public async Task<Result<SubscriptionSummaryResponse[]>> Handle(GetSubscriptionsQuery query, CancellationToken cancellationToken)
    {
        var subs = await subscriptionRepository.GetActiveAsync(cancellationToken);

        return subs.Select(s => new SubscriptionSummaryResponse(
            s.Id, s.ItemName, s.RecurringAmount, s.Currency, s.Status, s.Frequency, s.NextRunDate, s.CreatedAt
        )).ToArray();
    }
}
