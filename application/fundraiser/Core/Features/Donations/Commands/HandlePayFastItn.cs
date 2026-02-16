using Microsoft.Extensions.Logging;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;
using PlatformPlatform.Fundraiser.Integrations.PaymentGateway;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.Donations.Commands;

public sealed record PayFastItnResult(bool Success, string? Error = null)
{
    public static PayFastItnResult Ok() => new(true);
    public static PayFastItnResult Fail(string error) => new(false, error);
}

public interface IPayFastItnHandler
{
    Task<PayFastItnResult> HandleAsync(
        string? clientIp,
        IEnumerable<KeyValuePair<string, string>> formFields,
        CancellationToken cancellationToken);
}

internal sealed class PayFastItnHandler(
    ITransactionRepository transactionRepository,
    ITenantSettingsRepository tenantSettingsRepository,
    IMerchantReferenceGenerator merchantReferenceGenerator,
    IUnitOfWork unitOfWork,
    ILogger<PayFastItnHandler> logger
) : IPayFastItnHandler
{
    public async Task<PayFastItnResult> HandleAsync(
        string? clientIp,
        IEnumerable<KeyValuePair<string, string>> formFields,
        CancellationToken cancellationToken)
    {
        var fields = formFields.ToList();
        var fieldDict = fields.ToDictionary(f => f.Key, f => f.Value, StringComparer.OrdinalIgnoreCase);

        if (!PayFastValidation.IsIpWhitelisted(clientIp))
        {
            logger.LogWarning("PayFast ITN from non-whitelisted IP: {ClientIp}", clientIp);
            return PayFastItnResult.Fail("Invalid source IP");
        }

        if (!fieldDict.TryGetValue("m_payment_id", out var merchantReference) || string.IsNullOrEmpty(merchantReference))
        {
            logger.LogWarning("PayFast ITN missing m_payment_id");
            return PayFastItnResult.Fail("Missing merchant reference");
        }

        var parseResult = merchantReferenceGenerator.Parse(merchantReference);
        if (!parseResult.IsValid)
        {
            logger.LogWarning("PayFast ITN invalid merchant reference: {MerchantReference}", merchantReference);
            return PayFastItnResult.Fail("Invalid merchant reference signature");
        }

        var tenantId = new TenantId(parseResult.TenantId);
        var settings = await tenantSettingsRepository.GetByTenantIdUnfilteredAsync(tenantId, cancellationToken);
        if (settings?.Payment.ApiSecret is null)
        {
            logger.LogWarning("PayFast ITN: no passphrase configured for tenant {TenantId}", tenantId);
            return PayFastItnResult.Fail("Tenant payment config missing");
        }

        if (!fieldDict.TryGetValue("signature", out var receivedSignature) || string.IsNullOrEmpty(receivedSignature))
        {
            logger.LogWarning("PayFast ITN missing signature for {MerchantReference}", merchantReference);
            return PayFastItnResult.Fail("Missing signature");
        }

        if (!PayFastValidation.VerifyItnSignature(fields, settings.Payment.ApiSecret, receivedSignature))
        {
            logger.LogWarning("PayFast ITN signature mismatch for {MerchantReference}", merchantReference);
            return PayFastItnResult.Fail("Signature mismatch");
        }

        var transaction = await transactionRepository.GetByMerchantReferenceUnfilteredAsync(merchantReference, cancellationToken);
        if (transaction is null)
        {
            logger.LogWarning("PayFast ITN: transaction not found for {MerchantReference}", merchantReference);
            return PayFastItnResult.Fail("Transaction not found");
        }

        fieldDict.TryGetValue("payment_status", out var paymentStatus);
        fieldDict.TryGetValue("pf_payment_id", out var pfPaymentId);
        fieldDict.TryGetValue("amount_fee", out var amountFeeStr);
        fieldDict.TryGetValue("amount_net", out var amountNetStr);
        fieldDict.TryGetValue("payment_method", out var paymentMethodCode);

        var status = (paymentStatus?.ToUpperInvariant()) switch
        {
            "COMPLETE" => TransactionStatus.Success,
            "FAILED" => TransactionStatus.Failed,
            "CANCELLED" => TransactionStatus.Cancelled,
            "PENDING" => TransactionStatus.Processing,
            _ => TransactionStatus.ManualReview
        };

        if (status == TransactionStatus.Success)
        {
            if (transaction.Status == TransactionStatus.Success)
            {
                logger.LogInformation("Duplicate ITN for already-successful transaction {TransactionId}", transaction.Id);
                return PayFastItnResult.Ok();
            }

            if (transaction.Status is TransactionStatus.Failed or TransactionStatus.Refunded or TransactionStatus.Cancelled)
            {
                logger.LogWarning("ITN success for finalized transaction {TransactionId} (status: {Status})", transaction.Id, transaction.Status);
                return PayFastItnResult.Fail($"Transaction already finalized: {transaction.Status}");
            }

            decimal? fee = decimal.TryParse(amountFeeStr, out var f) ? PaymentHelpers.RoundAmount(f) : null;
            decimal? net = decimal.TryParse(amountNetStr, out var n) ? PaymentHelpers.RoundAmount(n) : null;
            var method = PayFastValidation.ParsePaymentMethodCode(paymentMethodCode);

            transaction.MarkSuccess(pfPaymentId ?? "", fee, net, method);
            transactionRepository.Update(transaction);

            logger.LogInformation(
                "PayFast ITN: transaction {TransactionId} marked success. Amount: {Amount}, Net: {Net}",
                transaction.Id, transaction.Amount, net);
        }
        else if (status == TransactionStatus.Failed)
        {
            transaction.MarkFailed();
            transactionRepository.Update(transaction);
            logger.LogInformation("PayFast ITN: transaction {TransactionId} marked failed", transaction.Id);
        }
        else if (status == TransactionStatus.Cancelled)
        {
            transaction.MarkCancelled();
            transactionRepository.Update(transaction);
            logger.LogInformation("PayFast ITN: transaction {TransactionId} marked cancelled", transaction.Id);
        }
        else if (status == TransactionStatus.Processing)
        {
            transaction.MarkProcessing();
            transactionRepository.Update(transaction);
        }

        await unitOfWork.CommitAsync(cancellationToken);
        return PayFastItnResult.Ok();
    }
}
