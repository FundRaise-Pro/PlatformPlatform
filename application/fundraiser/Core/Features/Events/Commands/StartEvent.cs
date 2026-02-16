using PlatformPlatform.Fundraiser.Features.Events.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Events.Commands;

[PublicAPI]
public sealed record StartEventCommand(FundraisingEventId Id) : ICommand, IRequest<Result>;

public sealed class StartEventHandler(
    IFundraisingEventRepository eventRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<StartEventCommand, Result>
{
    public async Task<Result> Handle(StartEventCommand command, CancellationToken cancellationToken)
    {
        var fundraisingEvent = await eventRepository.GetByIdAsync(command.Id, cancellationToken);
        if (fundraisingEvent is null) return Result.NotFound($"Event with id '{command.Id}' not found.");

        if (fundraisingEvent.Status != EventStatus.Planned)
        {
            return Result.BadRequest($"Event can only be started from Planned status. Current: {fundraisingEvent.Status}.");
        }

        fundraisingEvent.Start();
        eventRepository.Update(fundraisingEvent);

        events.CollectEvent(new FundraisingEventStarted(fundraisingEvent.Id));
        return Result.Success();
    }
}
