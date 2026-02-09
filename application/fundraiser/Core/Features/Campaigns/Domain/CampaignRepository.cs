using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.Campaigns.Domain;

public interface ICampaignRepository : ICrudRepository<Campaign, CampaignId>
{
    Task<Campaign[]> GetAllAsync(CancellationToken cancellationToken);
    Task<bool> ExistsAsync(CampaignId id, CancellationToken cancellationToken);
    Task<Campaign?> GetBySlugAsync(string slug, CancellationToken cancellationToken);
    Task<Campaign[]> GetPublishedAsync(CancellationToken cancellationToken);
}

internal sealed class CampaignRepository(FundraiserDbContext dbContext)
    : RepositoryBase<Campaign, CampaignId>(dbContext), ICampaignRepository
{
    public async Task<Campaign[]> GetAllAsync(CancellationToken cancellationToken)
    {
        return await DbSet.OrderByDescending(c => c.CreatedAt).ToArrayAsync(cancellationToken);
    }

    public async Task<Campaign?> GetBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        return await DbSet.FirstOrDefaultAsync(c => c.Slug == slug, cancellationToken);
    }

    public async Task<Campaign[]> GetPublishedAsync(CancellationToken cancellationToken)
    {
        return await DbSet
            .Where(c => c.Status == CampaignStatus.Published && !c.IsPrivate)
            .OrderByDescending(c => c.PublishedAt)
            .ToArrayAsync(cancellationToken);
    }
}
