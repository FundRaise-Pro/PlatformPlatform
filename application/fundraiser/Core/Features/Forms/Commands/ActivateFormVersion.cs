using PlatformPlatform.Fundraiser.Features.Forms.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Forms.Commands;

[PublicAPI]
public sealed record ActivateFormVersionCommand(FormVersionId Id) : ICommand, IRequest<Result>;

public sealed class ActivateFormVersionHandler(
    IFormVersionRepository formVersionRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<ActivateFormVersionCommand, Result>
{
    public async Task<Result> Handle(ActivateFormVersionCommand command, CancellationToken cancellationToken)
    {
        var formVersion = await formVersionRepository.GetByIdAsync(command.Id, cancellationToken);
        if (formVersion is null) return Result.NotFound($"Form version with id '{command.Id}' not found.");

        // Deactivate the current active version
        var currentActive = await formVersionRepository.GetActiveAsync(cancellationToken);
        if (currentActive is not null && currentActive.Id != formVersion.Id)
        {
            currentActive.Deactivate();
            formVersionRepository.Update(currentActive);
        }

        formVersion.Activate();
        formVersionRepository.Update(formVersion);

        events.CollectEvent(new FormVersionActivated(formVersion.Id));
        return Result.Success();
    }
}
