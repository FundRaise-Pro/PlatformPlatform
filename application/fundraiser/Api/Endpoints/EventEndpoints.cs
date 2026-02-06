using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class EventEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/events";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("Events").RequireAuthorization().ProducesValidationProblem();

        // TODO: Phase 1 — Implement event CRUD
        // group.MapGet("/", ...) — List events
        // group.MapGet("/{id}", ...) — Get event by ID
        // group.MapPost("/", ...) — Create event
        // group.MapPut("/{id}", ...) — Update event
        // group.MapPost("/{id}/start", ...) — Start event
        // group.MapPost("/{id}/complete", ...) — Complete event
    }
}
