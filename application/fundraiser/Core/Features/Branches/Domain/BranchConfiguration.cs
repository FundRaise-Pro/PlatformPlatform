using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.Fundraiser.Features.Branches.Domain;

public sealed class BranchConfiguration : IEntityTypeConfiguration<Branch>
{
    public void Configure(EntityTypeBuilder<Branch> builder)
    {
        builder.MapStronglyTypedUuid<Branch, BranchId>(b => b.Id);
        builder.MapStronglyTypedLongId<Branch, TenantId>(b => b.TenantId);

        builder.Property(b => b.Name).HasMaxLength(200).IsRequired();
        builder.Property(b => b.AddressLine1).HasMaxLength(300).IsRequired();
        builder.Property(b => b.AddressLine2).HasMaxLength(300);
        builder.Property(b => b.Area).HasMaxLength(100);
        builder.Property(b => b.Suburb).HasMaxLength(100);
        builder.Property(b => b.City).HasMaxLength(100).IsRequired();
        builder.Property(b => b.State).HasMaxLength(100).IsRequired();
        builder.Property(b => b.PostalCode).HasMaxLength(20).IsRequired();
        builder.Property(b => b.Country).HasMaxLength(100);
        builder.Property(b => b.GoogleMapsUrl).HasMaxLength(500);
        builder.Property(b => b.AppleMapsUrl).HasMaxLength(500);
        builder.Property(b => b.PhoneNumber).HasMaxLength(30);

        builder.OwnsMany(b => b.Services, sb =>
        {
            sb.WithOwner().HasForeignKey("BranchId");
            sb.Property(s => s.Description).HasMaxLength(500);
        });
    }
}
