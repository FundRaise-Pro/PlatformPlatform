using System.Collections.Immutable;
using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Forms.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Forms.Commands;

[PublicAPI]
public sealed record CreateFormTemplateCommand : ICommand, IRequest<Result<FormTemplateId>>
{
    public required string Name { get; init; }

    public required string Category { get; init; }

    public string? Description { get; init; }
}

public sealed class CreateFormTemplateValidator : AbstractValidator<CreateFormTemplateCommand>
{
    public CreateFormTemplateValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200).WithMessage("Name must be between 1 and 200 characters.");
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100).WithMessage("Category must be between 1 and 100 characters.");
        RuleFor(x => x.Description).MaximumLength(1000).WithMessage("Description must be at most 1000 characters.");
    }
}

public sealed class CreateFormTemplateHandler(
    IFormTemplateRepository formTemplateRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<CreateFormTemplateCommand, Result<FormTemplateId>>
{
    public async Task<Result<FormTemplateId>> Handle(CreateFormTemplateCommand command, CancellationToken cancellationToken)
    {
        var template = FormTemplate.Create(command.Name, command.Category, command.Description);

        await formTemplateRepository.AddAsync(template, cancellationToken);

        events.CollectEvent(new FormTemplateCreated(template.Id, command.Category));
        return template.Id;
    }
}
