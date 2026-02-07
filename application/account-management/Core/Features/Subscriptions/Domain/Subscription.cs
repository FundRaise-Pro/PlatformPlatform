using JetBrains.Annotations;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.StronglyTypedIds;

namespace PlatformPlatform.AccountManagement.Features.Subscriptions.Domain;

[IdPrefix("sub")]
[JsonConverter(typeof(StronglyTypedIdJsonConverter<string, SubscriptionId>))]
public sealed record SubscriptionId(string Value) : StronglyTypedUlid<SubscriptionId>(Value)
{
    public override string ToString() => Value;
}

/// <summary>
///     A Subscription tracks a tenant's billing plan with Stripe.
///     Each tenant has at most one active subscription. Tenants without a subscription are on the Free plan.
/// </summary>
public sealed class Subscription : AggregateRoot<SubscriptionId>
{
    private Subscription(SubscriptionId id, TenantId tenantId, SubscriptionPlan plan) : base(id)
    {
        TenantId = tenantId;
        Plan = plan;
        Status = SubscriptionStatus.Active;
    }

    public TenantId TenantId { get; private init; }

    public string? StripeCustomerId { get; private set; }

    public string? StripeSubscriptionId { get; private set; }

    public SubscriptionPlan Plan { get; private set; }

    public SubscriptionStatus Status { get; private set; }

    public DateTimeOffset? CurrentPeriodStart { get; private set; }

    public DateTimeOffset? CurrentPeriodEnd { get; private set; }

    public DateTimeOffset? CancelledAt { get; private set; }

    public DateTimeOffset? TrialEnd { get; private set; }

    public static Subscription Create(TenantId tenantId, SubscriptionPlan plan = SubscriptionPlan.Free)
    {
        return new Subscription(SubscriptionId.NewId(), tenantId, plan);
    }

    public void ActivateStripe(string stripeCustomerId, string? stripeSubscriptionId,
        DateTimeOffset periodStart, DateTimeOffset periodEnd)
    {
        StripeCustomerId = stripeCustomerId;
        StripeSubscriptionId = stripeSubscriptionId;
        CurrentPeriodStart = periodStart;
        CurrentPeriodEnd = periodEnd;
        Status = SubscriptionStatus.Active;
    }

    public void UpdatePlan(SubscriptionPlan plan)
    {
        Plan = plan;
    }

    public void UpdatePeriod(DateTimeOffset periodStart, DateTimeOffset periodEnd)
    {
        CurrentPeriodStart = periodStart;
        CurrentPeriodEnd = periodEnd;
    }

    public void MarkPastDue()
    {
        Status = SubscriptionStatus.PastDue;
    }

    public void Cancel()
    {
        Status = SubscriptionStatus.Cancelled;
        CancelledAt = DateTimeOffset.UtcNow;
    }

    public void Suspend()
    {
        Status = SubscriptionStatus.Suspended;
    }

    public void Reactivate(SubscriptionPlan plan)
    {
        Status = SubscriptionStatus.Active;
        Plan = plan;
        CancelledAt = null;
    }

    public void SetTrialEnd(DateTimeOffset trialEnd)
    {
        TrialEnd = trialEnd;
    }
}

[PublicAPI]
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum SubscriptionPlan
{
    Free,
    Starter,
    Pro,
    Enterprise
}

[PublicAPI]
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum SubscriptionStatus
{
    Active,
    PastDue,
    Cancelled,
    Suspended,
    Trialing
}
