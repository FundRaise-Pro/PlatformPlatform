using PlatformPlatform.Fundraiser.Features.Forms.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Forms.Commands;

[PublicAPI]
public sealed record PublishFormTemplateCommand(FormTemplateId Id) : ICommand, IRequest<Result>;

public sealed class PublishFormTemplateHandler(
    IFormTemplateRepository formTemplateRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<PublishFormTemplateCommand, Result>
{
    public async Task<Result> Handle(PublishFormTemplateCommand command, CancellationToken cancellationToken)
    {
        var template = await formTemplateRepository.GetByIdAsync(command.Id, cancellationToken);
        if (template is null)
            return Result.NotFound($"Form template '{command.Id}' not found.");

        template.Publish();
        formTemplateRepository.Update(template);

        events.CollectEvent(new FormTemplatePublished(template.Id));
        return Result.Success();
    }
}
