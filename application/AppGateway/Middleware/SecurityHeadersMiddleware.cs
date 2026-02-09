namespace PlatformPlatform.AppGateway.Middleware;

/// <summary>
///     Middleware that adds security headers to all responses to protect against common web vulnerabilities.
/// </summary>
public class SecurityHeadersMiddleware : IMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        context.Response.OnStarting(() =>
        {
            var headers = context.Response.Headers;

            // Prevent clickjacking by disallowing the site to be embedded in iframes
            if (!headers.ContainsKey("X-Frame-Options"))
            {
                headers["X-Frame-Options"] = "DENY";
            }

            // Prevent MIME-sniffing attacks
            if (!headers.ContainsKey("X-Content-Type-Options"))
            {
                headers["X-Content-Type-Options"] = "nosniff";
            }

            // Enable XSS protection in older browsers (modern browsers use CSP instead)
            // Note: This header is deprecated but included for defense-in-depth with legacy browsers
            // Modern browsers rely on Content-Security-Policy for XSS protection
            if (!headers.ContainsKey("X-XSS-Protection"))
            {
                headers["X-XSS-Protection"] = "0"; // Set to 0 to avoid introducing vulnerabilities in old browsers
            }

            // Control what information the browser includes in the Referer header
            if (!headers.ContainsKey("Referrer-Policy"))
            {
                headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
            }

            // Content Security Policy - defines trusted sources for content
            if (!headers.ContainsKey("Content-Security-Policy"))
            {
                var cspDirectives = new[]
                {
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline/eval needed for React and HMR
                    "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for styled components
                    "img-src 'self' data: https:",
                    "font-src 'self' data:",
                    "connect-src 'self' https://dc.services.visualstudio.com", // Application Insights
                    "frame-ancestors 'none'", // Same as X-Frame-Options: DENY
                    "base-uri 'self'",
                    "form-action 'self'"
                };

                headers["Content-Security-Policy"] = string.Join("; ", cspDirectives);
            }

            // Prevent browsers from sending sensitive information in requests
            if (!headers.ContainsKey("Permissions-Policy"))
            {
                headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";
            }

            return Task.CompletedTask;
        });

        await next(context);
    }
}
