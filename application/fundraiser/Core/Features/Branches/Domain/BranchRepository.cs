using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.Branches.Domain;

public interface IBranchRepository : ICrudRepository<Branch, BranchId>
{
    Task<Branch[]> GetAllAsync(CancellationToken cancellationToken);
}

internal sealed class BranchRepository(FundraiserDbContext dbContext)
    : RepositoryBase<Branch, BranchId>(dbContext), IBranchRepository
{
    public async Task<Branch[]> GetAllAsync(CancellationToken cancellationToken)
    {
        return await DbSet.OrderBy(b => b.Name).ToArrayAsync(cancellationToken);
    }
}
