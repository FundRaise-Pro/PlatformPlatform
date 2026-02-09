using Azure.Core;
using PlatformPlatform.AppGateway.ApiAggregation;
using PlatformPlatform.AppGateway.Filters;
using PlatformPlatform.AppGateway.Middleware;
using PlatformPlatform.AppGateway.Transformations;
using PlatformPlatform.SharedKernel.Configuration;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

var reverseProxyBuilder = builder.Services
    .AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
    .AddConfigFilter<ClusterDestinationConfigFilter>()
    .AddConfigFilter<ApiExplorerRouteFilter>()
    .AddTransforms(context => context.RequestTransforms.Add(context.Services.GetRequiredService<BlockInternalApiTransform>()));

if (SharedInfrastructureConfiguration.IsRunningInAzure)
{
    builder.Services.AddSingleton<TokenCredential>(SharedInfrastructureConfiguration.DefaultAzureCredential);
    builder.Services.AddSingleton<ManagedIdentityTransform>();
    builder.Services.AddSingleton<ApiVersionHeaderTransform>();
    builder.Services.AddSingleton<HttpStrictTransportSecurityTransform>();
    reverseProxyBuilder.AddTransforms(context =>
        {
            context.RequestTransforms.Add(context.Services.GetRequiredService<ManagedIdentityTransform>());
            context.RequestTransforms.Add(context.Services.GetRequiredService<ApiVersionHeaderTransform>());
            context.ResponseTransforms.Add(context.Services.GetRequiredService<HttpStrictTransportSecurityTransform>());
        }
    );
}
else
{
    builder.Services.AddSingleton<SharedAccessSignatureRequestTransform>();
    reverseProxyBuilder.AddTransforms(context => context.RequestTransforms.Add(context.Services.GetRequiredService<SharedAccessSignatureRequestTransform>())
    );
}

builder.AddNamedBlobStorages([("account-management-storage", "ACCOUNT_MANAGEMENT_STORAGE_URL")]);

builder.WebHost.UseKestrel(option => option.AddServerHeader = false);

builder.Services.AddHttpClient(
    "AccountManagement",
    client => { client.BaseAddress = new Uri(Environment.GetEnvironmentVariable("ACCOUNT_MANAGEMENT_API_URL") ?? "https://localhost:9100"); }
);

builder.Services.AddHttpClient(
    "FundraiserInternal",
    client => { client.BaseAddress = new Uri(Environment.GetEnvironmentVariable("FUNDRAISER_API_URL") ?? "https://localhost:9300"); }
);

builder.Services
    .AddHttpClient()
    .AddHttpForwardHeaders() // Ensure the correct client IP addresses are set for downstream requests
    .AddOutputCache(options =>
    {
        // Configure tenant-aware caching to prevent cross-tenant cache leakage
        options.AddBasePolicy(TenantAwareCachingPolicy.Instance);
    });

builder.Services
    .AddSingleton(SharedDependencyConfiguration.GetTokenSigningService())
    .AddSingleton<BlockInternalApiTransform>()
    .AddSingleton<AuthenticationCookieMiddleware>()
    .AddSingleton<SecurityHeadersMiddleware>()
    .AddSingleton<RequestValidationMiddleware>()
    .AddScoped<TenantResolutionMiddleware>()
    .AddMemoryCache()
    .AddScoped<ApiAggregationService>();

var app = builder.Build();

app.ApiAggregationEndpoints();

app.UseForwardedHeaders() // Enable support for proxy headers such as X-Forwarded-For and X-Forwarded-Proto. Should run before other middleware.
    .UseMiddleware<RequestValidationMiddleware>() // Validate request size and headers early
    .UseMiddleware<SecurityHeadersMiddleware>() // Add security headers to all responses
    .UseMiddleware<TenantResolutionMiddleware>() // Resolve tenant from subdomain and inject X-Tenant-Id header
    .UseOutputCache()
    .UseMiddleware<AuthenticationCookieMiddleware>();

app.MapScalarApiReference("/openapi", options =>
    {
        options
            .WithOpenApiRoutePattern("/openapi/v1.json")
            .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient)
            .WithTitle("PlatformPlatform API");
    }
);

app.MapReverseProxy();

await app.RunAsync();
