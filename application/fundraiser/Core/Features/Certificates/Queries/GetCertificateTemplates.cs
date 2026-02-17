using PlatformPlatform.Fundraiser.Features.Certificates.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Certificates.Queries;

[PublicAPI]
public sealed record GetCertificateTemplatesQuery : IRequest<Result<CertificateTemplateSummaryResponse[]>>;

[PublicAPI]
public sealed record CertificateTemplateSummaryResponse(
    CertificateTemplateId Id,
    string Name,
    string? Description,
    string? OrganisationName,
    string? PboNumber,
    bool IsDefault,
    DateTimeOffset CreatedAt
);

public sealed class GetCertificateTemplatesHandler(
    ICertificateTemplateRepository templateRepository
) : IRequestHandler<GetCertificateTemplatesQuery, Result<CertificateTemplateSummaryResponse[]>>
{
    public async Task<Result<CertificateTemplateSummaryResponse[]>> Handle(GetCertificateTemplatesQuery query, CancellationToken cancellationToken)
    {
        var templates = await templateRepository.GetAllAsync(cancellationToken);

        var response = templates.Select(t => new CertificateTemplateSummaryResponse(
            t.Id, t.Name, t.Description, t.OrganisationName, t.PboNumber, t.IsDefault, t.CreatedAt
        )).ToArray();

        return response;
    }
}
