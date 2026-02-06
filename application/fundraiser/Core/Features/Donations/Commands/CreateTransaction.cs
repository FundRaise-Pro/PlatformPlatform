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
        RuleFor(x => x.PayeeName).MaximumLength(200);
        RuleFor(x => x.PayeeEmail).MaximumLength(200).EmailAddress().When(x => !string.IsNullOrEmpty(x.PayeeEmail));
    }
}

public sealed class CreateTransactionHandler(
    ITransactionRepository transactionRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<CreateTransactionCommand, Result<TransactionId>>
{
    public async Task<Result<TransactionId>> Handle(CreateTransactionCommand command, CancellationToken cancellationToken)
    {
        var transaction = Transaction.Create(
            executionContext.TenantId!, command.Name, command.Description,
            command.Type, command.Amount, command.PayeeName, command.PayeeEmail
        );

        await transactionRepository.AddAsync(transaction, cancellationToken);

        events.CollectEvent(new TransactionCreated(transaction.Id, command.Type, command.Amount));
        return transaction.Id;
    }
}
