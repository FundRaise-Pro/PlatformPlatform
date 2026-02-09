using PlatformPlatform.Fundraiser.Features.Blogs.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Blogs.Queries;

[PublicAPI]
public sealed record GetBlogPostsQuery : IRequest<Result<BlogPostSummaryResponse[]>>;

[PublicAPI]
public sealed record BlogPostSummaryResponse(
    BlogPostId Id,
    BlogCategoryId CategoryId,
    string Title,
    string Slug,
    string? Summary,
    string? FeaturedImageUrl,
    BlogPostStatus Status,
    DateTime? PublishedAt,
    DateTimeOffset CreatedAt
);

[PublicAPI]
public sealed record GetBlogPostQuery(BlogPostId Id) : IRequest<Result<BlogPostResponse>>;

[PublicAPI]
public sealed record BlogPostResponse(
    BlogPostId Id,
    BlogCategoryId CategoryId,
    string Title,
    string Slug,
    string Content,
    string? Summary,
    string? FeaturedImageUrl,
    string? MetaTitle,
    string? MetaDescription,
    BlogPostStatus Status,
    DateTime? PublishedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ModifiedAt,
    string[] Tags
);

public sealed class GetBlogPostsHandler(IBlogPostRepository blogPostRepository)
    : IRequestHandler<GetBlogPostsQuery, Result<BlogPostSummaryResponse[]>>
{
    public async Task<Result<BlogPostSummaryResponse[]>> Handle(GetBlogPostsQuery query, CancellationToken cancellationToken)
    {
        var posts = await blogPostRepository.GetAllAsync(cancellationToken);

        var response = posts.Select(p => new BlogPostSummaryResponse(
            p.Id, p.CategoryId, p.Title, p.Slug, p.Summary, p.FeaturedImageUrl, p.Status, p.PublishedAt, p.CreatedAt
        )).ToArray();

        return response;
    }
}

public sealed class GetBlogPostHandler(IBlogPostRepository blogPostRepository)
    : IRequestHandler<GetBlogPostQuery, Result<BlogPostResponse>>
{
    public async Task<Result<BlogPostResponse>> Handle(GetBlogPostQuery query, CancellationToken cancellationToken)
    {
        var post = await blogPostRepository.GetByIdAsync(query.Id, cancellationToken);
        if (post is null) return Result<BlogPostResponse>.NotFound($"Blog post with id '{query.Id}' not found.");

        return new BlogPostResponse(
            post.Id, post.CategoryId, post.Title, post.Slug, post.Content, post.Summary,
            post.FeaturedImageUrl, post.MetaTitle, post.MetaDescription, post.Status,
            post.PublishedAt, post.CreatedAt, post.ModifiedAt,
            post.Tags.Select(t => t.Tag).ToArray()
        );
    }
}
