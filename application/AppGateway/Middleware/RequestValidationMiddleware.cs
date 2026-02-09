namespace PlatformPlatform.AppGateway.Middleware;

/// <summary>
///     Middleware that validates incoming requests to prevent attacks and resource exhaustion.
/// </summary>
public class RequestValidationMiddleware(ILogger<RequestValidationMiddleware> logger) : IMiddleware
{
    // Reasonable limits to prevent abuse
    private const int MaxRequestBodySize = 10 * 1024 * 1024; // 10 MB
    private const int MaxHeaderSize = 32 * 1024; // 32 KB
    private const int MaxHeaderCount = 100;

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        // Validate request body size
        if (context.Request.ContentLength > MaxRequestBodySize)
        {
            logger.LogWarning("Request body too large: {ContentLength} bytes from {ClientIp}",
                context.Request.ContentLength,
                context.Connection.RemoteIpAddress);

            context.Response.StatusCode = StatusCodes.Status413PayloadTooLarge;
            await context.Response.WriteAsync("Request body too large");
            return;
        }

        // Validate header count
        if (context.Request.Headers.Count > MaxHeaderCount)
        {
            logger.LogWarning("Too many headers: {HeaderCount} from {ClientIp}",
                context.Request.Headers.Count,
                context.Connection.RemoteIpAddress);

            context.Response.StatusCode = StatusCodes.Status431RequestHeaderFieldsTooLarge;
            await context.Response.WriteAsync("Too many headers");
            return;
        }

        // Validate total header size
        var totalHeaderSize = context.Request.Headers.Sum(h => h.Key.Length + (h.Value.ToString()?.Length ?? 0));
        if (totalHeaderSize > MaxHeaderSize)
        {
            logger.LogWarning("Headers too large: {HeaderSize} bytes from {ClientIp}",
                totalHeaderSize,
                context.Connection.RemoteIpAddress);

            context.Response.StatusCode = StatusCodes.Status431RequestHeaderFieldsTooLarge;
            await context.Response.WriteAsync("Headers too large");
            return;
        }

        await next(context);
    }
}
