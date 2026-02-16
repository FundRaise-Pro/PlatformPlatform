using Microsoft.EntityFrameworkCore;
using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;

public interface ITenantSettingsRepository : ICrudRepository<TenantSettings, TenantSettingsId>
{
    Task<TenantSettings?> GetByTenantIdAsync(TenantId tenantId, CancellationToken cancellationToken);

    /// <summary>
    ///     Retrieves tenant settings without applying tenant query filters.
    ///     Used during cross-SCS provisioning where tenant context is not yet established.
    /// </summary>
    Task<TenantSettings?> GetByTenantIdUnfilteredAsync(TenantId tenantId, CancellationToken cancellationToken);

    /// <summary>
    ///     Resolves a tenant by subdomain or custom domain from the DomainConfig.
    ///     Bypasses tenant query filters since this is called before tenant context is known.
    /// </summary>
    Task<TenantSettings?> GetBySubdomainAsync(string subdomain, CancellationToken cancellationToken);
}

internal sealed class TenantSettingsRepository(FundraiserDbContext dbContext)
    : RepositoryBase<TenantSettings, TenantSettingsId>(dbContext), ITenantSettingsRepository
{
    public async Task<TenantSettings?> GetByTenantIdAsync(TenantId tenantId, CancellationToken cancellationToken)
    {
        return await DbSet.FirstOrDefaultAsync(t => t.TenantId == tenantId, cancellationToken);
    }

    /// <summary>
    ///     Retrieves tenant settings without applying tenant query filters.
    ///     Used during cross-SCS provisioning where tenant context is not yet established.
    /// </summary>
    public async Task<TenantSettings?> GetByTenantIdUnfilteredAsync(TenantId tenantId, CancellationToken cancellationToken)
    {
        return await DbSet.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.TenantId == tenantId, cancellationToken);
    }

    public async Task<TenantSettings?> GetBySubdomainAsync(string subdomain, CancellationToken cancellationToken)
    {
        return await DbSet
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Domain.Subdomain == subdomain, cancellationToken);
    }
}
