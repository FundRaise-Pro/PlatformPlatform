using System.Text.Json;
using JetBrains.Annotations;
using PlatformPlatform.AccountManagement.Features.Subscriptions.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.AccountManagement.Features.Subscriptions.Commands;

[PublicAPI]
public sealed record ProcessStripeWebhookCommand(string Payload, string Signature) : ICommand, IRequest<Result>;

public sealed class ProcessStripeWebhookHandler(
    ISubscriptionRepository subscriptionRepository,
    ITelemetryEventsCollector events,
    ILogger<ProcessStripeWebhookHandler> logger
) : IRequestHandler<ProcessStripeWebhookCommand, Result>
{
    public async Task<Result> Handle(ProcessStripeWebhookCommand command, CancellationToken cancellationToken)
    {
        // In production, verify the webhook signature using the Stripe webhook secret
        // For now, we parse the event type and handle accordingly

        JsonElement json;
        try
        {
            json = JsonSerializer.Deserialize<JsonElement>(command.Payload);
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "Failed to parse Stripe webhook payload");
            return Result.BadRequest("Invalid webhook payload.");
        }

        var eventType = json.GetProperty("type").GetString();
        logger.LogInformation("Processing Stripe webhook event: {EventType}", eventType);

        return eventType switch
        {
            "invoice.paid" => await HandleInvoicePaidAsync(json, cancellationToken),
            "invoice.payment_failed" => await HandleInvoicePaymentFailedAsync(json, cancellationToken),
            "customer.subscription.updated" => await HandleSubscriptionUpdatedAsync(json, cancellationToken),
            "customer.subscription.deleted" => await HandleSubscriptionDeletedAsync(json, cancellationToken),
            "checkout.session.completed" => await HandleCheckoutSessionCompletedAsync(json, cancellationToken),
            _ => HandleUnknownEvent(eventType)
        };
    }

    private async Task<Result> HandleInvoicePaidAsync(JsonElement json, CancellationToken cancellationToken)
    {
        var customerId = json.GetProperty("data").GetProperty("object").GetProperty("customer").GetString();
        if (customerId is null) return Result.BadRequest("Missing customer ID in invoice.paid event.");

        var subscription = await subscriptionRepository.GetByStripeCustomerIdAsync(customerId, cancellationToken);
        if (subscription is null)
        {
            logger.LogWarning("No subscription found for Stripe customer {CustomerId}", customerId);
            return Result.Success(); // Acknowledge to avoid retries
        }

        if (subscription.Status == SubscriptionStatus.PastDue)
        {
            subscription.Reactivate(subscription.Plan);
            subscriptionRepository.Update(subscription);
        }

        events.CollectEvent(new StripeWebhookProcessed("invoice.paid", subscription.TenantId));
        return Result.Success();
    }

    private async Task<Result> HandleInvoicePaymentFailedAsync(JsonElement json, CancellationToken cancellationToken)
    {
        var customerId = json.GetProperty("data").GetProperty("object").GetProperty("customer").GetString();
        if (customerId is null) return Result.BadRequest("Missing customer ID in invoice.payment_failed event.");

        var subscription = await subscriptionRepository.GetByStripeCustomerIdAsync(customerId, cancellationToken);
        if (subscription is null)
        {
            logger.LogWarning("No subscription found for Stripe customer {CustomerId}", customerId);
            return Result.Success();
        }

        subscription.MarkPastDue();
        subscriptionRepository.Update(subscription);

        events.CollectEvent(new SubscriptionPaymentFailed(subscription.TenantId, subscription.Plan));
        events.CollectEvent(new StripeWebhookProcessed("invoice.payment_failed", subscription.TenantId));
        return Result.Success();
    }

    private async Task<Result> HandleSubscriptionUpdatedAsync(JsonElement json, CancellationToken cancellationToken)
    {
        var stripeSubscriptionId = json.GetProperty("data").GetProperty("object").GetProperty("id").GetString();
        if (stripeSubscriptionId is null) return Result.BadRequest("Missing subscription ID.");

        var subscription = await subscriptionRepository.GetByStripeSubscriptionIdAsync(stripeSubscriptionId, cancellationToken);
        if (subscription is null)
        {
            logger.LogWarning("No subscription found for Stripe subscription {StripeSubscriptionId}", stripeSubscriptionId);
            return Result.Success();
        }

        var dataObject = json.GetProperty("data").GetProperty("object");
        var periodStart = DateTimeOffset.FromUnixTimeSeconds(dataObject.GetProperty("current_period_start").GetInt64());
        var periodEnd = DateTimeOffset.FromUnixTimeSeconds(dataObject.GetProperty("current_period_end").GetInt64());
        subscription.UpdatePeriod(periodStart, periodEnd);

        var status = dataObject.GetProperty("status").GetString();
        if (status == "past_due")
        {
            subscription.MarkPastDue();
        }
        else if (status == "active" && subscription.Status != SubscriptionStatus.Active)
        {
            subscription.Reactivate(subscription.Plan);
        }

        subscriptionRepository.Update(subscription);

        events.CollectEvent(new StripeWebhookProcessed("customer.subscription.updated", subscription.TenantId));
        return Result.Success();
    }

    private async Task<Result> HandleSubscriptionDeletedAsync(JsonElement json, CancellationToken cancellationToken)
    {
        var stripeSubscriptionId = json.GetProperty("data").GetProperty("object").GetProperty("id").GetString();
        if (stripeSubscriptionId is null) return Result.BadRequest("Missing subscription ID.");

        var subscription = await subscriptionRepository.GetByStripeSubscriptionIdAsync(stripeSubscriptionId, cancellationToken);
        if (subscription is null)
        {
            logger.LogWarning("No subscription found for Stripe subscription {StripeSubscriptionId}", stripeSubscriptionId);
            return Result.Success();
        }

        subscription.Cancel();
        subscription.UpdatePlan(SubscriptionPlan.Free); // Downgrade to free on cancellation
        subscriptionRepository.Update(subscription);

        events.CollectEvent(new SubscriptionCancelled(subscription.TenantId, subscription.Plan));
        events.CollectEvent(new StripeWebhookProcessed("customer.subscription.deleted", subscription.TenantId));
        return Result.Success();
    }

    private Result HandleUnknownEvent(string? eventType)
    {
        logger.LogInformation("Ignoring unhandled Stripe webhook event type: {EventType}", eventType);
        return Result.Success();
    }

    private async Task<Result> HandleCheckoutSessionCompletedAsync(JsonElement json, CancellationToken cancellationToken)
    {
        var dataObject = json.GetProperty("data").GetProperty("object");
        var customerId = dataObject.GetProperty("customer").GetString();
        var stripeSubscriptionId = dataObject.TryGetProperty("subscription", out var subProp) ? subProp.GetString() : null;

        if (customerId is null) return Result.BadRequest("Missing customer ID in checkout.session.completed event.");

        var subscription = await subscriptionRepository.GetByStripeCustomerIdAsync(customerId, cancellationToken);
        if (subscription is null)
        {
            logger.LogWarning("No subscription found for Stripe customer {CustomerId}", customerId);
            return Result.Success();
        }

        if (stripeSubscriptionId is not null)
        {
            subscription.ActivateStripe(customerId, stripeSubscriptionId, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddDays(30));
            subscriptionRepository.Update(subscription);
        }

        events.CollectEvent(new StripeWebhookProcessed("checkout.session.completed", subscription.TenantId));
        return Result.Success();
    }
}
