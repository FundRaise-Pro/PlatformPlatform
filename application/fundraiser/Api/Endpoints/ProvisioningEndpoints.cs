using PlatformPlatform.Fundraiser.Features.Provisioning.Commands;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class ProvisioningEndpoints : IEndpoints
{
    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        routes.MapPost("/internal-api/fundraiser/tenants/{tenantId}/provision", async Task<ApiResult> (TenantId tenantId, IMediator mediator)
            => await mediator.Send(new ProvisionTenantCommand { TenantId = tenantId })
        ).AllowAnonymous();
    }
}
