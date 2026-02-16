using FluentValidation;
using Microsoft.Extensions.Logging;
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
    ITelemetryEventsCollector events,
    ILogger<MarkTransactionSuccessHandler> logger
) : IRequestHandler<MarkTransactionSuccessCommand, Result>
{
    public async Task<Result> Handle(MarkTransactionSuccessCommand command, CancellationToken cancellationToken)
    {
        var transaction = await transactionRepository.GetByIdAsync(command.Id, cancellationToken);
        if (transaction is null) return Result.NotFound($"Transaction with id '{command.Id}' not found.");

        // Idempotency: already successful = no-op
        if (transaction.Status == TransactionStatus.Success)
        {
            logger.LogInformation("Duplicate MarkTransactionSuccess for transaction {TransactionId} — no-op.", command.Id);
            return Result.Success();
        }

        // Cannot transition from terminal failure states
        if (transaction.Status is TransactionStatus.Failed or TransactionStatus.Refunded or TransactionStatus.Cancelled)
        {
            return Result.Conflict($"Transaction '{command.Id}' is already finalized with status {transaction.Status}.");
        }

        var roundedFee = command.Fee.HasValue ? PaymentHelpers.RoundAmount(command.Fee.Value) : (decimal?)null;
        var roundedNet = command.Net.HasValue ? PaymentHelpers.RoundAmount(command.Net.Value) : (decimal?)null;

        // MarkSuccess raises TransactionSucceededDomainEvent — handled pre-commit in same UnitOfWork
        transaction.MarkSuccess(command.GatewayPaymentId, roundedFee, roundedNet, command.PaymentMethod);
        transactionRepository.Update(transaction);

        events.CollectEvent(new TransactionSucceeded(transaction.Id, transaction.AmountNet ?? transaction.Amount));
        return Result.Success();
    }
}
