using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Forms.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Forms.Commands;

[PublicAPI]
public sealed record CreateFormVersionCommand : ICommand, IRequest<Result<FormVersionId>>
{
    public required string VersionNumber { get; init; }

    public required string Name { get; init; }

    public string? Description { get; init; }
}

public sealed class CreateFormVersionValidator : AbstractValidator<CreateFormVersionCommand>
{
    public CreateFormVersionValidator()
    {
        RuleFor(x => x.VersionNumber).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).MaximumLength(2000);
    }
}

public sealed class CreateFormVersionHandler(
    IFormVersionRepository formVersionRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<CreateFormVersionCommand, Result<FormVersionId>>
{
    public async Task<Result<FormVersionId>> Handle(CreateFormVersionCommand command, CancellationToken cancellationToken)
    {
        var formVersion = FormVersion.Create(
            executionContext.TenantId!, command.VersionNumber, command.Name, command.Description
        );

        await formVersionRepository.AddAsync(formVersion, cancellationToken);

        events.CollectEvent(new FormVersionCreated(formVersion.Id));
        return formVersion.Id;
    }
}
