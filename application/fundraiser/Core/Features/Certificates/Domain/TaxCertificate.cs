using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.StronglyTypedIds;

namespace PlatformPlatform.Fundraiser.Features.Certificates.Domain;

[IdPrefix("txc")]
public sealed record TaxCertificateId(string Value) : StronglyTypedUlid<TaxCertificateId>(Value);

public enum CertificateStatus
{
    Pending = 0,
    Generated = 1,
    Failed = 2
}

/// <summary>
///     An individual Section 18A tax certificate issued to a donor for a specific tax year.
///     Has a monotonically increasing ReceiptNumber allocated via ReceiptNumberAllocator.
/// </summary>
public sealed class TaxCertificate : AggregateRoot<TaxCertificateId>, ITenantScopedEntity
{
    private TaxCertificate(TaxCertificateId id, CertificateIssuanceBatchId batchId, DonorProfileId donorProfileId, int taxYear, long receiptNumber, decimal totalDonated, string donorName) : base(id)
    {
        BatchId = batchId;
        DonorProfileId = donorProfileId;
        TaxYear = taxYear;
        ReceiptNumber = receiptNumber;
        TotalDonated = totalDonated;
        DonorName = donorName;
    }

    public TenantId TenantId { get; private init; } = null!;

    public CertificateIssuanceBatchId BatchId { get; private init; }

    public DonorProfileId DonorProfileId { get; private init; }

    public int TaxYear { get; private init; }

    public long ReceiptNumber { get; private init; }

    public decimal TotalDonated { get; private init; }

    public string DonorName { get; private init; }

    public CertificateStatus Status { get; private set; } = CertificateStatus.Pending;

    public string? CertificateUrl { get; private set; }

    public string? ErrorMessage { get; private set; }

    internal static TaxCertificate Create(
        CertificateIssuanceBatchId batchId,
        DonorProfileId donorProfileId,
        int taxYear,
        long receiptNumber,
        decimal totalDonated,
        string donorName
    )
    {
        return new TaxCertificate(TaxCertificateId.NewId(), batchId, donorProfileId, taxYear, receiptNumber, totalDonated, donorName);
    }

    public void MarkGenerated(string certificateUrl)
    {
        Status = CertificateStatus.Generated;
        CertificateUrl = certificateUrl;
    }

    public void MarkFailed(string errorMessage)
    {
        Status = CertificateStatus.Failed;
        ErrorMessage = errorMessage;
    }
}
