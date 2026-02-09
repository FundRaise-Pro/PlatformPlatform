using JetBrains.Annotations;
using PlatformPlatform.AccountManagement.Features.Subscriptions.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;

namespace PlatformPlatform.AccountManagement.Features.Subscriptions.Queries;

[PublicAPI]
public sealed record GetPlanLimitsQuery : IRequest<Result<PlanLimitsResponse>>;

[PublicAPI]
public sealed record PlanLimitsResponse(
    SubscriptionPlan CurrentPlan,
    PlanFeatureLimits CurrentLimits,
    PlanFeatureLimits FreeLimits,
    PlanFeatureLimits StarterLimits,
    PlanFeatureLimits ProLimits,
    PlanFeatureLimits EnterpriseLimits
);

public sealed class GetPlanLimitsHandler(
    ISubscriptionRepository subscriptionRepository,
    IExecutionContext executionContext
) : IRequestHandler<GetPlanLimitsQuery, Result<PlanLimitsResponse>>
{
    public async Task<Result<PlanLimitsResponse>> Handle(GetPlanLimitsQuery query, CancellationToken cancellationToken)
    {
        var tenantId = executionContext.TenantId;
        if (tenantId is null) return Result<PlanLimitsResponse>.Forbidden("No tenant context.");

        var subscription = await subscriptionRepository.GetByTenantIdAsync(tenantId, cancellationToken);

        var currentPlan = subscription?.Plan ?? SubscriptionPlan.Free;

        return new PlanLimitsResponse(
            currentPlan,
            PlanLimits.GetLimits(currentPlan),
            PlanLimits.GetLimits(SubscriptionPlan.Free),
            PlanLimits.GetLimits(SubscriptionPlan.Starter),
            PlanLimits.GetLimits(SubscriptionPlan.Pro),
            PlanLimits.GetLimits(SubscriptionPlan.Enterprise)
        );
    }
}
