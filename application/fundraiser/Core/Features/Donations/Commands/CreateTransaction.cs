using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Donations.Commands;

[PublicAPI]
public sealed record CreateTransactionCommand : ICommand, IRequest<Result<TransactionId>>
{
    public required string Name { get; init; }

    public required string Description { get; init; }

    public required TransactionType Type { get; init; }

    public required decimal Amount { get; init; }

    public required FundraisingTargetType TargetType { get; init; }

    public required string TargetId { get; init; }

    public string? PayeeName { get; init; }

    public string? PayeeEmail { get; init; }
}

public sealed class CreateTransactionValidator : AbstractValidator<CreateTransactionCommand>
{
    public CreateTransactionValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.TargetId).NotEmpty().MaximumLength(26);
        RuleFor(x => x.TargetType).IsInEnum();
        RuleFor(x => x.PayeeName).MaximumLength(200);
        RuleFor(x => x.PayeeEmail).MaximumLength(200).EmailAddress().When(x => !string.IsNullOrEmpty(x.PayeeEmail));

        // Amount limits: min R1, max R1,000,000 for donations; min R50 for subscriptions
        RuleFor(x => x.Amount)
            .GreaterThanOrEqualTo(1)
            .LessThanOrEqualTo(1_000_000)
            .When(x => x.Type == TransactionType.Donation);
        RuleFor(x => x.Amount)
            .GreaterThanOrEqualTo(50)
            .When(x => x.Type == TransactionType.Subscription);
    }
}

public sealed class CreateTransactionHandler(
    ITransactionRepository transactionRepository,
    ITransactionTargetResolver targetResolver,
    IMerchantReferenceGenerator merchantReferenceGenerator,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<CreateTransactionCommand, Result<TransactionId>>
{
    public async Task<Result<TransactionId>> Handle(CreateTransactionCommand command, CancellationToken cancellationToken)
    {
        var target = await targetResolver.ResolveAsync(command.TargetType, command.TargetId, cancellationToken);
        if (target is null)
            return Result<TransactionId>.NotFound($"{command.TargetType} with id '{command.TargetId}' not found.");

        var roundedAmount = PaymentHelpers.RoundAmount(command.Amount);
        var tenantId = executionContext.TenantId!;

        // Generate merchant reference before creating transaction (need the ID first)
        var transactionId = TransactionId.NewId();
        var merchantReference = merchantReferenceGenerator.Generate(tenantId.Value, transactionId);

        var transaction = Transaction.Create(
            transactionId, tenantId, command.Name, command.Description,
            command.Type, roundedAmount, command.TargetType, command.TargetId,
            merchantReference, command.PayeeName, command.PayeeEmail
        );

        await transactionRepository.AddAsync(transaction, cancellationToken);

        events.CollectEvent(new TransactionCreated(transaction.Id, command.Type, roundedAmount));
        return transaction.Id;
    }
}
