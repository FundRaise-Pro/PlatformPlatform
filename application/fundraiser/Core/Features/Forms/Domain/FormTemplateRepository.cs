using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.Forms.Domain;

public interface IFormTemplateRepository : ICrudRepository<FormTemplate, FormTemplateId>
{
    Task<FormTemplate[]> GetPublishedAsync(CancellationToken cancellationToken);
    Task<FormTemplate[]> GetByCategoryAsync(string category, CancellationToken cancellationToken);
}

internal sealed class FormTemplateRepository(FundraiserDbContext dbContext)
    : RepositoryBase<FormTemplate, FormTemplateId>(dbContext), IFormTemplateRepository
{
    public async Task<FormTemplate[]> GetPublishedAsync(CancellationToken cancellationToken)
    {
        return await DbSet.Where(t => t.IsPublished).OrderBy(t => t.Category).ThenBy(t => t.Name).ToArrayAsync(cancellationToken);
    }

    public async Task<FormTemplate[]> GetByCategoryAsync(string category, CancellationToken cancellationToken)
    {
        return await DbSet.Where(t => t.IsPublished && t.Category == category).OrderBy(t => t.Name).ToArrayAsync(cancellationToken);
    }
}
