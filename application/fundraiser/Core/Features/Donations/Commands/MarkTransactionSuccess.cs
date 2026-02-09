using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Donations.Commands;

[PublicAPI]
public sealed record MarkTransactionSuccessCommand : ICommand, IRequest<Result>
{
    public required TransactionId Id { get; init; }

    public required string GatewayPaymentId { get; init; }

    public decimal? Fee { get; init; }

    public decimal? Net { get; init; }

    public PaymentMethod? PaymentMethod { get; init; }
}

public sealed class MarkTransactionSuccessValidator : AbstractValidator<MarkTransactionSuccessCommand>
{
    public MarkTransactionSuccessValidator()
    {
        RuleFor(x => x.GatewayPaymentId).NotEmpty().MaximumLength(200);
    }
}

public sealed class MarkTransactionSuccessHandler(
    ITransactionRepository transactionRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<MarkTransactionSuccessCommand, Result>
{
    public async Task<Result> Handle(MarkTransactionSuccessCommand command, CancellationToken cancellationToken)
    {
        var transaction = await transactionRepository.GetByIdAsync(command.Id, cancellationToken);
        if (transaction is null) return Result.NotFound($"Transaction with id '{command.Id}' not found.");

        transaction.MarkSuccess(command.GatewayPaymentId, command.Fee, command.Net, command.PaymentMethod);
        transactionRepository.Update(transaction);

        events.CollectEvent(new TransactionSucceeded(transaction.Id, transaction.Amount));
        return Result.Success();
    }
}
