using JetBrains.Annotations;
using PlatformPlatform.AccountManagement.Features.Tenants.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;

namespace PlatformPlatform.AccountManagement.Features.Tenants.Queries;

[PublicAPI]
public sealed record GetTenantSlugQuery(TenantId TenantId) : IRequest<Result<TenantSlugResponse>>;

[PublicAPI]
public sealed record TenantSlugResponse(string Slug);

public sealed class GetTenantSlugHandler(ITenantRepository tenantRepository)
    : IRequestHandler<GetTenantSlugQuery, Result<TenantSlugResponse>>
{
    public async Task<Result<TenantSlugResponse>> Handle(GetTenantSlugQuery query, CancellationToken cancellationToken)
    {
        var tenant = await tenantRepository.GetByIdAsync(query.TenantId, cancellationToken);
        if (tenant is null)
        {
            return Result<TenantSlugResponse>.NotFound($"Tenant '{query.TenantId}' not found.");
        }

        return new TenantSlugResponse(tenant.Slug);
    }
}
