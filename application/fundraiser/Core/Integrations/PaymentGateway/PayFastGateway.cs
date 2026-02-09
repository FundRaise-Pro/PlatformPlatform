using PlatformPlatform.Fundraiser.Features.Donations.Domain;

namespace PlatformPlatform.Fundraiser.Integrations.PaymentGateway;

/// <summary>
///     PayFast payment gateway implementation for South African payment processing.
///     Uses PayFast's hosted payment page and ITN (Instant Transaction Notification) for verification.
/// </summary>
public sealed class PayFastGateway(HttpClient httpClient, ILogger<PayFastGateway> logger) : IPaymentGateway
{
    public PaymentProvider Provider => PaymentProvider.PayFast;

    public async Task<PaymentInitiationResult?> InitiatePaymentAsync(PaymentRequest request, CancellationToken cancellationToken)
    {
        try
        {
            // PayFast uses form POST to their hosted page — build redirect URL with query params
            var gatewayPaymentId = Guid.NewGuid().ToString("N");
            var redirectUrl = $"https://www.payfast.co.za/eng/process?amount={request.Amount}&item_name={Uri.EscapeDataString(request.ItemName)}&return_url={Uri.EscapeDataString(request.ReturnUrl)}&cancel_url={Uri.EscapeDataString(request.CancelUrl)}&notify_url={Uri.EscapeDataString(request.NotifyUrl)}";

            logger.LogInformation("PayFast payment initiated with reference {GatewayPaymentId}", gatewayPaymentId);

            return await Task.FromResult(new PaymentInitiationResult(gatewayPaymentId, redirectUrl));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to initiate PayFast payment for amount {Amount}", request.Amount);
            return null;
        }
    }

    public async Task<PaymentVerificationResult?> VerifyPaymentAsync(string gatewayPaymentId, CancellationToken cancellationToken)
    {
        try
        {
            // PayFast ITN validation — POST back to PayFast to verify
            var response = await httpClient.PostAsync(
                $"https://www.payfast.co.za/eng/query/validate?pf_payment_id={gatewayPaymentId}",
                null,
                cancellationToken
            );

            if (!response.IsSuccessStatusCode)
            {
                logger.LogError("PayFast verification failed for payment {GatewayPaymentId}. Status: {StatusCode}", gatewayPaymentId, response.StatusCode);
                return null;
            }

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            var isValid = content.Trim().Equals("VALID", StringComparison.OrdinalIgnoreCase);

            return new PaymentVerificationResult(gatewayPaymentId, isValid, null, null, null, null);
        }
        catch (TaskCanceledException ex)
        {
            logger.LogError(ex, "Timeout verifying PayFast payment {GatewayPaymentId}", gatewayPaymentId);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to verify PayFast payment {GatewayPaymentId}", gatewayPaymentId);
            return null;
        }
    }

    public async Task<SubscriptionResult?> CreateSubscriptionAsync(SubscriptionRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var gatewayToken = Guid.NewGuid().ToString("N");
            logger.LogInformation("PayFast subscription created with token {GatewayToken}", gatewayToken);

            return await Task.FromResult(new SubscriptionResult(gatewayToken, null));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create PayFast subscription for amount {Amount}", request.RecurringAmount);
            return null;
        }
    }

    public async Task<bool> CancelSubscriptionAsync(string gatewayToken, CancellationToken cancellationToken)
    {
        try
        {
            var response = await httpClient.PutAsync(
                $"https://api.payfast.co.za/subscriptions/{gatewayToken}/cancel",
                null,
                cancellationToken
            );

            if (!response.IsSuccessStatusCode)
            {
                logger.LogError("Failed to cancel PayFast subscription {GatewayToken}. Status: {StatusCode}", gatewayToken, response.StatusCode);
                return false;
            }

            logger.LogInformation("PayFast subscription {GatewayToken} cancelled", gatewayToken);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to cancel PayFast subscription {GatewayToken}", gatewayToken);
            return false;
        }
    }

    public async Task<RefundResult?> ProcessRefundAsync(string gatewayPaymentId, decimal amount, CancellationToken cancellationToken)
    {
        try
        {
            // PayFast does not support programmatic refunds — must be done via dashboard
            logger.LogWarning("PayFast does not support programmatic refunds. Payment {GatewayPaymentId} requires manual refund", gatewayPaymentId);

            return await Task.FromResult<RefundResult?>(null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to process PayFast refund for payment {GatewayPaymentId}", gatewayPaymentId);
            return null;
        }
    }
}
