using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.StronglyTypedIds;

namespace PlatformPlatform.Fundraiser.Features.Certificates.Domain;

[IdPrefix("cib")]
public sealed record CertificateIssuanceBatchId(string Value) : StronglyTypedUlid<CertificateIssuanceBatchId>(Value);

public enum BatchStatus
{
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3
}

/// <summary>
///     Represents a batch run of tax certificate generation for a given tax year.
///     Each batch produces one TaxCertificate per eligible donor.
/// </summary>
public sealed class CertificateIssuanceBatch : AggregateRoot<CertificateIssuanceBatchId>, ITenantScopedEntity
{
    private CertificateIssuanceBatch(CertificateIssuanceBatchId id, TenantId tenantId, int taxYear, CertificateTemplateId templateId) : base(id)
    {
        TenantId = tenantId;
        TaxYear = taxYear;
        TemplateId = templateId;
    }

    public TenantId TenantId { get; private init; }

    public int TaxYear { get; private init; }

    public CertificateTemplateId TemplateId { get; private init; }

    public BatchStatus Status { get; private set; } = BatchStatus.Pending;

    public int TotalCertificates { get; private set; }

    public string? GeneratedBy { get; private set; }

    public DateTime? CompletedAt { get; private set; }

    public string? ErrorMessage { get; private set; }

    private readonly List<TaxCertificate> _certificates = [];
    public IReadOnlyCollection<TaxCertificate> Certificates => _certificates.AsReadOnly();

    public static CertificateIssuanceBatch Create(TenantId tenantId, int taxYear, CertificateTemplateId templateId, string generatedBy)
    {
        return new CertificateIssuanceBatch(CertificateIssuanceBatchId.NewId(), tenantId, taxYear, templateId)
        {
            GeneratedBy = generatedBy,
            Status = BatchStatus.Processing
        };
    }

    public TaxCertificate AddCertificate(DonorProfileId donorProfileId, long receiptNumber, decimal totalDonated, string donorName)
    {
        var certificate = TaxCertificate.Create(Id, donorProfileId, TaxYear, receiptNumber, totalDonated, donorName);
        _certificates.Add(certificate);
        TotalCertificates = _certificates.Count;
        return certificate;
    }

    public void MarkCompleted()
    {
        Status = BatchStatus.Completed;
        CompletedAt = DateTime.UtcNow;
    }

    public void MarkFailed(string errorMessage)
    {
        Status = BatchStatus.Failed;
        ErrorMessage = errorMessage;
    }
}
