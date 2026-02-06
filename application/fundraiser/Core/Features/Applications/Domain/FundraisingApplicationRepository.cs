using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.Applications.Domain;

public interface IFundraisingApplicationRepository : ICrudRepository<FundraisingApplication, FundraisingApplicationId>
{
    Task<FundraisingApplication[]> GetAllAsync(CancellationToken cancellationToken);
}

internal sealed class FundraisingApplicationRepository(FundraiserDbContext dbContext)
    : RepositoryBase<FundraisingApplication, FundraisingApplicationId>(dbContext), IFundraisingApplicationRepository
{
    public async Task<FundraisingApplication[]> GetAllAsync(CancellationToken cancellationToken)
    {
        return await DbSet.OrderByDescending(a => a.CreatedAt).ToArrayAsync(cancellationToken);
    }
}
