using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.Forms.Domain;

public interface IFormVersionRepository : ICrudRepository<FormVersion, FormVersionId>
{
    Task<FormVersion[]> GetAllAsync(CancellationToken cancellationToken);
    Task<FormVersion?> GetActiveAsync(CancellationToken cancellationToken);
}

internal sealed class FormVersionRepository(FundraiserDbContext dbContext)
    : RepositoryBase<FormVersion, FormVersionId>(dbContext), IFormVersionRepository
{
    public async Task<FormVersion[]> GetAllAsync(CancellationToken cancellationToken)
    {
        return await DbSet.OrderByDescending(f => f.CreatedAt).ToArrayAsync(cancellationToken);
    }

    public async Task<FormVersion?> GetActiveAsync(CancellationToken cancellationToken)
    {
        return await DbSet.FirstOrDefaultAsync(f => f.IsActive, cancellationToken);
    }
}
