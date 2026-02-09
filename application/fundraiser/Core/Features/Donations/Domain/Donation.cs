using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.StronglyTypedIds;

namespace PlatformPlatform.Fundraiser.Features.Donations.Domain;

[IdPrefix("txn")]
public sealed record TransactionId(string Value) : StronglyTypedUlid<TransactionId>(Value);

[IdPrefix("don")]
public sealed record DonationId(string Value) : StronglyTypedUlid<DonationId>(Value);

[IdPrefix("sub")]
public sealed record SubscriptionId(string Value) : StronglyTypedUlid<SubscriptionId>(Value);

[IdPrefix("dnr")]
public sealed record DonorProfileId(string Value) : StronglyTypedUlid<DonorProfileId>(Value);

/// <summary>
///     A Transaction records a payment interaction with the payment gateway.
///     Forms the financial backbone for donations, subscriptions, and application fees.
/// </summary>
public sealed class Transaction : AggregateRoot<TransactionId>, ITenantScopedEntity
{
    private Transaction(TransactionId id, TenantId tenantId, string name, string description,
        TransactionType type, decimal amount) : base(id)
    {
        TenantId = tenantId;
        Name = name;
        Description = description;
        Type = type;
        Amount = amount;
    }

    public TenantId TenantId { get; private init; }

    public PaymentProvider PaymentProvider { get; private set; } = PaymentProvider.PayFast;

    public string? GatewayPaymentId { get; private set; }

    public string? PayeeName { get; private set; }

    public string? PayeeEmail { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string Description { get; private set; } = string.Empty;

    public TransactionType Type { get; private set; }

    public TransactionStatus Status { get; private set; } = TransactionStatus.Pending;

    public decimal Amount { get; private set; }

    public decimal? AmountFee { get; private set; }

    public decimal? AmountNet { get; private set; }

    public PaymentMethod? PaymentMethod { get; private set; }

    public DateTime? CompletedAt { get; private set; }

    private readonly List<PaymentProcessingLog> _processingLogs = [];
    public IReadOnlyCollection<PaymentProcessingLog> ProcessingLogs => _processingLogs.AsReadOnly();

    public static Transaction Create(TenantId tenantId, string name, string description,
        TransactionType type, decimal amount, string? payeeName = null, string? payeeEmail = null,
        PaymentProvider provider = PaymentProvider.PayFast)
    {
        return new Transaction(TransactionId.NewId(), tenantId, name, description, type, amount)
        {
            PayeeName = payeeName,
            PayeeEmail = payeeEmail,
            PaymentProvider = provider
        };
    }

    public void MarkProcessing()
    {
        LogStatusChange(TransactionStatus.Processing);
        Status = TransactionStatus.Processing;
    }

    public void MarkSuccess(string gatewayPaymentId, decimal? fee = null, decimal? net = null, PaymentMethod? method = null)
    {
        LogStatusChange(TransactionStatus.Success);
        Status = TransactionStatus.Success;
        GatewayPaymentId = gatewayPaymentId;
        AmountFee = fee;
        AmountNet = net;
        PaymentMethod = method;
        CompletedAt = DateTime.UtcNow;
    }

    public void MarkFailed()
    {
        LogStatusChange(TransactionStatus.Failed);
        Status = TransactionStatus.Failed;
    }

    public void Refund()
    {
        LogStatusChange(TransactionStatus.Refunded);
        Status = TransactionStatus.Refunded;
    }

    private void LogStatusChange(TransactionStatus newStatus)
    {
        _processingLogs.Add(new PaymentProcessingLog(Status, newStatus));
    }
}

/// <summary>
///     A Donation records a one-time or recurring financial contribution from a donor.
/// </summary>
public sealed class Donation : AggregateRoot<DonationId>, ITenantScopedEntity
{
    private Donation(DonationId id, TenantId tenantId, TransactionId transactionId) : base(id)
    {
        TenantId = tenantId;
        TransactionId = transactionId;
    }

    public TenantId TenantId { get; private init; }

    public TransactionId TransactionId { get; private init; }

    public bool IsRecurring { get; private set; }

    public string? Message { get; private set; }

    public bool IsAnonymous { get; private set; }

    public DonorProfileId? DonorProfileId { get; private set; }

    public DateTime? DonatedAt { get; private set; }

    public static Donation Create(TenantId tenantId, TransactionId transactionId,
        bool isRecurring = false, string? message = null, bool isAnonymous = false, DonorProfileId? donorProfileId = null)
    {
        return new Donation(DonationId.NewId(), tenantId, transactionId)
        {
            IsRecurring = isRecurring,
            Message = message,
            IsAnonymous = isAnonymous,
            DonorProfileId = donorProfileId,
            DonatedAt = DateTime.UtcNow
        };
    }
}

/// <summary>
///     A DonorProfile stores tax certificate (Section 18A) details for recurring donors.
/// </summary>
public sealed class DonorProfile : AggregateRoot<DonorProfileId>, ITenantScopedEntity
{
    private DonorProfile(DonorProfileId id, TenantId tenantId) : base(id)
    {
        TenantId = tenantId;
    }

