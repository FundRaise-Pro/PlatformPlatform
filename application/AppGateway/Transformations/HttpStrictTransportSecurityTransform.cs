using Yarp.ReverseProxy.Transforms;

namespace PlatformPlatform.AppGateway.Transformations;

/// <summary>
///     Adds HTTP Strict Transport Security (HSTS) header to responses.
///     HSTS forces browsers to use HTTPS for all future requests to this domain.
/// </summary>
public class HttpStrictTransportSecurityTransform()
    : ResponseHeaderValueTransform("Strict-Transport-Security", "max-age=31536000", false, ResponseCondition.Success); // 1 year as recommended by industry best practices
