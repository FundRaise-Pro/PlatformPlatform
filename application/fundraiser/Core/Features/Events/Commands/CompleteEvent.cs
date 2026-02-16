using PlatformPlatform.Fundraiser.Features.Events.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Events.Commands;

[PublicAPI]
public sealed record CompleteEventCommand(FundraisingEventId Id) : ICommand, IRequest<Result>;

public sealed class CompleteEventHandler(
    IFundraisingEventRepository eventRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<CompleteEventCommand, Result>
{
    public async Task<Result> Handle(CompleteEventCommand command, CancellationToken cancellationToken)
    {
        var fundraisingEvent = await eventRepository.GetByIdAsync(command.Id, cancellationToken);
        if (fundraisingEvent is null) return Result.NotFound($"Event with id '{command.Id}' not found.");

        if (fundraisingEvent.Status != EventStatus.InProgress)
        {
            return Result.BadRequest($"Event can only be completed from InProgress status. Current: {fundraisingEvent.Status}.");
        }

        fundraisingEvent.Complete();
        eventRepository.Update(fundraisingEvent);

        events.CollectEvent(new FundraisingEventCompleted(fundraisingEvent.Id));
        return Result.Success();
    }
}
