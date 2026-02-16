# AppGateway Security & Caching Architecture

## Overview

The AppGateway serves as the single entry point for all self-contained systems in PlatformPlatform. It implements critical security measures and caching strategies to ensure tenant isolation, protect against common web vulnerabilities, and optimize performance.

## Tenant Isolation

### Database-Level Isolation
- All tenant-scoped entities implement `ITenantScopedEntity`
- Named query filter `QueryFilterNames.Tenant` automatically filters queries by `ExecutionContext.TenantId`
- Filter applied in `SharedKernelDbContext.ApplyNamedQueryFilters()`
- Ensures complete data isolation at the database query level

### JWT Token-Based Tenant Resolution
- `HttpExecutionContext` extracts `TenantId` from JWT token claims
- Token includes tenant metadata: `tenant_id`, `tenant_name`, `tenant_logo_url`
- `AuthenticationCookieMiddleware` validates and refreshes tokens
- Tenant context flows through all application layers

### Cache Isolation
- `TenantAwareCachingPolicy` varies cache keys by tenant ID
- Prevents cross-tenant cache leakage
- Authenticated API requests are never cached
- Only GET/HEAD requests eligible for caching

## Security Headers

### Implemented Headers

#### X-Frame-Options: DENY
- Prevents clickjacking attacks
- Disallows embedding site in iframes
- Protects against UI redressing attacks

#### X-Content-Type-Options: nosniff
- Prevents MIME-sniffing attacks
- Forces browsers to respect declared Content-Type
- Protects against content-type confusion exploits

#### Content-Security-Policy (CSP)
Strict CSP directives to prevent XSS and code injection:
- `default-src 'self'` - Only allow resources from same origin
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` - Allow inline scripts for React/HMR
- `style-src 'self' 'unsafe-inline'` - Allow inline styles for styled components
- `img-src 'self' data: https:` - Allow images from secure sources
- `connect-src 'self' https://dc.services.visualstudio.com` - Allow Application Insights
- `frame-ancestors 'none'` - Reinforces X-Frame-Options
- `base-uri 'self'` - Prevent base tag injection
- `form-action 'self'` - Restrict form submissions

#### Referrer-Policy: strict-origin-when-cross-origin
- Protects user privacy
- Sends full URL for same-origin requests
- Sends only origin for cross-origin requests

#### Permissions-Policy
- Restricts browser features: `geolocation=(), microphone=(), camera=()`
- Prevents unauthorized access to sensitive APIs

#### HTTP Strict Transport Security (HSTS)
- `max-age=31536000` (1 year - industry best practice)
- Forces HTTPS connections
- Applied by `HttpStrictTransportSecurityTransform` in Azure

## Request Validation

### Limits
- **Max request body**: 10 MB (prevents resource exhaustion)
- **Max header size**: 32 KB (prevents header injection attacks)
- **Max header count**: 100 (prevents DoS via header flooding)

### Response Codes
- `413 Payload Too Large` - Request body exceeds limit
- `431 Request Header Fields Too Large` - Headers exceed limits

## Trust Boundaries

### Forwarded Headers
- `UseForwardedHeaders()` middleware processes proxy headers
- Reads `X-Forwarded-For` for client IP extraction
- Normalizes loopback addresses (IPv6 ::1 → IPv4 127.0.0.1)
- **Critical**: Only trust forwarded headers from known proxies

### Internal API Protection
- `BlockInternalApiTransform` blocks external access to `/internal-api/*`
- Returns `403 Forbidden` for unauthorized access
- Protects sensitive internal endpoints

### Cookie Security
- **Refresh Token Cookie**:
  - `HttpOnly=true` (prevents XSS access)
  - `Secure=true` (requires HTTPS)
  - `SameSite=Lax` (allows cross-site redirects to login)
  - Expires with refresh token lifetime

- **Access Token Cookie**:
  - `HttpOnly=true` (prevents XSS access)
  - `Secure=true` (requires HTTPS)
  - `SameSite=Strict` (prevents CSRF)
  - No expiry (session cookie)

## Middleware Execution Order

```
1. UseForwardedHeaders()              // Process proxy headers first
2. RequestValidationMiddleware        // Validate request early
3. SecurityHeadersMiddleware          // Add security headers to responses
4. UseOutputCache()                   // Apply tenant-aware caching
5. AuthenticationCookieMiddleware     // Convert cookies to Bearer tokens
6. MapReverseProxy()                  // Route to downstream services
```

**Critical**: Order matters! Validation and security headers must run before authentication and routing.

## Caching Strategy

### When Caching is Applied
- Only GET and HEAD requests
- Only for unauthenticated requests OR public static resources
- Only for successful responses (200 OK, 301 Moved Permanently)
- Never when Set-Cookie header is present

### Cache Key Variation
- **Tenant ID**: Ensures complete cache isolation between tenants
- **Query string**: All query parameters (`*`)
- **Path**: Implicit (part of cache key)

### Static Resource Caching
Configured in `appsettings.json` with appropriate `Cache-Control` headers:
- **Avatars/Logos**: `public, max-age=2592000, immutable` (30 days)
- **Static assets**: `public, max-age=604800` (7 days)
- **Favicon**: `public, max-age=604800` (7 days)
- **Legal documents**: `no-cache, no-store, must-revalidate` (always fresh)

### Cache Invalidation
- Tenant-scoped: Cache automatically segregated by tenant ID
- User switches tenant: New tenant ID → different cache partition
- Session revoked: Authentication cookies deleted → no cache hit for authenticated content

## Security Considerations

### Preventing Tenant Spoofing
1. **JWT signature validation**: Tokens cryptographically signed and verified
2. **Token expiration**: Short-lived access tokens (configurable)
3. **Session revocation**: Immediate invalidation on logout/security events
4. **Cache isolation**: Tenant ID from validated JWT included in cache key
5. **Database filtering**: Named query filters enforce tenant scoping

### Preventing Cache Timing Attacks
- No caching of authenticated API responses
- Cache keys include unpredictable tenant IDs (not sequential)
- Query string variation prevents cache key prediction

### Session Security
- Refresh token rotation on use
- Session tracking in database
- IP address logging for forensics
- User-agent tracking for anomaly detection
- Session revocation API endpoint

## Monitoring & Logging

### Logged Events
- Request validation failures (body/header size violations)
- Session revocation events
- Authentication token refresh failures
- Unauthorized internal API access attempts

### Metrics to Monitor
- Cache hit rate by tenant
- Request validation rejection rate
- Session revocation frequency
- Authentication token refresh rate
- Average response times by route

## Production Deployment Checklist

- [ ] Configure trusted proxy addresses for ForwardedHeaders
- [ ] Set up distributed cache (Redis) for multi-instance deployments
- [ ] Configure cache expiration policies per environment
- [ ] Review CSP directives for production (remove unsafe-inline/eval if possible)
- [ ] Enable rate limiting per tenant/user
- [ ] Configure HSTS preload for production domain
- [ ] Set up monitoring alerts for security events
- [ ] Test tenant isolation with real user scenarios
- [ ] Verify no cross-tenant cache leakage
- [ ] Audit all internal API endpoints for proper protection

## Future Enhancements

### Planned
- Rate limiting per tenant (quota enforcement)
- Distributed cache (Redis) with tenant partitioning
- API versioning and deprecation strategy
- DDoS protection integration
- Web Application Firewall (WAF) rules
- Circuit breaker pattern for downstream services

### Under Consideration
- Request/response encryption for sensitive data
- Tenant-specific connection pooling
- Advanced cache warming strategies
- Real-time security event streaming
- Automated security testing in CI/CD
