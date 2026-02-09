using JetBrains.Annotations;

namespace PlatformPlatform.AccountManagement.Features.Subscriptions.Domain;

/// <summary>
///     Defines the feature limits for each subscription plan.
///     These limits are checked by the PlanFeatureGuard in the fundraiser SCS.
/// </summary>
public static class PlanLimits
{
    public static PlanFeatureLimits GetLimits(SubscriptionPlan plan) => plan switch
    {
        SubscriptionPlan.Free => new PlanFeatureLimits(
            DonationPages: 1,
            Forms: 1,
            BlogPosts: 5,
            Branches: 1,
            CustomDomain: false,
            CustomCss: false,
            StorageMb: 100,
            ApiCallsPerMonth: 1_000
        ),
        SubscriptionPlan.Starter => new PlanFeatureLimits(
            DonationPages: 5,
            Forms: 3,
            BlogPosts: 25,
            Branches: 3,
            CustomDomain: false,
            CustomCss: false,
            StorageMb: 1_000,
            ApiCallsPerMonth: 10_000
        ),
        SubscriptionPlan.Pro => new PlanFeatureLimits(
            DonationPages: int.MaxValue,
            Forms: int.MaxValue,
            BlogPosts: int.MaxValue,
            Branches: 10,
            CustomDomain: true,
            CustomCss: false,
            StorageMb: 10_000,
            ApiCallsPerMonth: 100_000
        ),
        SubscriptionPlan.Enterprise => new PlanFeatureLimits(
            DonationPages: int.MaxValue,
            Forms: int.MaxValue,
            BlogPosts: int.MaxValue,
            Branches: int.MaxValue,
            CustomDomain: true,
            CustomCss: true,
            StorageMb: int.MaxValue,
            ApiCallsPerMonth: int.MaxValue
        ),
        _ => GetLimits(SubscriptionPlan.Free)
    };
}

[PublicAPI]
public sealed record PlanFeatureLimits(
    int DonationPages,
    int Forms,
    int BlogPosts,
    int Branches,
    bool CustomDomain,
    bool CustomCss,
    int StorageMb,
    int ApiCallsPerMonth
);
