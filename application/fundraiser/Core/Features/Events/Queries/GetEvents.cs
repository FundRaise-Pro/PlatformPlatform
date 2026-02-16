using PlatformPlatform.Fundraiser.Features.Events.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Events.Queries;

[PublicAPI]
public sealed record GetEventsQuery : IRequest<Result<EventSummaryResponse[]>>;

[PublicAPI]
public sealed record EventSummaryResponse(
    FundraisingEventId Id,
    string Name,
    string? Location,
    DateTime EventDate,
    decimal TargetAmount,
    EventStatus Status,
    string? ImageUrl,
    DateTimeOffset CreatedAt
);

[PublicAPI]
public sealed record GetEventQuery(FundraisingEventId Id) : IRequest<Result<EventResponse>>;

[PublicAPI]
public sealed record EventResponse(
    FundraisingEventId Id,
    string Name,
    string Description,
    string? Location,
    DateTime EventDate,
    decimal TargetAmount,
    EventStatus Status,
    string? ImageUrl,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ModifiedAt
);

public sealed class GetEventsHandler(IFundraisingEventRepository eventRepository)
    : IRequestHandler<GetEventsQuery, Result<EventSummaryResponse[]>>
{
    public async Task<Result<EventSummaryResponse[]>> Handle(GetEventsQuery query, CancellationToken cancellationToken)
    {
        var events = await eventRepository.GetAllAsync(cancellationToken);

        var response = events.Select(e => new EventSummaryResponse(
            e.Id, e.Name, e.Location, e.EventDate, e.TargetAmount, e.Status, e.ImageUrl, e.CreatedAt
        )).ToArray();

        return response;
    }
}

public sealed class GetEventHandler(IFundraisingEventRepository eventRepository)
    : IRequestHandler<GetEventQuery, Result<EventResponse>>
{
    public async Task<Result<EventResponse>> Handle(GetEventQuery query, CancellationToken cancellationToken)
    {
        var fundraisingEvent = await eventRepository.GetByIdAsync(query.Id, cancellationToken);
        if (fundraisingEvent is null) return Result<EventResponse>.NotFound($"Event with id '{query.Id}' not found.");

        return new EventResponse(
            fundraisingEvent.Id, fundraisingEvent.Name, fundraisingEvent.Description,
            fundraisingEvent.Location, fundraisingEvent.EventDate, fundraisingEvent.TargetAmount,
            fundraisingEvent.Status, fundraisingEvent.ImageUrl,
            fundraisingEvent.CreatedAt, fundraisingEvent.ModifiedAt
        );
    }
}
