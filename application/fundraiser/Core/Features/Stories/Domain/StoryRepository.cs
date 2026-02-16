using Microsoft.EntityFrameworkCore;
using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.Stories.Domain;

public interface IStoryRepository : ICrudRepository<Story, StoryId>
{
    Task<Story[]> GetAllAsync(CancellationToken cancellationToken);
    Task<Story?> GetBySlugAsync(string slug, CancellationToken cancellationToken);
}

internal sealed class StoryRepository(FundraiserDbContext dbContext)
    : RepositoryBase<Story, StoryId>(dbContext), IStoryRepository
{
    public async Task<Story[]> GetAllAsync(CancellationToken cancellationToken)
    {
        return await DbSet.OrderByDescending(s => s.CreatedAt).ToArrayAsync(cancellationToken);
    }

    public async Task<Story?> GetBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        return await DbSet.FirstOrDefaultAsync(s => s.Slug == slug, cancellationToken);
    }
}
