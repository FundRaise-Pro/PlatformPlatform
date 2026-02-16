using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;

namespace PlatformPlatform.Fundraiser.Integrations.PaymentGateway;

public sealed class PayFastGateway(
    HttpClient httpClient,
    ITenantSettingsRepository tenantSettingsRepository,
    IExecutionContext executionContext,
    ILogger<PayFastGateway> logger
) : IPaymentGateway
{
    private const string PayFastProcessUrl = "https://www.payfast.co.za/eng/process";
    private const string PayFastSandboxProcessUrl = "https://sandbox.payfast.co.za/eng/process";
    private const string PayFastValidateUrl = "https://www.payfast.co.za/eng/query/validate";
    private const string PayFastSandboxValidateUrl = "https://sandbox.payfast.co.za/eng/query/validate";

    public PaymentProvider Provider => PaymentProvider.PayFast;

    public async Task<PaymentInitiationResult?> InitiatePaymentAsync(PaymentRequest request, CancellationToken cancellationToken)
    {
        var config = await GetPaymentConfigAsync(cancellationToken);
        if (config is null) return null;

        var fields = new Dictionary<string, string>
        {
            ["merchant_id"] = config.MerchantId!,
            ["merchant_key"] = config.ApiKey!,
            ["notify_url"] = request.NotifyUrl,
            ["return_url"] = request.ReturnUrl,
            ["cancel_url"] = request.CancelUrl,
            ["m_payment_id"] = request.MerchantReference,
            ["amount"] = request.Amount.ToString("F2", System.Globalization.CultureInfo.InvariantCulture),
            ["item_name"] = request.ItemName
        };

        if (!string.IsNullOrEmpty(request.ItemDescription))
            fields["item_description"] = request.ItemDescription;
        if (!string.IsNullOrEmpty(request.PayeeName))
        {
            var parts = request.PayeeName.Split(' ', 2);
            fields["name_first"] = parts[0];
            if (parts.Length > 1) fields["name_last"] = parts[1];
        }
        if (!string.IsNullOrEmpty(request.PayeeEmail))
            fields["email_address"] = request.PayeeEmail;

        var passphrase = config.ApiSecret ?? "";
        var signature = PayFastValidation.ComputeSignatureForOutbound(fields, passphrase);
        fields["signature"] = signature;

        var processUrl = config.IsTestMode ? PayFastSandboxProcessUrl : PayFastProcessUrl;

        logger.LogInformation("PayFast payment initiated for merchant reference {MerchantReference}", request.MerchantReference);

        return new PaymentInitiationResult(request.MerchantReference, processUrl, fields);
    }

    public async Task<PaymentVerificationResult?> VerifyPaymentAsync(string gatewayPaymentId, CancellationToken cancellationToken)
    {
        var config = await GetPaymentConfigAsync(cancellationToken);
        var validateUrl = config?.IsTestMode == true ? PayFastSandboxValidateUrl : PayFastValidateUrl;

        var content = new FormUrlEncodedContent([new KeyValuePair<string, string>("pf_payment_id", gatewayPaymentId)]);
        var response = await httpClient.PostAsync(validateUrl, content, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogError("PayFast verification failed for {GatewayPaymentId}. Status: {StatusCode}", gatewayPaymentId, response.StatusCode);
            return null;
        }

        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        var isValid = body.Trim().Equals("VALID", StringComparison.OrdinalIgnoreCase);
        return new PaymentVerificationResult(gatewayPaymentId, isValid, null, null, null, null);
    }

    public Task<SubscriptionResult?> CreateSubscriptionAsync(SubscriptionRequest request, CancellationToken cancellationToken)
    {
        // TODO: Phase 2 — implement PayFast recurring subscription
        logger.LogWarning("PayFast subscription creation not yet implemented");
        return Task.FromResult<SubscriptionResult?>(null);
    }

    public async Task<bool> CancelSubscriptionAsync(string gatewayToken, CancellationToken cancellationToken)
    {
        var response = await httpClient.PutAsync(
            $"https://api.payfast.co.za/subscriptions/{gatewayToken}/cancel", null, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            logger.LogError("Failed to cancel PayFast subscription {GatewayToken}. Status: {StatusCode}", gatewayToken, response.StatusCode);
            return false;
        }
        return true;
    }

    public Task<RefundResult?> ProcessRefundAsync(string gatewayPaymentId, decimal amount, CancellationToken cancellationToken)
    {
        logger.LogWarning("PayFast does not support programmatic refunds. Payment {GatewayPaymentId} requires manual refund", gatewayPaymentId);
        return Task.FromResult<RefundResult?>(null);
    }

    private async Task<PaymentConfig?> GetPaymentConfigAsync(CancellationToken cancellationToken)
    {
        var tenantId = executionContext.TenantId;
        if (tenantId is null) return null;
        var settings = await tenantSettingsRepository.GetByTenantIdAsync(tenantId, cancellationToken);
        if (settings?.Payment.MerchantId is null || settings.Payment.ApiKey is null)
        {
            logger.LogError("PayFast credentials not configured for tenant {TenantId}", tenantId);
            return null;
        }
        return settings.Payment;
    }
}
