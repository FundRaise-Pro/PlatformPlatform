using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class CampaignEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/campaigns";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("Campaigns").RequireAuthorization().ProducesValidationProblem();

        // TODO: Phase 1 — Implement campaign CRUD commands and queries
        // group.MapGet("/", ...) — List campaigns for current tenant
        // group.MapGet("/{id}", ...) — Get campaign by ID
        // group.MapPost("/", ...) — Create campaign
        // group.MapPut("/{id}", ...) — Update campaign
        // group.MapPost("/{id}/publish", ...) — Publish campaign
        // group.MapPost("/{id}/images", ...) — Upload campaign images
    }
}
