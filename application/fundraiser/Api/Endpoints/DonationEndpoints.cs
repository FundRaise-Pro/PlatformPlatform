using PlatformPlatform.Fundraiser.Features.Donations.Commands;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.Fundraiser.Features.Donations.Queries;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class DonationEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/donations";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("Donations").RequireAuthorization().ProducesValidationProblem();

        group.MapGet("/", async Task<ApiResult<DonationSummaryResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetDonationsQuery())
        ).Produces<DonationSummaryResponse[]>();

        group.MapPost("/", async Task<ApiResult<DonationId>> (RecordDonationCommand command, IMediator mediator)
            => await mediator.Send(command)
        ).Produces<DonationId>();

        group.MapGet("/transactions", async Task<ApiResult<TransactionSummaryResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetTransactionsQuery())
        ).Produces<TransactionSummaryResponse[]>();

        group.MapGet("/transactions/{id}", async Task<ApiResult<TransactionResponse>> (TransactionId id, IMediator mediator)
            => await mediator.Send(new GetTransactionQuery(id))
        ).Produces<TransactionResponse>();

        group.MapGet("/raised-amount/{targetType}/{targetId}", async Task<ApiResult<TargetRaisedAmountResponse>> (
            FundraisingTargetType targetType, string targetId, IMediator mediator)
            => await mediator.Send(new GetTargetRaisedAmountQuery(targetType, targetId))
        ).Produces<TargetRaisedAmountResponse>();

        group.MapPost("/transactions", async Task<ApiResult<TransactionId>> (CreateTransactionCommand command, IMediator mediator)
            => await mediator.Send(command)
        ).Produces<TransactionId>();

        group.MapPost("/transactions/{id}/success", async Task<ApiResult> (TransactionId id, MarkTransactionSuccessCommand command, IMediator mediator)
            => await mediator.Send(command with { Id = id })
        );

        group.MapGet("/subscriptions", async Task<ApiResult<SubscriptionSummaryResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetSubscriptionsQuery())
        ).Produces<SubscriptionSummaryResponse[]>();

        group.MapPost("/subscriptions", async Task<ApiResult<SubscriptionId>> (CreateSubscriptionCommand command, IMediator mediator)
            => await mediator.Send(command)
        ).Produces<SubscriptionId>();

        group.MapDelete("/subscriptions/{id}", async Task<ApiResult> (SubscriptionId id, IMediator mediator)
            => await mediator.Send(new CancelSubscriptionCommand(id))
        );
    }
}
