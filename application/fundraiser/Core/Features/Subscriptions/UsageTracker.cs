using PlatformPlatform.Fundraiser.Features.Subscriptions.Domain;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;

namespace PlatformPlatform.Fundraiser.Features.Subscriptions;

/// <summary>
///     Service for tracking and querying resource usage per tenant.
///     Works with PlanFeatureGuard to enforce plan limits.
/// </summary>
public sealed class UsageTracker(
    IUsageMetricRepository usageMetricRepository,
    IExecutionContext executionContext,
    ILogger<UsageTracker> logger
)
{
    /// <summary>Gets the current count for a resource type, creating the metric if it doesn't exist.</summary>
    public async Task<int> GetCurrentCountAsync(string resourceType, CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();
        if (tenantId is null) return 0;

        var metric = await usageMetricRepository.GetByTenantAndResourceTypeAsync(tenantId, resourceType, cancellationToken);
        return metric?.CurrentCount ?? 0;
    }

    /// <summary>Increments the count for a resource type.</summary>
    public async Task IncrementAsync(string resourceType, CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();
        if (tenantId is null) return;

        var metric = await usageMetricRepository.GetByTenantAndResourceTypeAsync(tenantId, resourceType, cancellationToken);
        if (metric is null)
        {
            metric = UsageMetric.Create(tenantId, resourceType);
            await usageMetricRepository.AddAsync(metric, cancellationToken);
        }

        metric.Increment();
        usageMetricRepository.Update(metric);

        logger.LogDebug("Usage incremented: {ResourceType} = {Count} for tenant {TenantId}", resourceType, metric.CurrentCount, tenantId);
    }

    /// <summary>Decrements the count for a resource type.</summary>
    public async Task DecrementAsync(string resourceType, CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();
        if (tenantId is null) return;

        var metric = await usageMetricRepository.GetByTenantAndResourceTypeAsync(tenantId, resourceType, cancellationToken);
        if (metric is null) return;

        metric.Decrement();
        usageMetricRepository.Update(metric);

        logger.LogDebug("Usage decremented: {ResourceType} = {Count} for tenant {TenantId}", resourceType, metric.CurrentCount, tenantId);
    }

    /// <summary>Sets the count to a specific value (useful for syncing actual counts).</summary>
    public async Task SetCountAsync(string resourceType, int count, CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();
        if (tenantId is null) return;

        var metric = await usageMetricRepository.GetByTenantAndResourceTypeAsync(tenantId, resourceType, cancellationToken);
        if (metric is null)
        {
            metric = UsageMetric.Create(tenantId, resourceType);
            await usageMetricRepository.AddAsync(metric, cancellationToken);
        }

        metric.SetCount(count);
        usageMetricRepository.Update(metric);
    }

    private TenantId? GetTenantId()
    {
        var tenantId = executionContext.TenantId;
        if (tenantId is null)
        {
            logger.LogWarning("No tenant ID in execution context — cannot track usage");
        }

        return tenantId;
    }
}
