using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Certificates.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Certificates.Commands;

[PublicAPI]
public sealed record CreateCertificateTemplateCommand : ICommand, IRequest<Result<CertificateTemplateId>>
{
    public required string Name { get; init; }
    public string? Description { get; init; }
    public string? OrganisationName { get; init; }
    public string? PboNumber { get; init; }
    public string? OrganisationAddress { get; init; }
    public string? RegistrationNumber { get; init; }
    public string? LogoUrl { get; init; }
    public string? SignatoryName { get; init; }
    public string? SignatoryTitle { get; init; }
}

public sealed class CreateCertificateTemplateValidator : AbstractValidator<CreateCertificateTemplateCommand>
{
    public CreateCertificateTemplateValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.OrganisationName).MaximumLength(300);
        RuleFor(x => x.PboNumber).MaximumLength(50);
        RuleFor(x => x.OrganisationAddress).MaximumLength(500);
        RuleFor(x => x.RegistrationNumber).MaximumLength(100);
        RuleFor(x => x.LogoUrl).MaximumLength(500);
        RuleFor(x => x.SignatoryName).MaximumLength(200);
        RuleFor(x => x.SignatoryTitle).MaximumLength(200);
    }
}

public sealed class CreateCertificateTemplateHandler(
    ICertificateTemplateRepository templateRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<CreateCertificateTemplateCommand, Result<CertificateTemplateId>>
{
    public async Task<Result<CertificateTemplateId>> Handle(CreateCertificateTemplateCommand command, CancellationToken cancellationToken)
    {
        var tenantId = executionContext.TenantId!;
        var template = CertificateTemplate.Create(tenantId, command.Name);

        template.Update(
            command.Name,
            command.Description,
            command.OrganisationName,
            command.PboNumber,
            command.OrganisationAddress,
            command.RegistrationNumber,
            command.LogoUrl,
            command.SignatoryName,
            command.SignatoryTitle
        );

        await templateRepository.AddAsync(template, cancellationToken);
        events.CollectEvent(new CertificateTemplateCreated(template.Id));
        return template.Id;
    }
}
