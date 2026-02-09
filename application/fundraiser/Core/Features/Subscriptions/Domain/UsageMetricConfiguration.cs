using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.Fundraiser.Features.Subscriptions.Domain;

public sealed class UsageMetricConfiguration : IEntityTypeConfiguration<UsageMetric>
{
    public void Configure(EntityTypeBuilder<UsageMetric> builder)
    {
        builder.MapStronglyTypedUuid<UsageMetric, UsageMetricId>(b => b.Id);
        builder.MapStronglyTypedLongId<UsageMetric, TenantId>(b => b.TenantId);

        builder.HasIndex(e => new { e.TenantId, e.ResourceType }).IsUnique();
    }
}
