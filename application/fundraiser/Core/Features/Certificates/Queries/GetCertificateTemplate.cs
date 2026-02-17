using PlatformPlatform.Fundraiser.Features.Certificates.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Certificates.Queries;

[PublicAPI]
public sealed record GetCertificateTemplateQuery(CertificateTemplateId Id) : IRequest<Result<CertificateTemplateResponse>>;

[PublicAPI]
public sealed record CertificateTemplateResponse(
    CertificateTemplateId Id,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ModifiedAt,
    string Name,
    string? Description,
    string? OrganisationName,
    string? PboNumber,
    string? OrganisationAddress,
    string? RegistrationNumber,
    string? LogoUrl,
    string? SignatoryName,
    string? SignatoryTitle,
    bool IsDefault
);

public sealed class GetCertificateTemplateHandler(
    ICertificateTemplateRepository templateRepository
) : IRequestHandler<GetCertificateTemplateQuery, Result<CertificateTemplateResponse>>
{
    public async Task<Result<CertificateTemplateResponse>> Handle(GetCertificateTemplateQuery query, CancellationToken cancellationToken)
    {
        var template = await templateRepository.GetByIdAsync(query.Id, cancellationToken);
        if (template is null) return Result<CertificateTemplateResponse>.NotFound($"Certificate template with id '{query.Id}' not found.");

        return new CertificateTemplateResponse(
            template.Id,
            template.CreatedAt,
            template.ModifiedAt,
            template.Name,
            template.Description,
            template.OrganisationName,
            template.PboNumber,
            template.OrganisationAddress,
            template.RegistrationNumber,
            template.LogoUrl,
            template.SignatoryName,
            template.SignatoryTitle,
            template.IsDefault
        );
    }
}
