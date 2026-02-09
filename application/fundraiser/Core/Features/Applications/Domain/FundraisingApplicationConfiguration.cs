using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.Fundraiser.Features.Applications.Domain;
using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.Fundraiser.Features.Forms.Domain;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.Fundraiser.Features.Applications.Domain;

public sealed class FundraisingApplicationConfiguration : IEntityTypeConfiguration<FundraisingApplication>
{
    public void Configure(EntityTypeBuilder<FundraisingApplication> builder)
    {
        builder.MapStronglyTypedUuid<FundraisingApplication, FundraisingApplicationId>(a => a.Id);
        builder.MapStronglyTypedLongId<FundraisingApplication, TenantId>(a => a.TenantId);
        builder.MapStronglyTypedUuid<FundraisingApplication, CampaignId>(a => a.CampaignId);
        builder.MapStronglyTypedNullableId<FundraisingApplication, FormVersionId, string>(a => a.FormVersionId);

        builder.Property(a => a.Status).HasMaxLength(50);
        builder.Property(a => a.InternalNotes).HasMaxLength(500);
        builder.Property(a => a.ReviewNotes).HasMaxLength(2000);

        builder.OwnsMany(a => a.FieldData, fb =>
        {
            fb.WithOwner().HasForeignKey("FundraisingApplicationId");
            fb.Property(f => f.FieldName).HasMaxLength(100).IsRequired();
            fb.Property(f => f.FieldValue).HasMaxLength(2000);
            fb.Property(f => f.FieldType).HasMaxLength(50);
        });

        builder.OwnsMany(a => a.Reviews, rb =>
        {
            rb.WithOwner().HasForeignKey("FundraisingApplicationId");
            rb.Property(r => r.ReviewType).HasMaxLength(50).IsRequired();
            rb.Property(r => r.Notes).HasMaxLength(2000).IsRequired();
            rb.Property(r => r.InternalNotes).HasMaxLength(500);
        });

        builder.OwnsMany(a => a.Documents, db =>
        {
            db.WithOwner().HasForeignKey("FundraisingApplicationId");
            db.Property(d => d.FileName).HasMaxLength(255).IsRequired();
            db.Property(d => d.BlobUrl).HasMaxLength(1000).IsRequired();
            db.Property(d => d.BlobName).HasMaxLength(500).IsRequired();
            db.Property(d => d.MimeType).HasMaxLength(100).IsRequired();
        });
    }
}
