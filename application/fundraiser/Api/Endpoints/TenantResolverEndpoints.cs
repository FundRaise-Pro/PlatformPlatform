using PlatformPlatform.Fundraiser.Features.TenantSettings.Queries;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class TenantResolverEndpoints : IEndpoints
{
    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        routes.MapGet("/internal-api/fundraiser/tenants/resolve", async Task<ApiResult<ResolvedTenantResponse>> (string host, IMediator mediator)
            => await mediator.Send(new ResolveTenantQuery(host))
        ).AllowAnonymous().Produces<ResolvedTenantResponse>();
    }
}
