using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.DomainEvents;
using PlatformPlatform.SharedKernel.StronglyTypedIds;

namespace PlatformPlatform.Fundraiser.Features.Subscriptions.Domain;

[IdPrefix("umtr")]
[JsonConverter(typeof(StronglyTypedIdJsonConverter<string, UsageMetricId>))]
public sealed record UsageMetricId(string Value) : StronglyTypedUlid<UsageMetricId>(Value)
{
    public override string ToString() => Value;
}

/// <summary>
///     Tracks per-tenant resource usage for plan limit enforcement.
///     Each record captures the current count of a specific resource type for a tenant.
/// </summary>
public sealed class UsageMetric : AggregateRoot<UsageMetricId>, ITenantScopedEntity
{
    private UsageMetric(TenantId tenantId, string resourceType) : base(UsageMetricId.NewId())
    {
        TenantId = tenantId;
        ResourceType = resourceType;
        CurrentCount = 0;
        LastUpdatedAt = DateTimeOffset.UtcNow;
    }

    public TenantId TenantId { get; private set; }

    public string ResourceType { get; private set; }

    public int CurrentCount { get; private set; }

    public DateTimeOffset LastUpdatedAt { get; private set; }

    public static UsageMetric Create(TenantId tenantId, string resourceType)
    {
        return new UsageMetric(tenantId, resourceType);
    }

    public void Increment()
    {
        CurrentCount++;
        LastUpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Decrement()
    {
        if (CurrentCount > 0) CurrentCount--;
        LastUpdatedAt = DateTimeOffset.UtcNow;
    }

    public void SetCount(int count)
    {
        CurrentCount = count;
        LastUpdatedAt = DateTimeOffset.UtcNow;
    }
}

/// <summary>Well-known resource type constants for usage tracking.</summary>
public static class ResourceTypes
{
    public const string DonationPages = "donation_pages";
    public const string Forms = "forms";
    public const string BlogPosts = "blog_posts";
    public const string Branches = "branches";
    public const string StorageBytes = "storage_bytes";
    public const string ApiCalls = "api_calls";
}
