using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.AccountManagement.Features.Subscriptions.Domain;

public sealed class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
{
    public void Configure(EntityTypeBuilder<Subscription> builder)
    {
        builder.MapStronglyTypedUuid<Subscription, SubscriptionId>(s => s.Id);
        builder.MapStronglyTypedLongId<Subscription, TenantId>(s => s.TenantId);

        builder.HasIndex(s => s.TenantId).IsUnique();
        builder.HasIndex(s => s.StripeCustomerId);
        builder.HasIndex(s => s.StripeSubscriptionId);
    }
}
