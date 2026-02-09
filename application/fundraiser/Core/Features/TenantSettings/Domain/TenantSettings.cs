using System.Collections.Immutable;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
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
        Payment = new PaymentConfig();
        FeatureFlags = ImmutableDictionary<string, bool>.Empty;
    }

    public TenantId TenantId { get; private init; }

    public ThemeConfig Theme { get; private set; }

    public BrandConfig Brand { get; private set; }

    public DomainConfig Domain { get; private set; }

    public ContentConfig Content { get; private set; }

    public PaymentConfig Payment { get; private set; }

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

    public void UpdatePayment(PaymentConfig payment)
    {
        Payment = payment;
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

public sealed record BrandConfig
{
    public string? OrganizationName { get; init; }
    public string? Tagline { get; init; }
    public string? SupportEmail { get; init; }
    public string? PhoneNumber { get; init; }
    public SocialLink[]? SocialLinks { get; init; }
    public string? TermsUrl { get; init; }
    public string? PrivacyUrl { get; init; }

    public BrandConfig() { }

    public BrandConfig(
        string? organizationName,
        string? tagline,
        string? supportEmail,
        string? phoneNumber,
        SocialLink[]? socialLinks,
        string? termsUrl,
        string? privacyUrl
    )
    {
        OrganizationName = organizationName;
        Tagline = tagline;
        SupportEmail = supportEmail;
        PhoneNumber = phoneNumber;
        SocialLinks = socialLinks;
        TermsUrl = termsUrl;
        PrivacyUrl = privacyUrl;
    }
}

public sealed record SocialLink(string Platform, string Url);

public sealed record DomainConfig
{
    public string? Subdomain { get; init; }
    public string[]? CustomDomains { get; init; }

    public DomainConfig() { }

    public DomainConfig(string? subdomain, string[]? customDomains)
    {
        Subdomain = subdomain;
        CustomDomains = customDomains;
    }
}

public sealed record ContentConfig(
    string ApplicationLabel = "Application",
    string CauseType = "Cause",
    string BeneficiaryLabel = "Beneficiary",
    string DonationLabel = "Donation",
    string CampaignLabel = "Campaign",
    string BranchLabel = "Branch"
);

public sealed record PaymentConfig(
    PaymentProvider Provider = PaymentProvider.PayFast,
    string? ApiKey = null,
    string? ApiSecret = null,
    string? MerchantId = null,
    string? WebhookSecret = null,
    bool IsTestMode = true,
    string Currency = "ZAR"
);
