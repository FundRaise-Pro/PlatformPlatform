using PlatformPlatform.Fundraiser.Features.Branches.Queries;
using PlatformPlatform.Fundraiser.Features.Public.Queries;
using PlatformPlatform.Fundraiser.Features.TenantSettings.Queries;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class PublicEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/public";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes
            .MapGroup(RoutesPrefix)
            .WithTags("Public")
            .AllowAnonymous();

        group.MapGet("/settings", async Task<ApiResult<PublicTenantSettingsResponse>> ([AsParameters] GetPublicTenantSettingsQuery query, IMediator mediator)
            => await mediator.Send(query)
        ).Produces<PublicTenantSettingsResponse>();

        group.MapGet("/campaigns", async Task<ApiResult<PublicCampaignSummaryResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetPublicCampaignsQuery())
        ).Produces<PublicCampaignSummaryResponse[]>();

        group.MapGet("/campaigns/{slug}", async Task<ApiResult<PublicCampaignResponse>> (string slug, IMediator mediator)
            => await mediator.Send(new GetPublicCampaignBySlugQuery(slug))
        ).Produces<PublicCampaignResponse>();

        group.MapGet("/blog/categories", async Task<ApiResult<PublicBlogCategoryResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetPublicBlogCategoriesQuery())
        ).Produces<PublicBlogCategoryResponse[]>();

        group.MapGet("/blog", async Task<ApiResult<PublicBlogPostSummaryResponse[]>> (string? categorySlug, IMediator mediator)
            => await mediator.Send(new GetPublicBlogPostsQuery(categorySlug))
        ).Produces<PublicBlogPostSummaryResponse[]>();

        group.MapGet("/blog/{categorySlug}/{postSlug}", async Task<ApiResult<PublicBlogPostResponse>> (string categorySlug, string postSlug, IMediator mediator)
            => await mediator.Send(new GetPublicBlogPostBySlugQuery(categorySlug, postSlug))
        ).Produces<PublicBlogPostResponse>();

        group.MapGet("/events", async Task<ApiResult<PublicEventResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetPublicEventsQuery())
        ).Produces<PublicEventResponse[]>();

        group.MapGet("/branches", async Task<ApiResult<BranchResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetPublicBranchesQuery())
        ).Produces<BranchResponse[]>();
    }
}
