using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.Fundraiser.Features.Events.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Events.Commands;

[PublicAPI]
public sealed record CreateEventCommand : ICommand, IRequest<Result<FundraisingEventId>>
{
    public required string Name { get; init; }

    public required string Description { get; init; }

    public required DateTime EventDate { get; init; }

    public string? Location { get; init; }

    public decimal TargetAmount { get; init; }

    public string? CampaignId { get; init; }
}

public sealed class CreateEventValidator : AbstractValidator<CreateEventCommand>
{
    public CreateEventValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.EventDate).GreaterThan(DateTime.UtcNow).WithMessage("Event date must be in the future.");
        RuleFor(x => x.TargetAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CampaignId)
            .Must(id => string.IsNullOrWhiteSpace(id) || CampaignId.TryParse(id, out _))
            .WithMessage("Campaign ID is invalid.");
    }
}

public sealed class CreateEventHandler(
    IFundraisingEventRepository eventRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<CreateEventCommand, Result<FundraisingEventId>>
{
    public async Task<Result<FundraisingEventId>> Handle(CreateEventCommand command, CancellationToken cancellationToken)
    {
        CampaignId? campaignId = null;
        if (!string.IsNullOrWhiteSpace(command.CampaignId) && !CampaignId.TryParse(command.CampaignId, out campaignId))
        {
            return Result<FundraisingEventId>.BadRequest("Campaign ID is invalid.");
        }

        var fundraisingEvent = FundraisingEvent.Create(
            executionContext.TenantId!, command.Name, command.Description,
            command.EventDate, command.Location, command.TargetAmount, campaignId
        );

        await eventRepository.AddAsync(fundraisingEvent, cancellationToken);

        events.CollectEvent(new FundraisingEventCreated(fundraisingEvent.Id));
        return fundraisingEvent.Id;
    }
}
