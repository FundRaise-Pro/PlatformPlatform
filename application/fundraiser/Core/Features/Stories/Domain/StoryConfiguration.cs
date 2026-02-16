using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.Fundraiser.Features.Stories.Domain;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.Fundraiser.Features.Stories.Domain;

public sealed class StoryConfiguration : IEntityTypeConfiguration<Story>
{
    public void Configure(EntityTypeBuilder<Story> builder)
    {
        builder.MapStronglyTypedUuid<Story, StoryId>(s => s.Id);
        builder.MapStronglyTypedLongId<Story, TenantId>(s => s.TenantId);

        builder.Property(s => s.Title).HasMaxLength(200).IsRequired();
        builder.Property(s => s.Slug).HasMaxLength(200).IsRequired();
        builder.Property(s => s.Content).IsRequired();
        builder.Property(s => s.Summary).HasMaxLength(2000);
        builder.Property(s => s.FeaturedImageUrl).HasMaxLength(500);
        builder.Property(s => s.GoalAmount).HasColumnType("decimal(18,2)");
        builder.Property(s => s.FundraisingStatus).HasMaxLength(50);
        builder.Property(s => s.FulfilmentStatus).HasMaxLength(50);

        builder.MapStronglyTypedNullableId<Story, CampaignId, string>(s => s.CampaignId);

        builder.HasIndex(s => new { s.TenantId, s.Slug });
        builder.HasIndex(s => new { s.TenantId, s.CampaignId });
        builder.HasIndex(s => new { s.TenantId, s.FundraisingStatus });

        builder.OwnsMany(s => s.Images, b =>
        {
            b.ToTable("StoryImage");
            b.WithOwner().HasForeignKey("StoryId");
            b.Property(i => i.BlobUrl).HasMaxLength(1000).IsRequired();
            b.Property(i => i.BlobName).HasMaxLength(500).IsRequired();
            b.Property(i => i.MimeType).HasMaxLength(100).IsRequired();
        });

        builder.OwnsMany(s => s.Updates, b =>
        {
            b.ToTable("StoryUpdate");
            b.WithOwner().HasForeignKey("StoryId");
            b.Property(u => u.Title).HasMaxLength(200).IsRequired();
            b.Property(u => u.Content).IsRequired();
        });
    }
}
