using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.Fundraiser.Integrations.PaymentGateway;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;

namespace PlatformPlatform.Fundraiser.Features.Donations.Commands;

[PublicAPI]
public sealed record InitiatePaymentCommand : ICommand, IRequest<Result<InitiatePaymentResponse>>
{
    public required TransactionId TransactionId { get; init; }

    public required string ReturnUrl { get; init; }

    public required string CancelUrl { get; init; }
}

[PublicAPI]
public sealed record InitiatePaymentResponse(
    string ActionUrl,
    Dictionary<string, string> FormFields
);

public sealed class InitiatePaymentValidator : AbstractValidator<InitiatePaymentCommand>
{
    public InitiatePaymentValidator()
    {
        RuleFor(x => x.ReturnUrl).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.CancelUrl).NotEmpty().MaximumLength(2000);
    }
}

public sealed class InitiatePaymentHandler(
    ITransactionRepository transactionRepository,
    PaymentGatewayFactory paymentGatewayFactory,
    IExecutionContext executionContext
) : IRequestHandler<InitiatePaymentCommand, Result<InitiatePaymentResponse>>
{
    public async Task<Result<InitiatePaymentResponse>> Handle(InitiatePaymentCommand command, CancellationToken cancellationToken)
    {
        var transaction = await transactionRepository.GetByIdAsync(command.TransactionId, cancellationToken);
        if (transaction is null)
            return Result<InitiatePaymentResponse>.NotFound($"Transaction with id '{command.TransactionId}' not found.");

        if (transaction.Status != TransactionStatus.Pending)
            return Result<InitiatePaymentResponse>.BadRequest($"Transaction is not in Pending status (current: {transaction.Status}).");

        var tenantId = executionContext.TenantId!;
        var gateway = await paymentGatewayFactory.GetGatewayAsync(tenantId, cancellationToken);

        var notifyUrl = $"/api/fundraiser/donations/transactions/payfast-itn";

        var request = new PaymentRequest(
            transaction.Amount,
            "ZAR",
            transaction.Name,
            transaction.Description,
            transaction.MerchantReference!,
            command.ReturnUrl,
            command.CancelUrl,
            notifyUrl,
            transaction.PayeeName,
            transaction.PayeeEmail
        );

        var result = await gateway.InitiatePaymentAsync(request, cancellationToken);
        if (result is null)
            return Result<InitiatePaymentResponse>.BadRequest("Payment gateway is not configured. Please configure payment settings first.");

        transaction.MarkProcessing();
        transactionRepository.Update(transaction);

        return new InitiatePaymentResponse(
            result.RedirectUrl,
            new Dictionary<string, string>(result.FormFields ?? new Dictionary<string, string>())
        );
    }
}
