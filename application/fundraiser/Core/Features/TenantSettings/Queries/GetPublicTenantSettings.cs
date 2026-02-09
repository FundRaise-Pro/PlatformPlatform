using Mapster;
using PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;

namespace PlatformPlatform.Fundraiser.Features.TenantSettings.Queries;

[PublicAPI]
public sealed record GetPublicTenantSettingsQuery : IRequest<Result<PublicTenantSettingsResponse>>;

[PublicAPI]
public sealed record PublicTenantSettingsResponse(
    ThemeConfigResponse Theme,
    PublicBrandResponse Brand,
    ContentConfigResponse Content,
    Dictionary<string, bool> FeatureFlags
);

[PublicAPI]
public sealed record PublicBrandResponse(string? OrganizationName, string? Tagline, SocialLink[]? SocialLinks, string? TermsUrl, string? PrivacyUrl);

public sealed class GetPublicTenantSettingsHandler(ITenantSettingsRepository tenantSettingsRepository, IExecutionContext executionContext)
    : IRequestHandler<GetPublicTenantSettingsQuery, Result<PublicTenantSettingsResponse>>
{
    public async Task<Result<PublicTenantSettingsResponse>> Handle(GetPublicTenantSettingsQuery query, CancellationToken cancellationToken)
    {
        var settings = await tenantSettingsRepository.GetByTenantIdAsync(executionContext.TenantId!, cancellationToken);
        if (settings is null)
            return Result<PublicTenantSettingsResponse>.NotFound($"Tenant settings not found for tenant '{executionContext.TenantId}'.");

        var response = new PublicTenantSettingsResponse(
            settings.Theme.Adapt<ThemeConfigResponse>(),
            new PublicBrandResponse(
                settings.Brand.OrganizationName,
                settings.Brand.Tagline,
                settings.Brand.SocialLinks?.ToArray(),
                settings.Brand.TermsUrl,
                settings.Brand.PrivacyUrl
            ),
            settings.Content.Adapt<ContentConfigResponse>(),
            settings.FeatureFlags.ToDictionary()
        );

        return response;
    }
}
