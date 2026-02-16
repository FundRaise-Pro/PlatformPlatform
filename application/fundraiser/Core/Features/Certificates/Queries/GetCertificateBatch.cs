using PlatformPlatform.Fundraiser.Features.Certificates.Domain;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Certificates.Queries;

[PublicAPI]
public sealed record GetCertificateBatchQuery(CertificateIssuanceBatchId Id) : IRequest<Result<CertificateBatchResponse>>;

[PublicAPI]
public sealed record CertificateBatchResponse(
    CertificateIssuanceBatchId Id,
    DateTimeOffset CreatedAt,
    int TaxYear,
    CertificateTemplateId TemplateId,
    BatchStatus Status,
    int TotalCertificates,
    string? GeneratedBy,
    DateTime? CompletedAt,
    string? ErrorMessage,
    TaxCertificateResponse[] Certificates
);

[PublicAPI]
public sealed record TaxCertificateResponse(
    TaxCertificateId Id,
    DonorProfileId DonorProfileId,
    int TaxYear,
    long ReceiptNumber,
    decimal TotalDonated,
    string DonorName,
    CertificateStatus Status,
    string? CertificateUrl
);

public sealed class GetCertificateBatchHandler(
    ICertificateIssuanceBatchRepository batchRepository
) : IRequestHandler<GetCertificateBatchQuery, Result<CertificateBatchResponse>>
{
    public async Task<Result<CertificateBatchResponse>> Handle(GetCertificateBatchQuery query, CancellationToken cancellationToken)
    {
        var batch = await batchRepository.GetByIdWithCertificatesAsync(query.Id, cancellationToken);
        if (batch is null) return Result<CertificateBatchResponse>.NotFound($"Certificate batch with id '{query.Id}' not found.");

        return new CertificateBatchResponse(
            batch.Id,
            batch.CreatedAt,
            batch.TaxYear,
            batch.TemplateId,
            batch.Status,
            batch.TotalCertificates,
            batch.GeneratedBy,
            batch.CompletedAt,
            batch.ErrorMessage,
            batch.Certificates.Select(c => new TaxCertificateResponse(
                c.Id, c.DonorProfileId, c.TaxYear, c.ReceiptNumber,
                c.TotalDonated, c.DonorName, c.Status, c.CertificateUrl
            )).OrderBy(c => c.ReceiptNumber).ToArray()
        );
    }
}
