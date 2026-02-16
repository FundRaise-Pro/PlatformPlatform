using Microsoft.Extensions.Caching.Memory;
using PlatformPlatform.Fundraiser.Integrations.AccountManagement;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;

namespace PlatformPlatform.Fundraiser.Features.Subscriptions;

/// <summary>
///     Guards feature access based on the tenant's current subscription plan.
///     Caches subscription info to avoid excessive cross-SCS calls.
///     Inject this service into command handlers that need to enforce plan limits.
/// </summary>
public sealed class PlanFeatureGuard(
    AccountManagementClient accountManagementClient,
    IExecutionContext executionContext,
    IMemoryCache memoryCache,
    ILogger<PlanFeatureGuard> logger
)
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

    /// <summary>Checks if the tenant can create more donation pages.</summary>
    public async Task<FeatureCheckResult> CanCreateDonationPageAsync(int currentCount, CancellationToken cancellationToken)
    {
        var info = await GetSubscriptionInfoAsync(cancellationToken);
        if (info is null) return FeatureCheckResult.Allowed(); // Fail open if subscription service unavailable

        if (info.MaxDonationPages != int.MaxValue && currentCount >= info.MaxDonationPages)
        {
            return FeatureCheckResult.Denied($"Your '{info.Plan}' plan allows a maximum of {info.MaxDonationPages} donation pages. Please upgrade to create more.");
        }

        return FeatureCheckResult.Allowed();
    }

    /// <summary>Checks if the tenant can create more forms.</summary>
    public async Task<FeatureCheckResult> CanCreateFormAsync(int currentCount, CancellationToken cancellationToken)
    {
        var info = await GetSubscriptionInfoAsync(cancellationToken);
        if (info is null) return FeatureCheckResult.Allowed();

        if (info.MaxForms != int.MaxValue && currentCount >= info.MaxForms)
        {
            return FeatureCheckResult.Denied($"Your '{info.Plan}' plan allows a maximum of {info.MaxForms} forms. Please upgrade to create more.");
        }

        return FeatureCheckResult.Allowed();
    }

    /// <summary>Checks if the tenant can create more blog posts.</summary>
    public async Task<FeatureCheckResult> CanCreateBlogPostAsync(int currentCount, CancellationToken cancellationToken)
    {
        var info = await GetSubscriptionInfoAsync(cancellationToken);
        if (info is null) return FeatureCheckResult.Allowed();

        if (info.MaxBlogPosts != int.MaxValue && currentCount >= info.MaxBlogPosts)
        {
            return FeatureCheckResult.Denied($"Your '{info.Plan}' plan allows a maximum of {info.MaxBlogPosts} blog posts. Please upgrade to create more.");
        }

        return FeatureCheckResult.Allowed();
    }

    /// <summary>Checks if the tenant can create more branches.</summary>
    public async Task<FeatureCheckResult> CanCreateBranchAsync(int currentCount, CancellationToken cancellationToken)
    {
        var info = await GetSubscriptionInfoAsync(cancellationToken);
        if (info is null) return FeatureCheckResult.Allowed();

        if (info.MaxBranches != int.MaxValue && currentCount >= info.MaxBranches)
        {
            return FeatureCheckResult.Denied($"Your '{info.Plan}' plan allows a maximum of {info.MaxBranches} branches. Please upgrade to create more.");
        }

        return FeatureCheckResult.Allowed();
    }

    /// <summary>Checks if the tenant can use a custom domain.</summary>
    public async Task<FeatureCheckResult> CanUseCustomDomainAsync(CancellationToken cancellationToken)
    {
        var info = await GetSubscriptionInfoAsync(cancellationToken);
        if (info is null) return FeatureCheckResult.Allowed();

        if (!info.CustomDomain)
        {
            return FeatureCheckResult.Denied($"Custom domains are not available on the '{info.Plan}' plan. Please upgrade to Pro or Enterprise.");
        }

        return FeatureCheckResult.Allowed();
    }

    /// <summary>Checks if the tenant can use custom CSS.</summary>
    public async Task<FeatureCheckResult> CanUseCustomCssAsync(CancellationToken cancellationToken)
    {
        var info = await GetSubscriptionInfoAsync(cancellationToken);
        if (info is null) return FeatureCheckResult.Allowed();

        if (!info.CustomCss)
        {
            return FeatureCheckResult.Denied($"Custom CSS is not available on the '{info.Plan}' plan. Please upgrade to Enterprise.");
        }

        return FeatureCheckResult.Allowed();
    }

    /// <summary>Checks if the tenant can generate Section 18A tax certificates.</summary>
    public async Task<FeatureCheckResult> CanGenerateCertificatesAsync(CancellationToken cancellationToken)
    {
        var info = await GetSubscriptionInfoAsync(cancellationToken);
        if (info is null) return FeatureCheckResult.Allowed();

        if (!info.CertificatesEnabled)
        {
            return FeatureCheckResult.Denied($"Tax certificate generation is not available on the '{info.Plan}' plan. Please upgrade to Pro or Enterprise.");
        }

        return FeatureCheckResult.Allowed();
    }

    /// <summary>Gets the full subscription info for the current tenant (cached).</summary>
    public async Task<SubscriptionInfo?> GetSubscriptionInfoAsync(CancellationToken cancellationToken)
    {
        var tenantId = executionContext.TenantId;
        if (tenantId is null)
        {
            logger.LogWarning("No tenant ID in execution context — cannot check plan limits");
            return null;
        }

        var cacheKey = $"plan-feature-guard:{tenantId}";

        if (memoryCache.TryGetValue(cacheKey, out SubscriptionInfo? cached))
        {
            return cached;
        }

        var info = await accountManagementClient.GetSubscriptionInfoAsync(tenantId, cancellationToken);

        if (info is not null)
        {
            memoryCache.Set(cacheKey, info, CacheDuration);
        }

        return info;
    }
}

/// <summary>Result of a feature access check.</summary>
public sealed record FeatureCheckResult
{
    public bool IsAllowed { get; private init; }

    public string? DenialReason { get; private init; }

    public static FeatureCheckResult Allowed() => new() { IsAllowed = true };

    public static FeatureCheckResult Denied(string reason) => new() { IsAllowed = false, DenialReason = reason };
}
