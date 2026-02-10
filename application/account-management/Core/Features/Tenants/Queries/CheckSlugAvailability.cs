using JetBrains.Annotations;
using PlatformPlatform.AccountManagement.Features.Tenants.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.AccountManagement.Features.Tenants.Queries;

[PublicAPI]
public sealed record CheckSlugAvailabilityQuery(string Slug) : IRequest<Result<SlugAvailabilityResponse>>;

[PublicAPI]
public sealed record SlugAvailabilityResponse(bool Available, string CanonicalSlug, string? Reason);

public sealed class CheckSlugAvailabilityHandler(ITenantRepository tenantRepository)
    : IRequestHandler<CheckSlugAvailabilityQuery, Result<SlugAvailabilityResponse>>
{
    public async Task<Result<SlugAvailabilityResponse>> Handle(CheckSlugAvailabilityQuery query, CancellationToken cancellationToken)
    {
        var canonical = TenantSlugValidator.Canonicalize(query.Slug);
        var (isValid, reason) = TenantSlugValidator.Validate(canonical);

        if (!isValid)
        {
            return new SlugAvailabilityResponse(false, canonical, reason);
        }

        var exists = await tenantRepository.SlugExistsAsync(canonical, cancellationToken);

        return new SlugAvailabilityResponse(!exists, canonical, exists ? "This slug is already taken." : null);
    }
}
