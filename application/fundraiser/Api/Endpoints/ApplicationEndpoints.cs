using PlatformPlatform.Fundraiser.Features.Applications.Commands;
using PlatformPlatform.Fundraiser.Features.Applications.Domain;
using PlatformPlatform.Fundraiser.Features.Applications.Queries;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class ApplicationEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/applications";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("Applications").RequireAuthorization().ProducesValidationProblem();

        group.MapGet("/", async Task<ApiResult<ApplicationSummaryResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetApplicationsQuery())
        ).Produces<ApplicationSummaryResponse[]>();

        group.MapGet("/{id}", async Task<ApiResult<ApplicationResponse>> (FundraisingApplicationId id, IMediator mediator)
            => await mediator.Send(new GetApplicationQuery(id))
        ).Produces<ApplicationResponse>();

        group.MapPost("/", async Task<ApiResult<FundraisingApplicationId>> (CreateApplicationCommand command, IMediator mediator)
            => await mediator.Send(command)
        ).Produces<FundraisingApplicationId>();

        group.MapPut("/{id}/fields", async Task<ApiResult> (FundraisingApplicationId id, SetApplicationFieldDataCommand command, IMediator mediator)
            => await mediator.Send(command with { Id = id })
        );

        group.MapPost("/{id}/submit", async Task<ApiResult> (FundraisingApplicationId id, IMediator mediator)
            => await mediator.Send(new SubmitApplicationCommand(id))
        );

        group.MapPost("/{id}/review", async Task<ApiResult> (FundraisingApplicationId id, AddApplicationReviewCommand command, IMediator mediator)
            => await mediator.Send(command with { Id = id })
        );
    }
}
