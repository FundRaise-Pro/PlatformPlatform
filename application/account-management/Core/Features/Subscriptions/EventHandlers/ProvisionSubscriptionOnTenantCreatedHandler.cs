using PlatformPlatform.AccountManagement.Features.Subscriptions.Domain;
using PlatformPlatform.AccountManagement.Features.Tenants.Domain;
using PlatformPlatform.AccountManagement.Integrations.Stripe;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.AccountManagement.Features.Subscriptions.EventHandlers;

public sealed class ProvisionSubscriptionOnTenantCreatedHandler(
    ISubscriptionRepository subscriptionRepository,
    StripeClient stripeClient,
    ITelemetryEventsCollector events,
    ILogger<ProvisionSubscriptionOnTenantCreatedHandler> logger
) : INotificationHandler<TenantCreatedEvent>
{
    public async Task Handle(TenantCreatedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Provisioning subscription for tenant {TenantId}", notification.TenantId);

        // Create a free subscription for the new tenant
        var subscription = Subscription.Create(notification.TenantId);
        await subscriptionRepository.AddAsync(subscription, cancellationToken);

        // Attempt to create a Stripe customer (non-blocking — webhook or admin can retry)
        var stripeResult = await stripeClient.CreateCustomerAsync(
            notification.TenantId, notification.Email, name: null, cancellationToken
        );

        if (stripeResult is not null)
        {
            subscription.ActivateStripe(stripeResult.CustomerId, stripeSubscriptionId: null!, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddDays(30));
            subscriptionRepository.Update(subscription);
            logger.LogInformation("Stripe customer {CustomerId} created for tenant {TenantId}", stripeResult.CustomerId, notification.TenantId);
        }
        else
        {
            logger.LogWarning("Failed to create Stripe customer for tenant {TenantId}. Subscription created without Stripe.", notification.TenantId);
        }

        events.CollectEvent(new SubscriptionCreated(notification.TenantId, SubscriptionPlan.Free));
    }
}
