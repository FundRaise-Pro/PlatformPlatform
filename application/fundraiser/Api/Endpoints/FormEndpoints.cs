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

        // --- Form Templates (marketplace) ---

        group.MapGet("/templates", async Task<ApiResult<FormTemplateSummaryResponse[]>> (string? category, IMediator mediator)
            => await mediator.Send(new GetFormTemplatesQuery(category))
        ).Produces<FormTemplateSummaryResponse[]>();

        group.MapGet("/templates/{id}", async Task<ApiResult<FormTemplateDetailResponse>> (FormTemplateId id, IMediator mediator)
            => await mediator.Send(new GetFormTemplateQuery(id))
        ).Produces<FormTemplateDetailResponse>();

        group.MapPost("/templates", async Task<ApiResult<FormTemplateId>> (CreateFormTemplateCommand command, IMediator mediator)
            => await mediator.Send(command)
        ).Produces<FormTemplateId>();

        group.MapPost("/templates/{id}/publish", async Task<ApiResult> (FormTemplateId id, IMediator mediator)
            => await mediator.Send(new PublishFormTemplateCommand(id))
        );

        group.MapPost("/templates/{id}/clone", async Task<ApiResult<FormVersionId>> (FormTemplateId id, IMediator mediator)
            => await mediator.Send(new CloneFormTemplateCommand(id))
        ).Produces<FormVersionId>();
    }
}
