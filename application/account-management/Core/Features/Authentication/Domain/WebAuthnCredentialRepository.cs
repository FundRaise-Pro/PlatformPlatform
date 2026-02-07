using Microsoft.EntityFrameworkCore;
using PlatformPlatform.AccountManagement.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.AccountManagement.Features.Authentication.Domain;

public interface IWebAuthnCredentialRepository : ICrudRepository<WebAuthnCredential, WebAuthnCredentialId>
{
    Task<WebAuthnCredential?> GetByCredentialIdAsync(byte[] credentialId, CancellationToken cancellationToken);
    Task<WebAuthnCredential[]> GetByUserIdAsync(UserId userId, CancellationToken cancellationToken);
    Task<bool> HasCredentialsAsync(UserId userId, CancellationToken cancellationToken);
}

internal sealed class WebAuthnCredentialRepository(AccountManagementDbContext dbContext)
    : RepositoryBase<WebAuthnCredential, WebAuthnCredentialId>(dbContext), IWebAuthnCredentialRepository
{
    public async Task<WebAuthnCredential?> GetByCredentialIdAsync(byte[] credentialId, CancellationToken cancellationToken)
    {
        return await DbSet.FirstOrDefaultAsync(
            w => w.CredentialId == credentialId && w.IsActive, cancellationToken);
    }

    public async Task<WebAuthnCredential[]> GetByUserIdAsync(UserId userId, CancellationToken cancellationToken)
    {
        return await DbSet
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.LastUsedAt ?? w.CreatedAt)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<bool> HasCredentialsAsync(UserId userId, CancellationToken cancellationToken)
    {
        return await DbSet.AnyAsync(w => w.UserId == userId && w.IsActive, cancellationToken);
    }
}
