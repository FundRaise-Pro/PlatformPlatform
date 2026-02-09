using PlatformPlatform.Fundraiser.Features.Blogs.Commands;
using PlatformPlatform.Fundraiser.Features.Blogs.Domain;
using PlatformPlatform.Fundraiser.Features.Blogs.Queries;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class BlogEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/blogs";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("Blogs").RequireAuthorization().ProducesValidationProblem();

        group.MapGet("/categories", async Task<ApiResult<BlogCategoryResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetBlogCategoriesQuery())
        ).Produces<BlogCategoryResponse[]>();

        group.MapPost("/categories", async Task<ApiResult<BlogCategoryId>> (CreateBlogCategoryCommand command, IMediator mediator)
            => await mediator.Send(command)
        ).Produces<BlogCategoryId>();

        group.MapGet("/", async Task<ApiResult<BlogPostSummaryResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetBlogPostsQuery())
        ).Produces<BlogPostSummaryResponse[]>();

        group.MapGet("/{id}", async Task<ApiResult<BlogPostResponse>> (BlogPostId id, IMediator mediator)
            => await mediator.Send(new GetBlogPostQuery(id))
        ).Produces<BlogPostResponse>();

        group.MapPost("/", async Task<ApiResult<BlogPostId>> (CreateBlogPostCommand command, IMediator mediator)
            => await mediator.Send(command)
        ).Produces<BlogPostId>();

        group.MapPut("/{id}", async Task<ApiResult> (BlogPostId id, UpdateBlogPostCommand command, IMediator mediator)
            => await mediator.Send(command with { Id = id })
        );

        group.MapPost("/{id}/publish", async Task<ApiResult> (BlogPostId id, IMediator mediator)
            => await mediator.Send(new PublishBlogPostCommand(id))
        );
    }
}
