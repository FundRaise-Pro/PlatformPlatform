using System.Net.Http.Json;
using System.Text.Json;
using PlatformPlatform.AccountManagement.Features.Subscriptions.Domain;
using PlatformPlatform.SharedKernel.Domain;

namespace PlatformPlatform.AccountManagement.Integrations.Stripe;

/// <summary>
///     Stripe integration client for managing customers, subscriptions, and checkout sessions.
///     Follows PP external-integrations pattern: never throw exceptions, return null/false on failure.
/// </summary>
public sealed class StripeClient(HttpClient httpClient, ILogger<StripeClient> logger)
{
    // Stripe API uses form-encoded POST bodies and Bearer token auth
    // The API key is set on the HttpClient at registration time

    /// <summary>Creates a Stripe Customer for the given tenant.</summary>
    public async Task<StripeCustomerResult?> CreateCustomerAsync(TenantId tenantId, string email, string? name, CancellationToken cancellationToken)
    {
        try
        {
            var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["email"] = email,
                ["name"] = name ?? string.Empty,
                ["metadata[tenant_id]"] = tenantId.ToString()
            });

            var response = await httpClient.PostAsync("v1/customers", content, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogError("Failed to create Stripe customer for tenant {TenantId}. Status: {StatusCode}", tenantId, response.StatusCode);
                return null;
            }

            var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken);
            var customerId = json.GetProperty("id").GetString()!;

            logger.LogInformation("Created Stripe customer {StripeCustomerId} for tenant {TenantId}", customerId, tenantId);
            return new StripeCustomerResult(customerId);
        }
        catch (TaskCanceledException ex)
        {
            logger.LogError(ex, "Timeout creating Stripe customer for tenant {TenantId}", tenantId);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create Stripe customer for tenant {TenantId}", tenantId);
            return null;
        }
    }

    /// <summary>Creates a Stripe Checkout Session for plan selection.</summary>
    public async Task<StripeCheckoutResult?> CreateCheckoutSessionAsync(
        string stripeCustomerId, SubscriptionPlan plan, string successUrl, string cancelUrl, CancellationToken cancellationToken)
    {
        try
        {
            var priceId = GetStripePriceId(plan);
            if (priceId is null)
            {
                logger.LogWarning("No Stripe price ID configured for plan {Plan}", plan);
                return null;
            }

            var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["customer"] = stripeCustomerId,
                ["mode"] = "subscription",
                ["line_items[0][price]"] = priceId,
                ["line_items[0][quantity]"] = "1",
                ["success_url"] = successUrl,
                ["cancel_url"] = cancelUrl
            });

            var response = await httpClient.PostAsync("v1/checkout/sessions", content, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogError("Failed to create Stripe checkout session for customer {CustomerId}. Status: {StatusCode}", stripeCustomerId, response.StatusCode);
                return null;
            }

            var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken);
            var sessionId = json.GetProperty("id").GetString()!;
            var url = json.GetProperty("url").GetString()!;

            logger.LogInformation("Created Stripe checkout session {SessionId} for customer {CustomerId}", sessionId, stripeCustomerId);
            return new StripeCheckoutResult(sessionId, url);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create Stripe checkout session for customer {CustomerId}", stripeCustomerId);
            return null;
        }
    }

    /// <summary>Cancels a Stripe subscription.</summary>
    public async Task<bool> CancelSubscriptionAsync(string stripeSubscriptionId, CancellationToken cancellationToken)
    {
        try
        {
            var response = await httpClient.DeleteAsync($"v1/subscriptions/{stripeSubscriptionId}", cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogError("Failed to cancel Stripe subscription {SubscriptionId}. Status: {StatusCode}", stripeSubscriptionId, response.StatusCode);
                return false;
            }

            logger.LogInformation("Cancelled Stripe subscription {SubscriptionId}", stripeSubscriptionId);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to cancel Stripe subscription {SubscriptionId}", stripeSubscriptionId);
            return false;
        }
    }

    /// <summary>Retrieves a Stripe subscription to get current status and period.</summary>
    public async Task<StripeSubscriptionInfo?> GetSubscriptionAsync(string stripeSubscriptionId, CancellationToken cancellationToken)
    {
        try
        {
            var response = await httpClient.GetAsync($"v1/subscriptions/{stripeSubscriptionId}", cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogError("Failed to retrieve Stripe subscription {SubscriptionId}. Status: {StatusCode}", stripeSubscriptionId, response.StatusCode);
                return null;
            }

            var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken);
            var status = json.GetProperty("status").GetString()!;
            var periodStart = DateTimeOffset.FromUnixTimeSeconds(json.GetProperty("current_period_start").GetInt64());
            var periodEnd = DateTimeOffset.FromUnixTimeSeconds(json.GetProperty("current_period_end").GetInt64());

            return new StripeSubscriptionInfo(stripeSubscriptionId, status, periodStart, periodEnd);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve Stripe subscription {SubscriptionId}", stripeSubscriptionId);
            return null;
        }
    }

    /// <summary>Maps subscription plans to Stripe Price IDs. These should come from configuration in production.</summary>
    private static string? GetStripePriceId(SubscriptionPlan plan) => plan switch
    {
        SubscriptionPlan.Starter => "price_starter_placeholder",
        SubscriptionPlan.Pro => "price_pro_placeholder",
        SubscriptionPlan.Enterprise => "price_enterprise_placeholder",
        _ => null // Free plan has no Stripe price
    };
}

public sealed record StripeCustomerResult(string CustomerId);

public sealed record StripeCheckoutResult(string SessionId, string Url);

public sealed record StripeSubscriptionInfo(string SubscriptionId, string Status, DateTimeOffset PeriodStart, DateTimeOffset PeriodEnd);
