using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.Fundraiser.Features.Campaigns.Domain;

public sealed class CampaignConfiguration : IEntityTypeConfiguration<Campaign>
{
    public void Configure(EntityTypeBuilder<Campaign> builder)
    {
        builder.MapStronglyTypedUuid<Campaign, CampaignId>(c => c.Id);
        builder.MapStronglyTypedLongId<Campaign, TenantId>(c => c.TenantId);

        builder.Property(c => c.Title).HasMaxLength(200).IsRequired();
        builder.Property(c => c.Content).IsRequired();
        builder.Property(c => c.Summary).HasMaxLength(2000);
        builder.Property(c => c.FeaturedImageUrl).HasMaxLength(500);
        builder.Property(c => c.ExternalFundingUrl).HasMaxLength(500);
        builder.Property(c => c.Status).HasMaxLength(50);

        builder.OwnsMany(c => c.Images, b =>
        {
            b.WithOwner().HasForeignKey("CampaignId");
            b.Property(i => i.BlobUrl).HasMaxLength(1000).IsRequired();
            b.Property(i => i.BlobName).HasMaxLength(500).IsRequired();
            b.Property(i => i.MimeType).HasMaxLength(100).IsRequired();
        });

        builder.OwnsMany(c => c.Tags, b =>
        {
            b.WithOwner().HasForeignKey("CampaignId");
            b.Property(t => t.Tag).HasMaxLength(50).IsRequired();
        });
    }
}
