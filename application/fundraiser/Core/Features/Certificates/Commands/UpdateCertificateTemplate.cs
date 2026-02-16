using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Certificates.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Certificates.Commands;

[PublicAPI]
public sealed record UpdateCertificateTemplateCommand : ICommand, IRequest<Result>
{
    public required CertificateTemplateId Id { get; init; }
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

public sealed class UpdateCertificateTemplateValidator : AbstractValidator<UpdateCertificateTemplateCommand>
{
    public UpdateCertificateTemplateValidator()
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

public sealed class UpdateCertificateTemplateHandler(
    ICertificateTemplateRepository templateRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<UpdateCertificateTemplateCommand, Result>
{
    public async Task<Result> Handle(UpdateCertificateTemplateCommand command, CancellationToken cancellationToken)
    {
        var template = await templateRepository.GetByIdAsync(command.Id, cancellationToken);
        if (template is null) return Result.NotFound($"Certificate template with id '{command.Id}' not found.");

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

        templateRepository.Update(template);
        events.CollectEvent(new CertificateTemplateUpdated(template.Id));
        return Result.Success();
    }
}
