using PlatformPlatform.Fundraiser.Features.Events.Commands;
using PlatformPlatform.Fundraiser.Features.Events.Domain;
using PlatformPlatform.Fundraiser.Features.Events.Queries;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class EventEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/events";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("Events").RequireAuthorization().ProducesValidationProblem();

        group.MapGet("/", async Task<ApiResult<EventSummaryResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetEventsQuery())
        ).Produces<EventSummaryResponse[]>();

        group.MapGet("/{id}", async Task<ApiResult<EventResponse>> (FundraisingEventId id, IMediator mediator)
            => await mediator.Send(new GetEventQuery(id))
        ).Produces<EventResponse>();

        group.MapPost("/", async Task<ApiResult<FundraisingEventId>> (CreateEventCommand command, IMediator mediator)
            => await mediator.Send(command)
        ).Produces<FundraisingEventId>();

        group.MapPut("/{id}", async Task<ApiResult> (FundraisingEventId id, UpdateEventCommand command, IMediator mediator)
            => await mediator.Send(command with { Id = id })
        );
    }
}
