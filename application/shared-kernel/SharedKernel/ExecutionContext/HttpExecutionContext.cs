using System.Net;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;
using PlatformPlatform.SharedKernel.Authentication;
using PlatformPlatform.SharedKernel.Domain;

namespace PlatformPlatform.SharedKernel.ExecutionContext;

public class HttpExecutionContext(IHttpContextAccessor httpContextAccessor) : IExecutionContext
{
    private const string TenantIdHeaderName = "X-Tenant-Id";

    public TenantId? TenantId
    {
        get
        {
            // Primary: resolve from JWT claims
            if (UserInfo.TenantId is not null)
                return UserInfo.TenantId;

            // Fallback: resolve from X-Tenant-Id header (set by gateway for public/anonymous requests)
            var headerValue = httpContextAccessor.HttpContext?.Request.Headers[TenantIdHeaderName].ToString();
            if (!string.IsNullOrEmpty(headerValue) && long.TryParse(headerValue, out var tenantIdValue))
                return new TenantId(tenantIdValue);

            return null;
        }
    }

    public UserInfo UserInfo
    {
        get
        {
            if (field is not null)
            {
                return field;
            }

            var browserLocale = httpContextAccessor.HttpContext?.Features.Get<IRequestCultureFeature>()?.RequestCulture.Culture.Name;

            return field = UserInfo.Create(httpContextAccessor.HttpContext?.User, browserLocale);
        }
    }

    public IPAddress ClientIpAddress
    {
        get
        {
            if (field is not null)
            {
                return field;
            }

            if (httpContextAccessor.HttpContext is null)
            {
                return field = IPAddress.None;
            }

            // Read X-Forwarded-For header directly to get client IP (first IP in the chain is the original client)
            var forwardedFor = httpContextAccessor.HttpContext.Request.Headers["X-Forwarded-For"].ToString();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                var clientIp = forwardedFor.Split(',').FirstOrDefault()?.Trim();
                if (IPAddress.TryParse(clientIp, out var parsedIpAddress))
                {
                    return field = NormalizeLoopbackAddress(parsedIpAddress);
                }
            }

            // Fall back to RemoteIpAddress for local development without proxies
            var remoteIpAddress = httpContextAccessor.HttpContext.Connection.RemoteIpAddress ?? IPAddress.None;
            return field = NormalizeLoopbackAddress(remoteIpAddress);
        }
    }

    private static IPAddress NormalizeLoopbackAddress(IPAddress ipAddress)
    {
        // Normalize IPv6 loopback (::1) to IPv4 loopback (127.0.0.1) for consistent display
        return IPAddress.IsLoopback(ipAddress) ? IPAddress.Loopback : ipAddress;
    }
}
