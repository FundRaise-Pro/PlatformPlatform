using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class BranchEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/branches";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("Branches").RequireAuthorization().ProducesValidationProblem();

        // TODO: Phase 1 — Implement branch CRUD
        // group.MapGet("/", ...) — List branches
        // group.MapGet("/{id}", ...) — Get branch by ID
        // group.MapPost("/", ...) — Create branch
        // group.MapPut("/{id}", ...) — Update branch
        // group.MapPut("/{id}/geolocation", ...) — Set geolocation
        // group.MapPost("/{id}/services", ...) — Add service to branch
    }
}
