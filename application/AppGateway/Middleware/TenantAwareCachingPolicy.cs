using Microsoft.AspNetCore.OutputCaching;
using Microsoft.Extensions.Primitives;
using PlatformPlatform.SharedKernel.Authentication;

namespace PlatformPlatform.AppGateway.Middleware;

public sealed class TenantAwareCachingPolicy : IOutputCachePolicy
{
    public static readonly TenantAwareCachingPolicy Instance = new();

    private TenantAwareCachingPolicy()
    {
    }

    ValueTask IOutputCachePolicy.CacheRequestAsync(OutputCacheContext context, CancellationToken cancellationToken)
    {
        var attemptOutputCaching = AttemptOutputCaching(context);
        context.EnableOutputCaching = true;
        context.AllowCacheLookup = attemptOutputCaching;
        context.AllowCacheStorage = attemptOutputCaching;
        context.AllowLocking = true;

        // Vary by tenant to ensure cache isolation between tenants
        var userInfo = UserInfo.Create(context.HttpContext.User, null);
        if (userInfo.TenantId is not null)
        {
            context.CacheVaryByRules.VaryByValues["tenant"] = userInfo.TenantId.ToString();
        }

        // Vary by query string for dynamic content
        context.CacheVaryByRules.QueryKeys = "*";

        return ValueTask.CompletedTask;
    }

    ValueTask IOutputCachePolicy.ServeFromCacheAsync(OutputCacheContext context, CancellationToken cancellationToken)
    {
        return ValueTask.CompletedTask;
    }

    ValueTask IOutputCachePolicy.ServeResponseAsync(OutputCacheContext context, CancellationToken cancellationToken)
    {
        var response = context.HttpContext.Response;

        // Verify if we can serve this response from cache
        if (!StringValues.IsNullOrEmpty(response.Headers.SetCookie) ||
            response.StatusCode is not (StatusCodes.Status200OK or StatusCodes.Status301MovedPermanently))
        {
            context.AllowCacheStorage = false;
            return ValueTask.CompletedTask;
        }

        return ValueTask.CompletedTask;
    }

    private static bool AttemptOutputCaching(OutputCacheContext context)
    {
        var request = context.HttpContext.Request;

        // Do not cache authenticated API requests (only cache static resources and public pages)
        if (request.Path.StartsWithSegments("/api") && context.HttpContext.User.Identity?.IsAuthenticated == true)
        {
            return false;
        }

        // Only cache GET and HEAD requests
        if (!HttpMethods.IsGet(request.Method) && !HttpMethods.IsHead(request.Method))
        {
            return false;
        }

        return true;
    }
}
