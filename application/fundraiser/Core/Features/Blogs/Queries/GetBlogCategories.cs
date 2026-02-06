using PlatformPlatform.Fundraiser.Features.Blogs.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Blogs.Queries;

[PublicAPI]
public sealed record GetBlogCategoriesQuery : IRequest<Result<BlogCategoryResponse[]>>;

[PublicAPI]
public sealed record BlogCategoryResponse(
    BlogCategoryId Id,
    string Title,
    string Slug,
    string? Description,
    bool ShowInNavigation,
    int DisplayOrder
);

public sealed class GetBlogCategoriesHandler(IBlogCategoryRepository blogCategoryRepository)
    : IRequestHandler<GetBlogCategoriesQuery, Result<BlogCategoryResponse[]>>
{
    public async Task<Result<BlogCategoryResponse[]>> Handle(GetBlogCategoriesQuery query, CancellationToken cancellationToken)
    {
        var categories = await blogCategoryRepository.GetAllAsync(cancellationToken);

        var response = categories.Select(c => new BlogCategoryResponse(
            c.Id, c.Title, c.Slug, c.Description, c.ShowInNavigation, c.DisplayOrder
        )).ToArray();

        return response;
    }
}
