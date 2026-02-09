using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;

namespace PlatformPlatform.AppGateway.Middleware;

/// <summary>
///     Resolves tenant from subdomain in the Host header for public-facing requests.
///     Calls the internal tenant resolver endpoint (service-to-service, bypassing gateway)
///     and injects the X-Tenant-Id header for downstream services.
///     Caches subdomain → tenantId mappings for 5 minutes.
/// </summary>
public class TenantResolutionMiddleware(
    IHttpClientFactory httpClientFactory,
    IMemoryCache memoryCache,
    ILogger<TenantResolutionMiddleware> logger
) : IMiddleware
{
    private const string TenantIdHeaderName = "X-Tenant-Id";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var host = context.Request.Host.Value;
        var subdomain = ExtractSubdomain(host);

        if (subdomain is null)
        {
            // No subdomain — pass through to existing routes (admin SPA, account-management, etc.)
            await next(context);
            return;
        }

        var tenantId = await ResolveAndCacheTenantIdAsync(host, subdomain);
        if (tenantId is null)
        {
            logger.LogWarning("No tenant found for subdomain '{Subdomain}' (host: {Host})", subdomain, host);
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            context.Response.ContentType = "text/plain";
            await context.Response.WriteAsync($"Organization '{subdomain}' not found.");
            return;
        }

        // Always overwrite — prevents spoofing from external clients
        context.Request.Headers[TenantIdHeaderName] = tenantId.Value.ToString();

        await next(context);
    }

    private async Task<long?> ResolveAndCacheTenantIdAsync(string host, string subdomain)
    {
        var cacheKey = $"tenant-resolution:{subdomain}";
        if (memoryCache.TryGetValue(cacheKey, out long cachedTenantId))
        {
            return cachedTenantId;
        }

        try
        {
            var client = httpClientFactory.CreateClient("FundraiserInternal");
            var response = await client.GetAsync($"/internal-api/fundraiser/tenants/resolve?host={Uri.EscapeDataString(host)}");

            if (!response.IsSuccessStatusCode)
            {
                logger.LogDebug("Tenant resolver returned {StatusCode} for host '{Host}'", response.StatusCode, host);
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();
            var resolved = JsonSerializer.Deserialize<ResolvedTenantDto>(content, JsonOptions);

            if (resolved is null)
            {
                return null;
            }

            memoryCache.Set(cacheKey, resolved.TenantId, CacheDuration);
            return resolved.TenantId;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to resolve tenant for host '{Host}'", host);
            return null;
        }
    }

    private static string? ExtractSubdomain(string host)
    {
        // Remove port if present
        var hostWithoutPort = host.Contains(':') ? host[..host.IndexOf(':')] : host;

        // Skip bare localhost, app.fundraiseos.com, and similar non-tenant hosts
        if (hostWithoutPort is "localhost" or "app.fundraiseos.com" or "fundraiseos.com")
            return null;

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

    private sealed record ResolvedTenantDto(long TenantId, string Subdomain, string Status);
}
