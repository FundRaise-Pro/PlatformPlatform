using System.Collections.Immutable;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.StronglyTypedIds;

namespace PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;

[IdPrefix("tset")]
[JsonConverter(typeof(StronglyTypedIdJsonConverter<string, TenantSettingsId>))]
public sealed record TenantSettingsId(string Value) : StronglyTypedUlid<TenantSettingsId>(Value)
{
    public override string ToString() => Value;
}

public sealed class TenantSettings : AggregateRoot<TenantSettingsId>, ITenantScopedEntity
{
    private TenantSettings(TenantId tenantId) : base(TenantSettingsId.NewId())
    {
        TenantId = tenantId;
        Theme = new ThemeConfig();
        Brand = new BrandConfig();
        Domain = new DomainConfig();
        Content = new ContentConfig();
        FeatureFlags = ImmutableDictionary<string, bool>.Empty;
    }

    public TenantId TenantId { get; private init; }

    public ThemeConfig Theme { get; private set; }

    public BrandConfig Brand { get; private set; }

    public DomainConfig Domain { get; private set; }

    public ContentConfig Content { get; private set; }

    public ImmutableDictionary<string, bool> FeatureFlags { get; private set; }

    public static TenantSettings Create(TenantId tenantId)
    {
        return new TenantSettings(tenantId);
    }

    public void UpdateTheme(ThemeConfig theme)
    {
        Theme = theme;
    }

    public void UpdateBrand(BrandConfig brand)
    {
        Brand = brand;
    }

    public void UpdateDomain(DomainConfig domain)
    {
        Domain = domain;
    }

    public void UpdateContent(ContentConfig content)
    {
        Content = content;
    }

    public void SetFeatureFlag(string flag, bool enabled)
    {
        FeatureFlags = FeatureFlags.SetItem(flag, enabled);
    }

    public void UpdateFeatureFlags(ImmutableDictionary<string, bool> flags)
    {
        FeatureFlags = flags;
    }

    public bool IsFeatureEnabled(string flag)
    {
        return FeatureFlags.TryGetValue(flag, out var enabled) && enabled;
    }
}

public sealed record ThemeConfig(
    string PrimaryColor = "#10b981",
    string SecondaryColor = "#064e3b",
    string AccentColor = "#f59e0b",
    string? FontFamily = null,
    string? FontUrl = null,
    string? FaviconUrl = null,
    string? CustomCss = null
);

public sealed record BrandConfig(
    string? OrganizationName = null,
    string? Tagline = null,
    string? SupportEmail = null,
    string? PhoneNumber = null,
    ImmutableArray<SocialLink>? SocialLinks = null,
    string? TermsUrl = null,
    string? PrivacyUrl = null
);

public sealed record SocialLink(string Platform, string Url);

public sealed record DomainConfig(
    string? Subdomain = null,
    ImmutableArray<string>? CustomDomains = null
);

public sealed record ContentConfig(
    string ApplicationLabel = "Application",
    string CauseType = "Cause",
    string BeneficiaryLabel = "Beneficiary",
    string DonationLabel = "Donation",
    string CampaignLabel = "Campaign",
    string BranchLabel = "Branch"
);
