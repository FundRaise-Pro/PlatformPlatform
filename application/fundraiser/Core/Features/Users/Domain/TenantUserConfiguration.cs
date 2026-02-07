using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.Fundraiser.Features.Branches.Domain;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.Fundraiser.Features.Users.Domain;

public sealed class TenantUserConfiguration : IEntityTypeConfiguration<TenantUser>
{
    public void Configure(EntityTypeBuilder<TenantUser> builder)
    {
        builder.MapStronglyTypedUuid<TenantUser, TenantUserId>(t => t.Id);
        builder.MapStronglyTypedLongId<TenantUser, TenantId>(t => t.TenantId);
        builder.MapStronglyTypedUuid<TenantUser, UserId>(t => t.UserId);

        builder.Property(t => t.DisplayName).HasMaxLength(200);
        builder.Property(t => t.IsActive);

        builder.Property(t => t.PrimaryBranchId)
            .HasConversion(v => v != null ? v.Value : null, v => v != null ? new BranchId(v) : null)
            .HasMaxLength(50);

        builder.HasIndex(t => new { t.TenantId, t.UserId }).IsUnique();

        builder.OwnsMany(t => t.RoleAssignments, ra =>
        {
            ra.WithOwner().HasForeignKey("TenantUserId");
            ra.Property(r => r.Role).HasConversion<string>().HasMaxLength(50);
            ra.Property(r => r.ScopedBranchId)
                .HasConversion(v => v != null ? v.Value : null, v => v != null ? new BranchId(v) : null)
                .HasMaxLength(50);
            ra.Property(r => r.AssignedAt);
            ra.HasKey(r => r.Id);
        });
    }
}
