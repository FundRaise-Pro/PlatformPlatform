using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.Fundraiser.Features.QRCodes.Domain;

public sealed class QRCodeConfiguration : IEntityTypeConfiguration<QRCode>
{
    public void Configure(EntityTypeBuilder<QRCode> builder)
    {
        builder.MapStronglyTypedUuid<QRCode, QRCodeId>(q => q.Id);
        builder.MapStronglyTypedLongId<QRCode, TenantId>(q => q.TenantId);

        builder.Property(q => q.Name).HasMaxLength(200).IsRequired();
        builder.Property(q => q.RedirectUrl).HasMaxLength(1000).IsRequired();
        builder.Property(q => q.QRCodeType).HasMaxLength(50);
        builder.Property(q => q.QRCodeImageUrl).HasMaxLength(1000);

        builder.OwnsMany(q => q.Hits, hb =>
        {
            hb.WithOwner().HasForeignKey("QRCodeId");
            hb.Property(h => h.UserAgent).HasMaxLength(500);
            hb.Property(h => h.Referrer).HasMaxLength(500);
            hb.Property(h => h.IpAddress).HasMaxLength(45);
        });
    }
}
