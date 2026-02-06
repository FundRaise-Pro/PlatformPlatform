using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class BlogEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/blogs";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("Blogs").RequireAuthorization().ProducesValidationProblem();

        // TODO: Phase 1 — Implement blog CRUD
        // group.MapGet("/categories", ...) — List blog categories
        // group.MapPost("/categories", ...) — Create category
        // group.MapGet("/", ...) — List blog posts (with filtering)
        // group.MapGet("/{id}", ...) — Get blog post by ID
        // group.MapPost("/", ...) — Create blog post
        // group.MapPut("/{id}", ...) — Update blog post
        // group.MapPost("/{id}/publish", ...) — Publish blog post
    }
}
