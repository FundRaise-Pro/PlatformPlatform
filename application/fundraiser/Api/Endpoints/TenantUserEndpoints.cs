using PlatformPlatform.Fundraiser.Features.Users.Commands;
using PlatformPlatform.Fundraiser.Features.Users.Domain;
using PlatformPlatform.Fundraiser.Features.Users.Queries;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class TenantUserEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/tenant-users";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("Tenant Users").RequireAuthorization().ProducesValidationProblem();

        group.MapGet("/", async Task<ApiResult<TenantUserResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetTenantUsersQuery())
        ).Produces<TenantUserResponse[]>();

        group.MapGet("/{id}", async Task<ApiResult<TenantUserDetailResponse>> (TenantUserId id, IMediator mediator)
            => await mediator.Send(new GetTenantUserQuery(id))
        ).Produces<TenantUserDetailResponse>();

        group.MapPost("/", async Task<ApiResult<TenantUserId>> (CreateTenantUserCommand command, IMediator mediator)
            => await mediator.Send(command)
        ).Produces<TenantUserId>();

        group.MapPost("/{id}/roles", async Task<ApiResult> (TenantUserId id, AssignFundraiserRoleCommand command, IMediator mediator)
            => await mediator.Send(command with { TenantUserId = id })
        );

        group.MapDelete("/{id}/roles", async Task<ApiResult> (TenantUserId id, RevokeFundraiserRoleCommand command, IMediator mediator)
            => await mediator.Send(command with { TenantUserId = id })
        );

        group.MapPut("/{id}/branch", async Task<ApiResult> (TenantUserId id, AssignTenantUserToBranchCommand command, IMediator mediator)
            => await mediator.Send(command with { Id = id })
        );
    }
}
