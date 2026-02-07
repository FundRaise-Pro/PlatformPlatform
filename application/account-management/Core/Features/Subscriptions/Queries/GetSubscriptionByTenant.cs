using PlatformPlatform.AccountManagement.Features.Subscriptions.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;

namespace PlatformPlatform.AccountManagement.Features.Subscriptions.Queries;

/// <summary>
///     Internal query for cross-SCS subscription lookup. Used by other services (e.g., fundraiser)
///     to check tenant plan limits via internal API.
/// </summary>
public sealed record GetSubscriptionByTenantQuery(TenantId TenantId) : IRequest<Result<SubscriptionInfoResponse>>;

public sealed record SubscriptionInfoResponse(
    SubscriptionPlan Plan,
    SubscriptionStatus Status,
    int MaxDonationPages,
    int MaxForms,
    int MaxBlogPosts,
    int MaxBranches,
    bool CustomDomain,
    bool CustomCss,
    int StorageMb,
    int ApiCallsPerMonth
);

internal sealed class GetSubscriptionByTenantHandler(ISubscriptionRepository subscriptionRepository)
    : IRequestHandler<GetSubscriptionByTenantQuery, Result<SubscriptionInfoResponse>>
{
    public async Task<Result<SubscriptionInfoResponse>> Handle(GetSubscriptionByTenantQuery query, CancellationToken cancellationToken)
    {
        var subscription = await subscriptionRepository.GetByTenantIdAsync(query.TenantId, cancellationToken);

        var plan = subscription?.Plan ?? SubscriptionPlan.Free;
        var status = subscription?.Status ?? SubscriptionStatus.Active;
        var limits = PlanLimits.GetLimits(plan);

        return new SubscriptionInfoResponse(
            plan,
            status,
            limits.DonationPages,
            limits.Forms,
            limits.BlogPosts,
            limits.Branches,
            limits.CustomDomain,
            limits.CustomCss,
            limits.StorageMb,
            limits.ApiCallsPerMonth
        );
    }
}
