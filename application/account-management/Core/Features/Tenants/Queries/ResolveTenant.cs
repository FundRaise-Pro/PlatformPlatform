using JetBrains.Annotations;
using PlatformPlatform.AccountManagement.Features.Tenants.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;

namespace PlatformPlatform.AccountManagement.Features.Tenants.Queries;

[PublicAPI]
public sealed record ResolveTenantQuery(string? Slug, string? Host) : IRequest<Result<ResolvedTenantResponse>>;

[PublicAPI]
public sealed record ResolvedTenantResponse(TenantId TenantId, string Slug, string Status);

public sealed class ResolveTenantHandler(ITenantRepository tenantRepository)
    : IRequestHandler<ResolveTenantQuery, Result<ResolvedTenantResponse>>
{
    public async Task<Result<ResolvedTenantResponse>> Handle(ResolveTenantQuery query, CancellationToken cancellationToken)
    {
        var slug = query.Slug;

        if (slug is null && query.Host is not null)
        {
            slug = ExtractSubdomain(query.Host);
        }

        if (string.IsNullOrWhiteSpace(slug))
        {
            return Result<ResolvedTenantResponse>.BadRequest("Either slug or host must be provided.");
        }

        var tenant = await tenantRepository.GetBySlugAsync(slug, cancellationToken);
        if (tenant is null)
        {
            return Result<ResolvedTenantResponse>.NotFound($"Organization '{slug}' not found.");
        }

        return new ResolvedTenantResponse(tenant.Id, tenant.Slug, tenant.State.ToString());
    }

    private static string? ExtractSubdomain(string host)
    {
        var hostWithoutPort = host.Split(':')[0];
        var parts = hostWithoutPort.Split('.');

        if (hostWithoutPort is "localhost" or "app.fundraiseos.com" or "fundraiseos.com")
            return null;

        if (hostWithoutPort.EndsWith(".localhost", StringComparison.OrdinalIgnoreCase) && parts.Length >= 2)
            return parts[0];

        if (hostWithoutPort.EndsWith(".nip.io", StringComparison.OrdinalIgnoreCase)
            || hostWithoutPort.EndsWith(".sslip.io", StringComparison.OrdinalIgnoreCase))
        {
            return parts.Length >= 2 ? parts[0] : null;
        }

        if (parts.Length >= 3)
            return parts[0];

        return null;
    }
}
