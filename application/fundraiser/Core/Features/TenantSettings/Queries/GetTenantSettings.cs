using System.Collections.Immutable;
using Mapster;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;

namespace PlatformPlatform.Fundraiser.Features.TenantSettings.Queries;

[PublicAPI]
public sealed record GetTenantSettingsQuery : IRequest<Result<TenantSettingsResponse>>;

[PublicAPI]
public sealed record TenantSettingsResponse(
    TenantSettingsId Id,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ModifiedAt,
    ThemeConfigResponse Theme,
    BrandConfigResponse Brand,
    DomainConfigResponse Domain,
    ContentConfigResponse Content,
    PaymentConfigResponse Payment,
    Dictionary<string, bool> FeatureFlags
);

[PublicAPI]
public sealed record PaymentConfigResponse(
    PaymentProvider Provider,
    bool HasApiKey,
    bool HasApiSecret,
    string? MerchantId,
    bool IsTestMode,
    string Currency
);

[PublicAPI]
public sealed record ThemeConfigResponse(
    string PrimaryColor,
    string SecondaryColor,
    string AccentColor,
    string? FontFamily,
    string? FontUrl,
    string? FaviconUrl,
    string? CustomCss
);

[PublicAPI]
public sealed record BrandConfigResponse(
    string? OrganizationName,
    string? Tagline,
    string? SupportEmail,
    string? PhoneNumber,
    SocialLink[]? SocialLinks,
    string? TermsUrl,
    string? PrivacyUrl
);

[PublicAPI]
public sealed record DomainConfigResponse(string? Subdomain, string[]? CustomDomains);

[PublicAPI]
public sealed record ContentConfigResponse(
    string ApplicationLabel,
    string CauseType,
    string BeneficiaryLabel,
    string DonationLabel,
    string CampaignLabel,
    string BranchLabel
);

public sealed class GetTenantSettingsHandler(ITenantSettingsRepository tenantSettingsRepository, IExecutionContext executionContext)
    : IRequestHandler<GetTenantSettingsQuery, Result<TenantSettingsResponse>>
{
    public async Task<Result<TenantSettingsResponse>> Handle(GetTenantSettingsQuery query, CancellationToken cancellationToken)
    {
        var settings = await tenantSettingsRepository.GetByTenantIdAsync(executionContext.TenantId!, cancellationToken);
        if (settings is null)
            return Result<TenantSettingsResponse>.NotFound($"Tenant settings not found for tenant '{executionContext.TenantId}'.");

        var response = new TenantSettingsResponse(
            settings.Id,
            settings.CreatedAt,
            settings.ModifiedAt,
            settings.Theme.Adapt<ThemeConfigResponse>(),
            new BrandConfigResponse(
                settings.Brand.OrganizationName,
                settings.Brand.Tagline,
                settings.Brand.SupportEmail,
                settings.Brand.PhoneNumber,
                settings.Brand.SocialLinks?.ToArray(),
                settings.Brand.TermsUrl,
                settings.Brand.PrivacyUrl
            ),
            new DomainConfigResponse(settings.Domain.Subdomain, settings.Domain.CustomDomains?.ToArray()),
            settings.Content.Adapt<ContentConfigResponse>(),
            new PaymentConfigResponse(
                settings.Payment.Provider,
                !string.IsNullOrEmpty(settings.Payment.ApiKey),
                !string.IsNullOrEmpty(settings.Payment.ApiSecret),
                settings.Payment.MerchantId,
                settings.Payment.IsTestMode,
                settings.Payment.Currency
            ),
            settings.FeatureFlags.ToDictionary()
        );

        return response;
    }
}
