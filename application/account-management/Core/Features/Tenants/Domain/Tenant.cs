using PlatformPlatform.SharedKernel.Domain;

namespace PlatformPlatform.AccountManagement.Features.Tenants.Domain;

public sealed class Tenant : AggregateRoot<TenantId>
{
    private Tenant() : base(TenantId.NewId())
    {
        State = TenantState.Trial;
        Logo = new Logo();
    }

    public string Name { get; private set; } = string.Empty;

    public string Slug { get; private set; } = string.Empty;

    public NpoType OrgType { get; private set; }

    public string? RegistrationNumber { get; private set; }

    public string? Description { get; private set; }

    public string? Country { get; private set; }

    public TenantState State { get; private set; }

    public Logo Logo { get; private set; }

    public static Tenant Create(string email, string name, string slug, NpoType orgType, string country, string? registrationNumber = null, string? description = null)
    {
        var (isValid, reason) = TenantSlugValidator.Validate(slug);
        if (!isValid) throw new ArgumentException(reason, nameof(slug));

        var tenant = new Tenant
        {
            Name = name,
            Slug = slug,
            OrgType = orgType,
            Country = country,
            RegistrationNumber = registrationNumber,
            Description = description
        };
        tenant.AddDomainEvent(new TenantCreatedEvent(tenant.Id, email));
        return tenant;
    }

    public void UpdateProfile(string name, NpoType orgType, string? country, string? registrationNumber, string? description)
    {
        Name = name;
        OrgType = orgType;
        Country = country;
        RegistrationNumber = registrationNumber;
        Description = description;
    }

    public void Update(string tenantName)
    {
        Name = tenantName;
    }

    public void UpdateLogo(string logoUrl)
    {
        Logo = new Logo(logoUrl, Logo.Version + 1);
    }

    public void RemoveLogo()
    {
        Logo = new Logo(Version: Logo.Version);
    }
}

public sealed record Logo(string? Url = null, int Version = 0);
