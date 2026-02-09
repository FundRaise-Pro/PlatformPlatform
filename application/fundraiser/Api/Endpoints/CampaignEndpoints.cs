using PlatformPlatform.Fundraiser.Features.Campaigns.Commands;
using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.Fundraiser.Features.Campaigns.Queries;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class CampaignEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/campaigns";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("Campaigns").RequireAuthorization().ProducesValidationProblem();

        group.MapGet("/", async Task<ApiResult<CampaignSummaryResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetCampaignsQuery())
        ).Produces<CampaignSummaryResponse[]>();

        group.MapGet("/{id}", async Task<ApiResult<CampaignResponse>> (CampaignId id, IMediator mediator)
            => await mediator.Send(new GetCampaignQuery(id))
        ).Produces<CampaignResponse>();

        group.MapPost("/", async Task<ApiResult<CampaignId>> (CreateCampaignCommand command, IMediator mediator)
            => await mediator.Send(command)
        ).Produces<CampaignId>();

        group.MapPut("/{id}", async Task<ApiResult> (CampaignId id, UpdateCampaignCommand command, IMediator mediator)
            => await mediator.Send(command with { Id = id })
        );

        group.MapPost("/{id}/publish", async Task<ApiResult> (CampaignId id, IMediator mediator)
            => await mediator.Send(new PublishCampaignCommand(id))
        );

        group.MapDelete("/{id}", async Task<ApiResult> (CampaignId id, IMediator mediator)
            => await mediator.Send(new DeleteCampaignCommand(id))
        );
    }
}
