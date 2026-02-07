using Microsoft.EntityFrameworkCore;
using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;

public interface ITenantSettingsRepository : ICrudRepository<TenantSettings, TenantSettingsId>
{
    Task<TenantSettings?> GetByTenantIdAsync(TenantId tenantId, CancellationToken cancellationToken);
}

internal sealed class TenantSettingsRepository(FundraiserDbContext dbContext)
    : RepositoryBase<TenantSettings, TenantSettingsId>(dbContext), ITenantSettingsRepository
{
    public async Task<TenantSettings?> GetByTenantIdAsync(TenantId tenantId, CancellationToken cancellationToken)
    {
        return await DbSet.FirstOrDefaultAsync(t => t.TenantId == tenantId, cancellationToken);
    }
}
