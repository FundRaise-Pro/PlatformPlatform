using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.AccountManagement.Features.Tenants.Domain;

public sealed class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.MapStronglyTypedLongId<Tenant, TenantId>(t => t.Id);

        builder.Property(t => t.Slug).HasMaxLength(63);
        builder.HasIndex(t => t.Slug).IsUnique();

        builder.Property(t => t.Name).HasMaxLength(200);
        builder.Property(t => t.OrgType).HasDefaultValue(NpoType.Other);
        builder.Property(t => t.RegistrationNumber).HasMaxLength(50);
        builder.Property(t => t.Description).HasMaxLength(500);
        builder.Property(t => t.Country).HasMaxLength(3);

        builder.OwnsOne(t => t.Logo, b => b.ToJson());
    }
}
