using PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;

namespace PlatformPlatform.Fundraiser.Features.TenantSettings.Queries;

[PublicAPI]
public sealed record ResolveTenantQuery(string Host) : IRequest<Result<ResolvedTenantResponse>>;

[PublicAPI]
public sealed record ResolvedTenantResponse(long TenantId, string Subdomain, string Status);

public sealed class ResolveTenantHandler(ITenantSettingsRepository tenantSettingsRepository)
    : IRequestHandler<ResolveTenantQuery, Result<ResolvedTenantResponse>>
{
    public async Task<Result<ResolvedTenantResponse>> Handle(ResolveTenantQuery query, CancellationToken cancellationToken)
    {
        var subdomain = ExtractSubdomain(query.Host);
        if (subdomain is null)
            return Result<ResolvedTenantResponse>.NotFound($"No subdomain found in host '{query.Host}'.");

        var settings = await tenantSettingsRepository.GetBySubdomainAsync(subdomain, cancellationToken);
        if (settings is null)
            return Result<ResolvedTenantResponse>.NotFound($"No tenant found for subdomain '{subdomain}'.");

        return new ResolvedTenantResponse(settings.TenantId, subdomain, "active");
    }

    private static string? ExtractSubdomain(string host)
    {
        // Remove port if present
        var hostWithoutPort = host.Contains(':') ? host[..host.IndexOf(':')] : host;

        // Handle .localhost (e.g., gos.localhost)
        if (hostWithoutPort.EndsWith(".localhost", StringComparison.OrdinalIgnoreCase))
        {
            var sub = hostWithoutPort[..hostWithoutPort.LastIndexOf(".localhost", StringComparison.OrdinalIgnoreCase)];
            return string.IsNullOrEmpty(sub) ? null : sub;
        }

        // Handle .nip.io / .sslip.io (e.g., gos.127.0.0.1.nip.io)
        if (hostWithoutPort.EndsWith(".nip.io", StringComparison.OrdinalIgnoreCase) ||
            hostWithoutPort.EndsWith(".sslip.io", StringComparison.OrdinalIgnoreCase))
        {
            var firstDot = hostWithoutPort.IndexOf('.');
            return firstDot > 0 ? hostWithoutPort[..firstDot] : null;
        }

        // Handle standard domains (e.g., gos.fundraiseos.com)
        var parts = hostWithoutPort.Split('.');
        return parts.Length >= 3 ? parts[0] : null;
    }
}