    public TenantId TenantId { get; private init; }

    public string? TaxIdNumber { get; private set; }

    public string? CompanyRegistration { get; private set; }

    public string? CompanyName { get; private set; }

    public bool IsCompany { get; private set; }

    // Address
    public string? StreetAddress { get; private set; }

    public string? Suburb { get; private set; }

    public string? City { get; private set; }

    public string? Province { get; private set; }

    public string? PostalCode { get; private set; }

    public string Country { get; private set; } = "South Africa";

    // Preferences
    public bool PreferEmailCommunication { get; private set; } = true;

    public bool PreferSmsCommunication { get; private set; }

    public static DonorProfile Create(TenantId tenantId, string? taxIdNumber = null, bool isCompany = false)
    {
        return new DonorProfile(DonorProfileId.NewId(), tenantId)
        {
            TaxIdNumber = taxIdNumber,
            IsCompany = isCompany
        };
    }

    public void UpdateAddress(string? streetAddress, string? suburb, string? city, string? province, string? postalCode)
    {
        StreetAddress = streetAddress;
        Suburb = suburb;
        City = city;
        Province = province;
        PostalCode = postalCode;
    }
}

/// <summary>
///     A recurring payment subscription managed through the payment gateway.
/// </summary>
public sealed class PaymentSubscription : AggregateRoot<SubscriptionId>, ITenantScopedEntity
{
    private PaymentSubscription(SubscriptionId id, TenantId tenantId, decimal recurringAmount, string itemName) : base(id)
    {
        TenantId = tenantId;
        RecurringAmount = recurringAmount;
        ItemName = itemName;
    }

    public TenantId TenantId { get; private init; }

    public string? GatewayToken { get; private set; }

    public decimal InitialAmount { get; private set; }

    public decimal RecurringAmount { get; private set; }

    public string Currency { get; private set; } = "ZAR";

    public int BillingDate { get; private set; }

    public int Frequency { get; private set; } = 1; // 1=Monthly, 3=Quarterly, 6=Biannually

    public int? Cycles { get; private set; }

    public DateTime? NextRunDate { get; private set; }

    public SubscriptionStatus Status { get; private set; } = SubscriptionStatus.Pending;

    public string ItemName { get; private set; } = string.Empty;

    public string? ItemDescription { get; private set; }

    public DonorProfileId? DonorProfileId { get; private set; }

    public DateTime? CancelledAt { get; private set; }

    public DateTime? CompletedAt { get; private set; }

    public static PaymentSubscription Create(TenantId tenantId, decimal recurringAmount, string itemName,
        int billingDate = 1, int frequency = 1, int? cycles = null)
    {
        return new PaymentSubscription(SubscriptionId.NewId(), tenantId, recurringAmount, itemName)
        {
            BillingDate = billingDate,
            Frequency = frequency,
            Cycles = cycles
        };
    }

    public void Activate(string gatewayToken)
    {
        GatewayToken = gatewayToken;
        Status = SubscriptionStatus.Active;
    }

    public void Cancel(CancellationSource source)
    {
        Status = SubscriptionStatus.Cancelled;
        CancelledAt = DateTime.UtcNow;
    }
}

// Enums
public enum TransactionType { Donation, Subscription, ApplicationFee }

public enum TransactionStatus { Pending, Processing, Success, Failed, Refunded, ManualReview, Cancelled }

public enum PaymentMethod
{
    Eft, CreditCard, DebitCard, Masterpass, Mobicred, SCode, SnapScan,
    Zapper, MoreTyme, StoreCard, Mukuru, ApplePay, SamsungPay, CapitecPay, GooglePay
}

public enum PaymentProvider { PayFast, Stripe, PayPal }

public enum SubscriptionStatus { Pending, Active, Cancelled, Completed, Failed, Suspended }

public enum CancellationSource { User, PayFast, Stripe, PayPal, Admin }

// Value objects / child entities
public sealed class PaymentProcessingLog
{
    public Guid Id { get; private init; } = Guid.NewGuid();
    public TransactionStatus PreviousStatus { get; private set; }
    public TransactionStatus NewStatus { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    internal PaymentProcessingLog(TransactionStatus previousStatus, TransactionStatus newStatus)
    {
        PreviousStatus = previousStatus;
        NewStatus = newStatus;
    }

    private PaymentProcessingLog() { } // EF Core
}
