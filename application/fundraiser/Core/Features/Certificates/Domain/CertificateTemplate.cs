using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.StronglyTypedIds;

namespace PlatformPlatform.Fundraiser.Features.Certificates.Domain;

[IdPrefix("ctp")]
public sealed record CertificateTemplateId(string Value) : StronglyTypedUlid<CertificateTemplateId>(Value);

/// <summary>
///     A tenant-configurable template used for Section 18A tax certificate PDF generation.
///     Contains the organisation details printed on every certificate.
/// </summary>
public sealed class CertificateTemplate : AggregateRoot<CertificateTemplateId>, ITenantScopedEntity
{
    private CertificateTemplate(CertificateTemplateId id, TenantId tenantId, string name) : base(id)
    {
        TenantId = tenantId;
        Name = name;
    }

    public TenantId TenantId { get; private init; }

    public string Name { get; private set; }

    public string? Description { get; private set; }

    // Organisation details for the certificate
    public string? OrganisationName { get; private set; }

    public string? PboNumber { get; private set; }

    public string? OrganisationAddress { get; private set; }

    public string? RegistrationNumber { get; private set; }

    public string? LogoUrl { get; private set; }

    // Signatory
    public string? SignatoryName { get; private set; }

    public string? SignatoryTitle { get; private set; }

    public bool IsDefault { get; private set; }

    public static CertificateTemplate Create(TenantId tenantId, string name)
    {
        return new CertificateTemplate(CertificateTemplateId.NewId(), tenantId, name);
    }

    public void Update(
        string name,
        string? description,
        string? organisationName,
        string? pboNumber,
        string? organisationAddress,
        string? registrationNumber,
        string? logoUrl,
        string? signatoryName,
        string? signatoryTitle
    )
    {
        Name = name;
        Description = description;
        OrganisationName = organisationName;
        PboNumber = pboNumber;
        OrganisationAddress = organisationAddress;
        RegistrationNumber = registrationNumber;
        LogoUrl = logoUrl;
        SignatoryName = signatoryName;
        SignatoryTitle = signatoryTitle;
    }

    public void SetAsDefault()
    {
        IsDefault = true;
    }

    public void ClearDefault()
    {
        IsDefault = false;
    }
}
