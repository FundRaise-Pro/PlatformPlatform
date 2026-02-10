using PlatformPlatform.AccountManagement.Features.Tenants.Commands;
using PlatformPlatform.AccountManagement.Features.Tenants.Queries;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.AccountManagement.Api.Endpoints;

public sealed class TenantEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/account-management/tenants";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("Tenants").RequireAuthorization().ProducesValidationProblem();

        group.MapGet("/current", async Task<ApiResult<TenantResponse>> (IMediator mediator)
            => await mediator.Send(new GetCurrentTenantQuery())
        ).Produces<TenantResponse>();

        group.MapPut("/current", async Task<ApiResult> (UpdateCurrentTenantCommand command, IMediator mediator)
            => (await mediator.Send(command)).AddRefreshAuthenticationTokens()
        );

        group.MapGet("/", async Task<ApiResult<GetTenantsForUserResponse>> (IMediator mediator)
            => await mediator.Send(new GetTenantsForUserQuery())
        ).Produces<GetTenantsForUserResponse>();

        group.MapPost("/current/update-logo", async Task<ApiResult> (IFormFile file, IMediator mediator)
            => await mediator.Send(new UpdateTenantLogoCommand(file.OpenReadStream(), file.ContentType))
        ).DisableAntiforgery();

        group.MapDelete("/current/remove-logo", async Task<ApiResult> (IMediator mediator)
            => await mediator.Send(new RemoveTenantLogoCommand())
        );

        routes.MapDelete("/internal-api/account-management/tenants/{id}", async Task<ApiResult> (TenantId id, IMediator mediator)
            => await mediator.Send(new DeleteTenantCommand(id))
        );

        routes.MapGet("/api/account-management/tenants/slug-available", async Task<ApiResult<SlugAvailabilityResponse>> (string slug, IMediator mediator)
            => await mediator.Send(new CheckSlugAvailabilityQuery(slug))
        ).Produces<SlugAvailabilityResponse>().AllowAnonymous();

        routes.MapGet("/internal-api/account-management/tenants/resolve", async Task<ApiResult<ResolvedTenantResponse>> (string? slug, string? host, IMediator mediator)
            => await mediator.Send(new ResolveTenantQuery(slug, host))
        ).Produces<ResolvedTenantResponse>().AllowAnonymous();

        routes.MapGet("/internal-api/account-management/tenants/{id}/slug", async Task<ApiResult<TenantSlugResponse>> (TenantId id, IMediator mediator)
            => await mediator.Send(new GetTenantSlugQuery(id))
        ).Produces<TenantSlugResponse>().AllowAnonymous();
    }
}
