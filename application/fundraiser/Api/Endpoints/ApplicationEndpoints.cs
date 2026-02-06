using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class ApplicationEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/applications";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("Applications").RequireAuthorization().ProducesValidationProblem();

        // TODO: Phase 1 — Implement application CRUD and workflow
        // group.MapGet("/", ...) — List applications for current tenant
        // group.MapGet("/{id}", ...) — Get application by ID
        // group.MapPost("/", ...) — Create application
        // group.MapPut("/{id}/fields", ...) — Set field data
        // group.MapPost("/{id}/submit", ...) — Submit application
        // group.MapPost("/{id}/review", ...) — Add review
        // group.MapPost("/{id}/documents", ...) — Upload documents
    }
}
