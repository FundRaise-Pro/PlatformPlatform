using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Donations.Queries;

[PublicAPI]
public sealed record GetTargetRaisedAmountQuery(FundraisingTargetType TargetType, string TargetId) : IRequest<Result<TargetRaisedAmountResponse>>;

[PublicAPI]
public sealed record TargetRaisedAmountResponse(FundraisingTargetType TargetType, string TargetId, decimal RaisedAmount);

public sealed class GetTargetRaisedAmountHandler(ITransactionRepository transactionRepository)
    : IRequestHandler<GetTargetRaisedAmountQuery, Result<TargetRaisedAmountResponse>>
{
    public async Task<Result<TargetRaisedAmountResponse>> Handle(GetTargetRaisedAmountQuery query, CancellationToken cancellationToken)
    {
        // Raised amount = SUM(AmountNet ?? Amount) for all successful transactions against this target.
        // AmountNet is used when available (post-fee), falling back to gross Amount.
        // Refunds: TODO — subtract refunded amounts when refund flow is implemented.
        var raised = await transactionRepository.GetRaisedAmountAsync(query.TargetType, query.TargetId, cancellationToken);
        return new TargetRaisedAmountResponse(query.TargetType, query.TargetId, raised);
    }
}
