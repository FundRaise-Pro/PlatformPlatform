using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class FormEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/forms";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("Forms").RequireAuthorization().ProducesValidationProblem();

        // TODO: Phase 1 — Implement dynamic form management
        // group.MapGet("/versions", ...) — List form versions
        // group.MapGet("/versions/{id}", ...) — Get form version with sections/fields
        // group.MapPost("/versions", ...) — Create form version
        // group.MapPut("/versions/{id}/activate", ...) — Activate form version
        // group.MapPost("/versions/{id}/sections", ...) — Add section to form
        // group.MapPost("/sections/{id}/fields", ...) — Add field to section
    }
}
