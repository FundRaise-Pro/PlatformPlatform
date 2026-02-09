using Microsoft.EntityFrameworkCore;
using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.Subscriptions.Domain;

public interface IUsageMetricRepository : ICrudRepository<UsageMetric, UsageMetricId>
{
    Task<UsageMetric?> GetByTenantAndResourceTypeAsync(TenantId tenantId, string resourceType, CancellationToken cancellationToken);
}

internal sealed class UsageMetricRepository(FundraiserDbContext dbContext)
    : RepositoryBase<UsageMetric, UsageMetricId>(dbContext), IUsageMetricRepository
{
    public async Task<UsageMetric?> GetByTenantAndResourceTypeAsync(TenantId tenantId, string resourceType, CancellationToken cancellationToken)
    {
        return await DbSet.SingleOrDefaultAsync(
            m => m.TenantId == tenantId && m.ResourceType == resourceType,
            cancellationToken
        );
    }
}
