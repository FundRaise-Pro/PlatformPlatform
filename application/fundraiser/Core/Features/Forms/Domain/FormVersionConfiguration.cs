using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.Fundraiser.Features.Forms.Domain;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.Fundraiser.Features.Forms.Domain;

public sealed class FormVersionConfiguration : IEntityTypeConfiguration<FormVersion>
{
    public void Configure(EntityTypeBuilder<FormVersion> builder)
    {
        builder.MapStronglyTypedUuid<FormVersion, FormVersionId>(f => f.Id);
        builder.MapStronglyTypedLongId<FormVersion, TenantId>(f => f.TenantId);

        builder.Property(f => f.VersionNumber).HasMaxLength(20).IsRequired();
        builder.Property(f => f.Name).HasMaxLength(100).IsRequired();
        builder.Property(f => f.Description).HasMaxLength(2000);

        builder.OwnsMany(f => f.Sections, sb =>
        {
            sb.WithOwner().HasForeignKey("FormVersionId");
            sb.Property(s => s.Name).HasMaxLength(50).IsRequired();
            sb.Property(s => s.Title).HasMaxLength(100).IsRequired();
            sb.Property(s => s.Description).HasMaxLength(500);
            sb.Property(s => s.Icon).HasMaxLength(50);

            sb.OwnsMany(s => s.Fields, fb =>
            {
                fb.WithOwner().HasForeignKey("FormSectionId");
                fb.Property(f => f.Name).HasMaxLength(100).IsRequired();
                fb.Property(f => f.Label).HasMaxLength(200).IsRequired();
                fb.Property(f => f.DefaultValue).HasMaxLength(2000);
                fb.Property(f => f.Placeholder).HasMaxLength(200);
                fb.Property(f => f.MinValue).HasColumnType("decimal(18,2)");
                fb.Property(f => f.MaxValue).HasColumnType("decimal(18,2)");
            });

            sb.OwnsMany(s => s.Flags, fb =>
            {
                fb.WithOwner().HasForeignKey("FormSectionId");
                fb.Property(f => f.Name).HasMaxLength(100).IsRequired();
                fb.Property(f => f.Question).HasMaxLength(500).IsRequired();
                fb.Property(f => f.HelpText).HasMaxLength(500);
            });

            sb.OwnsMany(s => s.Selects, sb2 =>
            {
                sb2.WithOwner().HasForeignKey("FormSectionId");
                sb2.Property(s => s.Name).HasMaxLength(100).IsRequired();
                sb2.Property(s => s.Label).HasMaxLength(200).IsRequired();
                sb2.Property(s => s.Placeholder).HasMaxLength(200);
            });
        });
    }
}
