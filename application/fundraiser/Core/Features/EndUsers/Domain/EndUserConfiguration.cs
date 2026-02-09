using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.Fundraiser.Features.EndUsers.Domain;

public sealed class EndUserConfiguration : IEntityTypeConfiguration<EndUser>
{
    public void Configure(EntityTypeBuilder<EndUser> builder)
    {
        builder.MapStronglyTypedUuid<EndUser, EndUserId>(e => e.Id);
        builder.MapStronglyTypedLongId<EndUser, TenantId>(e => e.TenantId);

        builder.Property(e => e.Email).HasMaxLength(254);
        builder.Property(e => e.PhoneNumber).HasMaxLength(20);
        builder.Property(e => e.FirstName).HasMaxLength(100);
        builder.Property(e => e.LastName).HasMaxLength(100);
        builder.Property(e => e.ExternalId).HasMaxLength(256);
        builder.Property(e => e.SocialProvider).HasMaxLength(50);
        builder.Property(e => e.Type).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.IsVerified);
        builder.Property(e => e.IsAnonymous);
        builder.Property(e => e.VerificationCodeHash).HasMaxLength(256);
        builder.Property(e => e.VerificationAttempts);
        builder.Property(e => e.LastActiveAt);

        builder.Property(e => e.DonorProfileId)
            .HasConversion(v => v != null ? v.Value : null, v => v != null ? new DonorProfileId(v) : null)
            .HasMaxLength(50);

        // Index for looking up end-users by email within a tenant
        builder.HasIndex(e => new { e.TenantId, e.Email })
            .HasFilter("[Email] IS NOT NULL")
            .IsUnique();

        // Index for looking up end-users by phone within a tenant
        builder.HasIndex(e => new { e.TenantId, e.PhoneNumber })
            .HasFilter("[PhoneNumber] IS NOT NULL");

        // Index for social login lookups
        builder.HasIndex(e => new { e.TenantId, e.SocialProvider, e.ExternalId })
            .HasFilter("[ExternalId] IS NOT NULL")
            .IsUnique();
    }
}
