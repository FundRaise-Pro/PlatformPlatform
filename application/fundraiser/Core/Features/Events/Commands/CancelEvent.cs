using PlatformPlatform.Fundraiser.Features.Events.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Events.Commands;

[PublicAPI]
public sealed record CancelEventCommand(FundraisingEventId Id) : ICommand, IRequest<Result>;

public sealed class CancelEventHandler(
    IFundraisingEventRepository eventRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<CancelEventCommand, Result>
{
    public async Task<Result> Handle(CancelEventCommand command, CancellationToken cancellationToken)
    {
        var fundraisingEvent = await eventRepository.GetByIdAsync(command.Id, cancellationToken);
        if (fundraisingEvent is null) return Result.NotFound($"Event with id '{command.Id}' not found.");

        if (fundraisingEvent.Status == EventStatus.Cancelled)
        {
            return Result.BadRequest("Event is already cancelled.");
        }

        if (fundraisingEvent.Status == EventStatus.Completed)
        {
            return Result.BadRequest("Cannot cancel a completed event.");
        }

        fundraisingEvent.Cancel();
        eventRepository.Update(fundraisingEvent);

        events.CollectEvent(new FundraisingEventCancelled(fundraisingEvent.Id));
        return Result.Success();
    }
}
