using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.Events.Domain;

public interface IFundraisingEventRepository : ICrudRepository<FundraisingEvent, FundraisingEventId>
{
    Task<FundraisingEvent[]> GetAllAsync(CancellationToken cancellationToken);
    Task<FundraisingEvent[]> GetUpcomingAsync(CancellationToken cancellationToken);
    Task<FundraisingEvent?> GetBySlugAsync(string slug, CancellationToken cancellationToken);
}

internal sealed class FundraisingEventRepository(FundraiserDbContext dbContext)
    : RepositoryBase<FundraisingEvent, FundraisingEventId>(dbContext), IFundraisingEventRepository
{
    public async Task<FundraisingEvent[]> GetAllAsync(CancellationToken cancellationToken)
    {
        return await DbSet.OrderByDescending(e => e.EventDate).ToArrayAsync(cancellationToken);
    }

    public async Task<FundraisingEvent[]> GetUpcomingAsync(CancellationToken cancellationToken)
    {
        return await DbSet
            .Where(e => e.EventDate > DateTime.UtcNow && e.Status != EventStatus.Cancelled)
            .OrderBy(e => e.EventDate)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<FundraisingEvent?> GetBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        return await DbSet.FirstOrDefaultAsync(e => e.Slug == slug, cancellationToken);
    }
}
