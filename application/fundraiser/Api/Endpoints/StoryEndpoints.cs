using PlatformPlatform.Fundraiser.Features.Stories.Commands;
using PlatformPlatform.Fundraiser.Features.Stories.Domain;
using PlatformPlatform.Fundraiser.Features.Stories.Queries;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class StoryEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/stories";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix)
            .WithTags("Stories").RequireAuthorization().ProducesValidationProblem();

        group.MapGet("/", async Task<ApiResult<StorySummaryResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetStoriesQuery()))
            .Produces<StorySummaryResponse[]>();

        group.MapGet("/{id}", async Task<ApiResult<StoryResponse>> (StoryId id, IMediator mediator)
            => await mediator.Send(new GetStoryQuery(id)))
            .Produces<StoryResponse>();

        group.MapPost("/", async Task<ApiResult<StoryId>> (CreateStoryCommand command, IMediator mediator)
            => await mediator.Send(command))
            .Produces<StoryId>();

        group.MapPut("/{id}", async Task<ApiResult> (StoryId id, UpdateStoryCommand command, IMediator mediator)
            => await mediator.Send(command with { Id = id }));

        group.MapDelete("/{id}", async Task<ApiResult> (StoryId id, IMediator mediator)
            => await mediator.Send(new DeleteStoryCommand(id)));

        group.MapPost("/{id}/publish", async Task<ApiResult> (StoryId id, IMediator mediator)
            => await mediator.Send(new PublishStoryCommand(id)));

        group.MapPost("/{id}/submit-screening", async Task<ApiResult> (StoryId id, IMediator mediator)
            => await mediator.Send(new SubmitStoryForScreeningCommand(id)));

        group.MapPost("/{id}/approve", async Task<ApiResult> (StoryId id, IMediator mediator)
            => await mediator.Send(new ApproveStoryCommand(id)));

        group.MapPost("/{id}/complete-fundraising", async Task<ApiResult> (StoryId id, IMediator mediator)
            => await mediator.Send(new CompleteFundraisingCommand(id)));

        group.MapPost("/{id}/mark-fulfilment-in-progress", async Task<ApiResult> (StoryId id, IMediator mediator)
            => await mediator.Send(new MarkFulfilmentInProgressCommand(id)));

        group.MapPost("/{id}/mark-fulfilled", async Task<ApiResult> (StoryId id, IMediator mediator)
            => await mediator.Send(new MarkFulfilledCommand(id)));

        group.MapPost("/{id}/updates", async Task<ApiResult> (StoryId id, AddStoryUpdateCommand command, IMediator mediator)
            => await mediator.Send(command with { Id = id }));
    }
}
