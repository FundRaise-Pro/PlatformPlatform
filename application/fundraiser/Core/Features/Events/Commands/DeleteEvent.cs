using PlatformPlatform.Fundraiser.Features.Events.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Events.Commands;

[PublicAPI]
public sealed record DeleteEventCommand(FundraisingEventId Id) : ICommand, IRequest<Result>;

public sealed class DeleteEventHandler(
    IFundraisingEventRepository eventRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<DeleteEventCommand, Result>
{
    public async Task<Result> Handle(DeleteEventCommand command, CancellationToken cancellationToken)
    {
        var fundraisingEvent = await eventRepository.GetByIdAsync(command.Id, cancellationToken);
        if (fundraisingEvent is null) return Result.NotFound($"Event with id '{command.Id}' not found.");

        eventRepository.Remove(fundraisingEvent);

        events.CollectEvent(new FundraisingEventDeleted(fundraisingEvent.Id));
        return Result.Success();
    }
}
