using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.StronglyTypedIds;

namespace PlatformPlatform.Fundraiser.Features.Blogs.Domain;

[IdPrefix("blg")]
public sealed record BlogPostId(string Value) : StronglyTypedUlid<BlogPostId>;

[IdPrefix("bct")]
public sealed record BlogCategoryId(string Value) : StronglyTypedUlid<BlogCategoryId>;

/// <summary>
///     A BlogCategory groups blog posts into navigable sections with SEO metadata.
///     Each tenant can define their own categories.
/// </summary>
public sealed class BlogCategory : AggregateRoot<BlogCategoryId>, ITenantScopedEntity
{
    private BlogCategory(BlogCategoryId id, TenantId tenantId, string title, string slug) : base(id)
    {
        TenantId = tenantId;
        Title = title;
        Slug = slug;
    }

    public TenantId TenantId { get; private init; }

    public string Title { get; private set; } = string.Empty;

    public string Slug { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public string? MetaTitle { get; private set; }

    public string? MetaDescription { get; private set; }

    public bool ShowInNavigation { get; private set; } = true;

    public int DisplayOrder { get; private set; }

    public static BlogCategory Create(TenantId tenantId, string title, string slug, string? description = null)
    {
        return new BlogCategory(BlogCategoryId.NewId(), tenantId, title, slug)
        {
            Description = description
        };
    }

    public void Update(string title, string slug, string? description = null, string? metaTitle = null, string? metaDescription = null)
    {
        Title = title;
        Slug = slug;
        Description = description;
        MetaTitle = metaTitle;
        MetaDescription = metaDescription;
    }
}

/// <summary>
///     A BlogPost is a tenant-authored content piece with SEO metadata, tags, and publishing workflow.
/// </summary>
public sealed class BlogPost : AggregateRoot<BlogPostId>, ITenantScopedEntity
{
    private BlogPost(BlogPostId id, TenantId tenantId, BlogCategoryId categoryId, string title, string slug, string content) : base(id)
    {
        TenantId = tenantId;
        CategoryId = categoryId;
        Title = title;
        Slug = slug;
        Content = content;
    }

    public TenantId TenantId { get; private init; }

    public BlogCategoryId CategoryId { get; private set; }

    public string Title { get; private set; } = string.Empty;

    public string Slug { get; private set; } = string.Empty;

    public string Content { get; private set; } = string.Empty;

    public string? Summary { get; private set; }

    public BlogPostStatus Status { get; private set; } = BlogPostStatus.Draft;

    public string? FeaturedImageUrl { get; private set; }

    public string? MetaTitle { get; private set; }

    public string? MetaDescription { get; private set; }

    public DateTime? PublishedAt { get; private set; }

    private readonly List<BlogPostTag> _tags = [];
    public IReadOnlyCollection<BlogPostTag> Tags => _tags.AsReadOnly();

    public static BlogPost Create(TenantId tenantId, BlogCategoryId categoryId, string title, string slug, string content)
    {
        return new BlogPost(BlogPostId.NewId(), tenantId, categoryId, title, slug, content);
    }

    public void Update(string title, string slug, string content, string? summary = null,
        string? featuredImageUrl = null, string? metaTitle = null, string? metaDescription = null)
    {
        Title = title;
        Slug = slug;
        Content = content;
        Summary = summary;
        FeaturedImageUrl = featuredImageUrl;
        MetaTitle = metaTitle;
        MetaDescription = metaDescription;
    }

    public void Publish()
    {
        Status = BlogPostStatus.Published;
        PublishedAt = DateTime.UtcNow;
    }

    public void Archive()
    {
        Status = BlogPostStatus.Archived;
    }

    public void AddTag(string tag)
    {
        if (_tags.All(t => t.Tag != tag))
        {
            _tags.Add(new BlogPostTag(tag));
        }
    }

    public void RemoveTag(string tag)
    {
        var existing = _tags.FirstOrDefault(t => t.Tag == tag);
        if (existing is not null)
        {
            _tags.Remove(existing);
        }
    }
}

public enum BlogPostStatus
{
    Draft = 0,
    Published = 1,
    Archived = 2
}

public sealed class BlogPostTag
{
    public int Id { get; private init; }

    public string Tag { get; private set; } = string.Empty;

    internal BlogPostTag(string tag)
    {
        Tag = tag;
    }

    private BlogPostTag() { } // EF Core
}
