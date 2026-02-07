using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.AccountManagement.Features.Authentication.Domain;

public sealed class WebAuthnCredentialConfiguration : IEntityTypeConfiguration<WebAuthnCredential>
{
    public void Configure(EntityTypeBuilder<WebAuthnCredential> builder)
    {
        builder.MapStronglyTypedUuid<WebAuthnCredential, WebAuthnCredentialId>(w => w.Id);
        builder.MapStronglyTypedLongId<WebAuthnCredential, TenantId>(w => w.TenantId);
        builder.MapStronglyTypedUuid<WebAuthnCredential, UserId>(w => w.UserId);

        builder.Property(w => w.CredentialId).HasMaxLength(1024).IsRequired();
        builder.Property(w => w.PublicKey).HasMaxLength(2048).IsRequired();
        builder.Property(w => w.SignCount);
        builder.Property(w => w.FriendlyName).HasMaxLength(200);
        builder.Property(w => w.AaGuid);
        builder.Property(w => w.AttestationType).HasMaxLength(50);
        builder.Property(w => w.Transports).HasMaxLength(200);
        builder.Property(w => w.IsActive);
        builder.Property(w => w.LastUsedAt);
        builder.Property(w => w.UserHandle).HasMaxLength(128).IsRequired();

        // Index for looking up credentials by credential ID during authentication
        builder.HasIndex(w => w.CredentialId).IsUnique();

        // Index for listing all credentials for a user
        builder.HasIndex(w => new { w.TenantId, w.UserId });
    }
}
