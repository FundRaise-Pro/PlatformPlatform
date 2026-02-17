using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.DomainEvents;
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
        TransactionType type, decimal amount, FundraisingTargetType targetType, string targetId) : base(id)
    {
        TenantId = tenantId;
        Name = name;
        Description = description;
        Type = type;
        Amount = amount;
        TargetType = targetType;
        TargetId = targetId;
    }

    public TenantId TenantId { get; private init; }

    public FundraisingTargetType TargetType { get; private init; }

    public string TargetId { get; private init; } = string.Empty;

    public string MerchantReference { get; private set; } = string.Empty;

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

    public DonationChannel Channel { get; private set; } = DonationChannel.Web;

    public DateTime? CompletedAt { get; private set; }

    private readonly List<PaymentProcessingLog> _processingLogs = [];
    public IReadOnlyCollection<PaymentProcessingLog> ProcessingLogs => _processingLogs.AsReadOnly();

    public static Transaction Create(TransactionId id, TenantId tenantId, string name, string description,
        TransactionType type, decimal amount, FundraisingTargetType targetType, string targetId,
        string merchantReference, string? payeeName = null, string? payeeEmail = null,
        PaymentProvider provider = PaymentProvider.PayFast, DonationChannel channel = DonationChannel.Web)
    {
        return new Transaction(id, tenantId, name, description, type, amount, targetType, targetId)
        {
            MerchantReference = merchantReference,
            PayeeName = payeeName,
            PayeeEmail = payeeEmail,
            PaymentProvider = provider,
            Channel = channel
        };
    }

    public void MarkProcessing()
    {
        LogStatusChange(TransactionStatus.Processing);
        Status = TransactionStatus.Processing;
    }

    public void MarkSuccess(string gatewayPaymentId, decimal? fee = null, decimal? net = null, PaymentMethod? method = null)
    {
        if (Status == TransactionStatus.Success) return;
        if (Status is TransactionStatus.Failed or TransactionStatus.Refunded or TransactionStatus.Cancelled)
            throw new InvalidOperationException($"Cannot mark transaction as success when status is {Status}.");

        LogStatusChange(TransactionStatus.Success);
        Status = TransactionStatus.Success;
        GatewayPaymentId = gatewayPaymentId;
        AmountFee = fee;
        AmountNet = net;
        PaymentMethod = method;
        CompletedAt = DateTime.UtcNow;

        AddDomainEvent(new TransactionSucceededDomainEvent(Id, TargetType, TargetId, AmountNet ?? Amount));
    }

    public void MarkFailed()
    {
        LogStatusChange(TransactionStatus.Failed);
        Status = TransactionStatus.Failed;
    }

    public void MarkCancelled()
    {
        LogStatusChange(TransactionStatus.Cancelled);
        Status = TransactionStatus.Cancelled;
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

    // Identity (required for Section 18A certificates)
    public string? FirstName { get; private set; }

    public string? LastName { get; private set; }

    public string? Email { get; private set; }

    public string? PhoneNumber { get; private set; }

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

    public void UpdateProfile(
        string? firstName,
        string? lastName,
        string? email,
        string? phoneNumber,
        string? taxIdNumber,
        string? companyRegistration,
        string? companyName,
        bool isCompany
    )
    {
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        PhoneNumber = phoneNumber;
        TaxIdNumber = taxIdNumber;
        CompanyRegistration = companyRegistration;
        CompanyName = companyName;
        IsCompany = isCompany;
    }

    public void UpdateAddress(string? streetAddress, string? suburb, string? city, string? province, string? postalCode)
    {
        StreetAddress = streetAddress;
        Suburb = suburb;
        City = city;
        Province = province;
        PostalCode = postalCode;
    }

    /// <summary>
    ///     Checks if this donor profile has all required fields for Section 18A tax certificate issuance.
    /// </summary>
    public bool IsCertificateEligible()
    {
        if (IsCompany)
            return !string.IsNullOrWhiteSpace(CompanyName)
                && !string.IsNullOrWhiteSpace(CompanyRegistration)
                && HasValidAddress();

        return !string.IsNullOrWhiteSpace(FirstName)
            && !string.IsNullOrWhiteSpace(LastName)
            && !string.IsNullOrWhiteSpace(TaxIdNumber)
            && HasValidAddress();
    }

    private bool HasValidAddress()
    {
        return !string.IsNullOrWhiteSpace(StreetAddress)
            && !string.IsNullOrWhiteSpace(City)
            && !string.IsNullOrWhiteSpace(PostalCode);
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

// --- Domain Events ---

/// <summary>
///     Raised when a transaction is marked as successful. Handled pre-commit within the same UnitOfWork
///     by the PublishDomainEventsPipelineBehavior, enabling deterministic side effects like auto-funding stories.
/// </summary>
public sealed record TransactionSucceededDomainEvent(
    TransactionId TransactionId,
    FundraisingTargetType TargetType,
    string TargetId,
    decimal SettledAmount
) : IDomainEvent;

// --- Enums ---

/// <summary>
///     The type of fundraising target that a transaction is anchored to.
///     Every transaction must reference exactly one target.
/// </summary>
public enum FundraisingTargetType { Campaign, Story, Event }

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

/// <summary>
///     Tracks how a donation originated for full origin-of-funds traceability.
/// </summary>
public enum DonationChannel { Web, QrCode, EventKiosk, Api, Manual }

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
