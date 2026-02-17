using PlatformPlatform.Fundraiser.Features.Certificates.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Certificates.Queries;

[PublicAPI]
public sealed record GetCertificateBatchesQuery : IRequest<Result<CertificateBatchSummaryResponse[]>>;

[PublicAPI]
public sealed record CertificateBatchSummaryResponse(
    CertificateIssuanceBatchId Id,
    int TaxYear,
    CertificateTemplateId TemplateId,
    BatchStatus Status,
    int TotalCertificates,
    string? GeneratedBy,
    DateTime? CompletedAt,
    DateTimeOffset CreatedAt
);

public sealed class GetCertificateBatchesHandler(
    ICertificateIssuanceBatchRepository batchRepository
) : IRequestHandler<GetCertificateBatchesQuery, Result<CertificateBatchSummaryResponse[]>>
{
    public async Task<Result<CertificateBatchSummaryResponse[]>> Handle(GetCertificateBatchesQuery query, CancellationToken cancellationToken)
    {
        var batches = await batchRepository.GetAllAsync(cancellationToken);

        var response = batches.Select(b => new CertificateBatchSummaryResponse(
            b.Id, b.TaxYear, b.TemplateId, b.Status, b.TotalCertificates,
            b.GeneratedBy, b.CompletedAt, b.CreatedAt
        )).ToArray();

        return response;
    }
}
