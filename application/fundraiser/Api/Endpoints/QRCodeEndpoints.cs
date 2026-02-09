using PlatformPlatform.Fundraiser.Features.QRCodes.Commands;
using PlatformPlatform.Fundraiser.Features.QRCodes.Domain;
using PlatformPlatform.Fundraiser.Features.QRCodes.Queries;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class QRCodeEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/qrcodes";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("QR Codes").RequireAuthorization().ProducesValidationProblem();

        group.MapGet("/", async Task<ApiResult<QRCodeSummaryResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetQRCodesQuery())
        ).Produces<QRCodeSummaryResponse[]>();

        group.MapGet("/{id}", async Task<ApiResult<QRCodeResponse>> (QRCodeId id, IMediator mediator)
            => await mediator.Send(new GetQRCodeQuery(id))
        ).Produces<QRCodeResponse>();

        group.MapPost("/", async Task<ApiResult<QRCodeId>> (CreateQRCodeCommand command, IMediator mediator)
            => await mediator.Send(command)
        ).Produces<QRCodeId>();

        group.MapPost("/{id}/hit", async Task<ApiResult> (QRCodeId id, RecordQRCodeHitCommand command, IMediator mediator)
            => await mediator.Send(command with { Id = id })
        ).AllowAnonymous();

        group.MapPost("/{id}/deactivate", async Task<ApiResult> (QRCodeId id, IMediator mediator)
            => await mediator.Send(new DeactivateQRCodeCommand(id))
        );
    }
}
