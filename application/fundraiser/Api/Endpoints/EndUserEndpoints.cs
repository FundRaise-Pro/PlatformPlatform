using PlatformPlatform.Fundraiser.Features.EndUsers.Commands;
using PlatformPlatform.Fundraiser.Features.EndUsers.Domain;
using PlatformPlatform.Fundraiser.Features.EndUsers.Queries;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class EndUserEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/end-users";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("End Users").RequireAuthorization().ProducesValidationProblem();

        group.MapGet("/", async Task<ApiResult<EndUserSummaryResponse[]>> (EndUserType? type, IMediator mediator)
            => await mediator.Send(new GetEndUsersQuery(type))
        ).Produces<EndUserSummaryResponse[]>();

        group.MapGet("/{id}", async Task<ApiResult<EndUserDetailResponse>> (EndUserId id, IMediator mediator)
            => await mediator.Send(new GetEndUserQuery(id))
        ).Produces<EndUserDetailResponse>();

        group.MapPost("/", async Task<ApiResult<EndUserId>> (RegisterEndUserCommand command, IMediator mediator)
            => await mediator.Send(command)
        ).Produces<EndUserId>().AllowAnonymous();

        group.MapPut("/{id}", async Task<ApiResult> (EndUserId id, UpdateEndUserCommand command, IMediator mediator)
            => await mediator.Send(command with { Id = id })
        );

        group.MapPost("/{id}/verify/start", async Task<ApiResult<string>> (EndUserId id, IMediator mediator)
            => await mediator.Send(new StartEndUserVerificationCommand(id))
        ).Produces<string>();

        group.MapPost("/{id}/verify", async Task<ApiResult> (EndUserId id, VerifyEndUserCommand command, IMediator mediator)
            => await mediator.Send(command with { EndUserId = id })
        ).AllowAnonymous();
    }
}
