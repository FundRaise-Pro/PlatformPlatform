using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.Fundraiser.Features.Events.Domain;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.Fundraiser.Features.Events.Domain;

public sealed class FundraisingEventConfiguration : IEntityTypeConfiguration<FundraisingEvent>
{
    public void Configure(EntityTypeBuilder<FundraisingEvent> builder)
    {
        builder.MapStronglyTypedUuid<FundraisingEvent, FundraisingEventId>(e => e.Id);
        builder.MapStronglyTypedLongId<FundraisingEvent, TenantId>(e => e.TenantId);

        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Slug).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Description).IsRequired();
        builder.Property(e => e.Location).HasMaxLength(300);
        builder.Property(e => e.TargetAmount).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Status).HasMaxLength(50);
        builder.Property(e => e.ImageUrl).HasMaxLength(500);

        builder.MapStronglyTypedNullableId<FundraisingEvent, CampaignId, string>(e => e.CampaignId);

        builder.HasIndex(e => new { e.TenantId, e.Slug });
        builder.HasIndex(e => new { e.TenantId, e.CampaignId });
    }
}
