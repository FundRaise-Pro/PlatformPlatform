using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.Blogs.Domain;

public interface IBlogCategoryRepository : ICrudRepository<BlogCategory, BlogCategoryId>
{
    Task<BlogCategory[]> GetAllAsync(CancellationToken cancellationToken);
    Task<BlogCategory?> GetBySlugAsync(string slug, CancellationToken cancellationToken);
}

internal sealed class BlogCategoryRepository(FundraiserDbContext dbContext)
    : RepositoryBase<BlogCategory, BlogCategoryId>(dbContext), IBlogCategoryRepository
{
    public async Task<BlogCategory[]> GetAllAsync(CancellationToken cancellationToken)
    {
        return await DbSet.OrderBy(c => c.DisplayOrder).ToArrayAsync(cancellationToken);
    }

    public async Task<BlogCategory?> GetBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        return await DbSet.FirstOrDefaultAsync(c => c.Slug == slug, cancellationToken);
    }
}

public interface IBlogPostRepository : ICrudRepository<BlogPost, BlogPostId>
{
    Task<BlogPost[]> GetAllAsync(CancellationToken cancellationToken);
    Task<BlogPost?> GetBySlugAsync(string slug, CancellationToken cancellationToken);
    Task<BlogPost[]> GetPublishedAsync(BlogCategoryId? categoryId, CancellationToken cancellationToken);
}

internal sealed class BlogPostRepository(FundraiserDbContext dbContext)
    : RepositoryBase<BlogPost, BlogPostId>(dbContext), IBlogPostRepository
{
    public async Task<BlogPost[]> GetAllAsync(CancellationToken cancellationToken)
    {
        return await DbSet.OrderByDescending(p => p.CreatedAt).ToArrayAsync(cancellationToken);
    }

    public async Task<BlogPost?> GetBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        return await DbSet.FirstOrDefaultAsync(p => p.Slug == slug, cancellationToken);
    }

    public async Task<BlogPost[]> GetPublishedAsync(BlogCategoryId? categoryId, CancellationToken cancellationToken)
    {
        var query = DbSet.Where(p => p.Status == BlogPostStatus.Published);
        if (categoryId is not null)
            query = query.Where(p => p.CategoryId == categoryId);
        return await query.OrderByDescending(p => p.PublishedAt).ToArrayAsync(cancellationToken);
    }
}
