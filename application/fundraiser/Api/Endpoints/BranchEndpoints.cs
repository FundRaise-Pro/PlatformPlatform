using PlatformPlatform.Fundraiser.Features.Branches.Commands;
using PlatformPlatform.Fundraiser.Features.Branches.Domain;
using PlatformPlatform.Fundraiser.Features.Branches.Queries;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class BranchEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/branches";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("Branches").RequireAuthorization().ProducesValidationProblem();

        group.MapGet("/", async Task<ApiResult<BranchSummaryResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetBranchesQuery())
        ).Produces<BranchSummaryResponse[]>();

        group.MapGet("/{id}", async Task<ApiResult<BranchResponse>> (BranchId id, IMediator mediator)
            => await mediator.Send(new GetBranchQuery(id))
        ).Produces<BranchResponse>();

        group.MapPost("/", async Task<ApiResult<BranchId>> (CreateBranchCommand command, IMediator mediator)
            => await mediator.Send(command)
        ).Produces<BranchId>();

        group.MapPut("/{id}", async Task<ApiResult> (BranchId id, UpdateBranchCommand command, IMediator mediator)
            => await mediator.Send(command with { Id = id })
        );

        group.MapPut("/{id}/geolocation", async Task<ApiResult> (BranchId id, SetGeolocationCommand command, IMediator mediator)
            => await mediator.Send(command with { Id = id })
        );
    }
}
