using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.Fundraiser.Integrations.PaymentGateway;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Donations.Commands;

[PublicAPI]
public sealed record CreatePublicTransactionCommand : ICommand, IRequest<Result<CreatePublicTransactionResponse>>
{
    public required string Name { get; init; }

    public string? Description { get; init; }

    public required decimal Amount { get; init; }

    public required FundraisingTargetType TargetType { get; init; }

    public required string TargetId { get; init; }

    public string? PayeeName { get; init; }

    public string? PayeeEmail { get; init; }

    public DonationChannel Channel { get; init; } = DonationChannel.Web;

    public required string ReturnUrl { get; init; }

    public required string CancelUrl { get; init; }
}

[PublicAPI]
public sealed record CreatePublicTransactionResponse(
    string TransactionId,
    string ActionUrl,
    Dictionary<string, string> FormFields
);

public sealed class CreatePublicTransactionValidator : AbstractValidator<CreatePublicTransactionCommand>
{
    public CreatePublicTransactionValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.Amount).GreaterThanOrEqualTo(1).LessThanOrEqualTo(1_000_000);
        RuleFor(x => x.TargetId).NotEmpty().MaximumLength(26);
        RuleFor(x => x.TargetType).IsInEnum();
        RuleFor(x => x.PayeeName).MaximumLength(200);
        RuleFor(x => x.PayeeEmail).MaximumLength(200).EmailAddress().When(x => !string.IsNullOrEmpty(x.PayeeEmail));
        RuleFor(x => x.Channel).IsInEnum();
        RuleFor(x => x.ReturnUrl).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.CancelUrl).NotEmpty().MaximumLength(2000);
    }
}

public sealed class CreatePublicTransactionHandler(
    ITransactionRepository transactionRepository,
    ITransactionTargetResolver targetResolver,
    IMerchantReferenceGenerator merchantReferenceGenerator,
    PaymentGatewayFactory paymentGatewayFactory,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<CreatePublicTransactionCommand, Result<CreatePublicTransactionResponse>>
{
    public async Task<Result<CreatePublicTransactionResponse>> Handle(CreatePublicTransactionCommand command, CancellationToken cancellationToken)
    {
        var target = await targetResolver.ResolveAsync(command.TargetType, command.TargetId, cancellationToken);
        if (target is null)
            return Result<CreatePublicTransactionResponse>.NotFound($"{command.TargetType} with id '{command.TargetId}' not found.");

        var roundedAmount = PaymentHelpers.RoundAmount(command.Amount);
        var tenantId = executionContext.TenantId!;
        var transactionId = TransactionId.NewId();
        var merchantReference = merchantReferenceGenerator.Generate(tenantId.Value, transactionId);

        var transaction = Transaction.Create(
            transactionId, tenantId, command.Name, command.Description ?? target.Title,
            TransactionType.Donation, roundedAmount, command.TargetType, command.TargetId,
            merchantReference, command.PayeeName, command.PayeeEmail, channel: command.Channel
        );

        await transactionRepository.AddAsync(transaction, cancellationToken);
        events.CollectEvent(new TransactionCreated(transaction.Id, TransactionType.Donation, roundedAmount));

        var gateway = await paymentGatewayFactory.GetGatewayAsync(tenantId, cancellationToken);
        var notifyUrl = "/api/fundraiser/donations/transactions/payfast-itn";

        var paymentRequest = new PaymentRequest(
            roundedAmount, "ZAR", transaction.Name, transaction.Description, merchantReference,
            command.ReturnUrl, command.CancelUrl, notifyUrl, command.PayeeName, command.PayeeEmail
        );

        var paymentResult = await gateway.InitiatePaymentAsync(paymentRequest, cancellationToken);
        if (paymentResult is null)
            return Result<CreatePublicTransactionResponse>.BadRequest("Payment gateway is not configured. Please configure payment settings first.");

        transaction.MarkProcessing();
        transactionRepository.Update(transaction);

        return new CreatePublicTransactionResponse(
            transaction.Id, paymentResult.RedirectUrl,
            new Dictionary<string, string>(paymentResult.FormFields ?? new Dictionary<string, string>())
        );
    }
}
