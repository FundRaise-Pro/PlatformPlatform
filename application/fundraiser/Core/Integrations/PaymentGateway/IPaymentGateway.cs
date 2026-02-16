using PlatformPlatform.Fundraiser.Features.Donations.Domain;

namespace PlatformPlatform.Fundraiser.Integrations.PaymentGateway;

/// <summary>
///     Abstracts donation payment processing so tenants can choose their payment provider.
///     This is for tenant-facing donation collection, not platform billing.
/// </summary>
public interface IPaymentGateway
{
    /// <summary>Returns the provider this gateway handles.</summary>
    PaymentProvider Provider { get; }

    /// <summary>Initiates a payment and returns a redirect URL for the donor + a gateway-assigned reference.</summary>
    Task<PaymentInitiationResult?> InitiatePaymentAsync(PaymentRequest request, CancellationToken cancellationToken);

    /// <summary>Verifies a payment notification/webhook from the gateway.</summary>
    Task<PaymentVerificationResult?> VerifyPaymentAsync(string gatewayPaymentId, CancellationToken cancellationToken);

    /// <summary>Creates a recurring subscription and returns the gateway token.</summary>
    Task<SubscriptionResult?> CreateSubscriptionAsync(SubscriptionRequest request, CancellationToken cancellationToken);

    /// <summary>Cancels an active subscription.</summary>
    Task<bool> CancelSubscriptionAsync(string gatewayToken, CancellationToken cancellationToken);

    /// <summary>Processes a refund for a completed payment.</summary>
    Task<RefundResult?> ProcessRefundAsync(string gatewayPaymentId, decimal amount, CancellationToken cancellationToken);
}

public sealed record PaymentRequest(
    decimal Amount,
    string Currency,
    string ItemName,
    string? ItemDescription,
    string MerchantReference,
    string ReturnUrl,
    string CancelUrl,
    string NotifyUrl,
    string? PayeeName,
    string? PayeeEmail
);

public sealed record PaymentInitiationResult(
    string GatewayPaymentId,
    string RedirectUrl,
    IReadOnlyDictionary<string, string>? FormFields = null
);

public sealed record PaymentVerificationResult(
    string GatewayPaymentId,
    bool IsSuccessful,
    decimal? Amount,
    decimal? Fee,
    decimal? Net,
    PaymentMethod? Method
);

public sealed record SubscriptionRequest(
    decimal RecurringAmount,
    string Currency,
    string ItemName,
    string? ItemDescription,
    int BillingDate,
    int Frequency,
    int? Cycles,
    string ReturnUrl,
    string CancelUrl,
    string NotifyUrl
);

public sealed record SubscriptionResult(
    string GatewayToken,
    string? GatewaySubscriptionId
);

public sealed record RefundResult(
    string RefundId,
    bool IsSuccessful,
    decimal AmountRefunded
);
