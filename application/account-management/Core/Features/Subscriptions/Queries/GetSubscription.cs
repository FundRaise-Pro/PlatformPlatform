using JetBrains.Annotations;
using PlatformPlatform.AccountManagement.Features.Subscriptions.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;

namespace PlatformPlatform.AccountManagement.Features.Subscriptions.Queries;

[PublicAPI]
public sealed record GetSubscriptionQuery : IRequest<Result<SubscriptionResponse>>;

[PublicAPI]
public sealed record SubscriptionResponse(
    SubscriptionId Id,
    TenantId TenantId,
    SubscriptionPlan Plan,
    SubscriptionStatus Status,
    DateTimeOffset? CurrentPeriodStart,
    DateTimeOffset? CurrentPeriodEnd,
    DateTimeOffset? TrialEnd,
    DateTimeOffset? CancelledAt,
    bool HasStripeSubscription,
    PlanFeatureLimits Limits
);

public sealed class GetSubscriptionHandler(
    ISubscriptionRepository subscriptionRepository,
    IExecutionContext executionContext
) : IRequestHandler<GetSubscriptionQuery, Result<SubscriptionResponse>>
{
    public async Task<Result<SubscriptionResponse>> Handle(GetSubscriptionQuery query, CancellationToken cancellationToken)
    {
        var tenantId = executionContext.TenantId;
        if (tenantId is null) return Result<SubscriptionResponse>.Forbidden("No tenant context.");

        var subscription = await subscriptionRepository.GetByTenantIdAsync(tenantId, cancellationToken);

        if (subscription is null)
        {
            return Result<SubscriptionResponse>.NotFound("No subscription found for tenant.");
        }

        var limits = PlanLimits.GetLimits(subscription.Plan);

        return new SubscriptionResponse(
            subscription.Id,
            subscription.TenantId,
            subscription.Plan,
            subscription.Status,
            subscription.CurrentPeriodStart,
            subscription.CurrentPeriodEnd,
            subscription.TrialEnd,
            subscription.CancelledAt,
            subscription.StripeSubscriptionId is not null,
            limits
        );
    }
}
