using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Events.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Events.Commands;

[PublicAPI]
public sealed record UpdateEventCommand : ICommand, IRequest<Result>
{
    public required FundraisingEventId Id { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required DateTime EventDate { get; init; }

    public string? Location { get; init; }

    public decimal TargetAmount { get; init; }
}

public sealed class UpdateEventValidator : AbstractValidator<UpdateEventCommand>
{
    public UpdateEventValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.TargetAmount).GreaterThanOrEqualTo(0);
    }
}

public sealed class UpdateEventHandler(
    IFundraisingEventRepository eventRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<UpdateEventCommand, Result>
{
    public async Task<Result> Handle(UpdateEventCommand command, CancellationToken cancellationToken)
    {
        var fundraisingEvent = await eventRepository.GetByIdAsync(command.Id, cancellationToken);
        if (fundraisingEvent is null) return Result.NotFound($"Event with id '{command.Id}' not found.");

        fundraisingEvent.Update(command.Name, command.Description, command.EventDate, command.Location);
        fundraisingEvent.SetTarget(command.TargetAmount);
        eventRepository.Update(fundraisingEvent);

        events.CollectEvent(new FundraisingEventUpdated(fundraisingEvent.Id));
        return Result.Success();
    }
}
