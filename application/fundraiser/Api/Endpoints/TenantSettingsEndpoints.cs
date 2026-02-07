using PlatformPlatform.Fundraiser.Features.TenantSettings.Commands;
using PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;
using PlatformPlatform.Fundraiser.Features.TenantSettings.Queries;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class TenantSettingsEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/tenant-settings";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("TenantSettings").RequireAuthorization().ProducesValidationProblem();

        group.MapGet("/", async Task<ApiResult<TenantSettingsResponse>> ([AsParameters] GetTenantSettingsQuery query, IMediator mediator)
            => await mediator.Send(query)
        ).Produces<TenantSettingsResponse>();

        group.MapGet("/public", async Task<ApiResult<PublicTenantSettingsResponse>> ([AsParameters] GetPublicTenantSettingsQuery query, IMediator mediator)
            => await mediator.Send(query)
        ).Produces<PublicTenantSettingsResponse>().AllowAnonymous();

        group.MapPost("/initialize", async Task<ApiResult<TenantSettingsId>> (IMediator mediator)
            => await mediator.Send(new InitializeTenantSettingsCommand())
        ).Produces<TenantSettingsId>();

        group.MapPut("/theme", async Task<ApiResult> (UpdateThemeConfigCommand command, IMediator mediator)
            => await mediator.Send(command)
        );

        group.MapPut("/brand", async Task<ApiResult> (UpdateBrandConfigCommand command, IMediator mediator)
            => await mediator.Send(command)
        );

        group.MapPut("/domain", async Task<ApiResult> (UpdateDomainConfigCommand command, IMediator mediator)
            => await mediator.Send(command)
        );

        group.MapPut("/content", async Task<ApiResult> (UpdateContentConfigCommand command, IMediator mediator)
            => await mediator.Send(command)
        );

        group.MapPut("/feature-flags", async Task<ApiResult> (UpdateFeatureFlagsCommand command, IMediator mediator)
            => await mediator.Send(command)
        );
    }
}
