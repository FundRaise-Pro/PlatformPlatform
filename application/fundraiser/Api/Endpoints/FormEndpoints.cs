using PlatformPlatform.Fundraiser.Features.Forms.Commands;
using PlatformPlatform.Fundraiser.Features.Forms.Domain;
using PlatformPlatform.Fundraiser.Features.Forms.Queries;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class FormEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/forms";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("Forms").RequireAuthorization().ProducesValidationProblem();

        group.MapGet("/versions", async Task<ApiResult<FormVersionSummaryResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetFormVersionsQuery())
        ).Produces<FormVersionSummaryResponse[]>();

        group.MapGet("/versions/{id}", async Task<ApiResult<FormVersionResponse>> (FormVersionId id, IMediator mediator)
            => await mediator.Send(new GetFormVersionQuery(id))
        ).Produces<FormVersionResponse>();

        group.MapPost("/versions", async Task<ApiResult<FormVersionId>> (CreateFormVersionCommand command, IMediator mediator)
            => await mediator.Send(command)
        ).Produces<FormVersionId>();

        group.MapPost("/versions/{id}/activate", async Task<ApiResult> (FormVersionId id, IMediator mediator)
            => await mediator.Send(new ActivateFormVersionCommand(id))
        );
    }
}
