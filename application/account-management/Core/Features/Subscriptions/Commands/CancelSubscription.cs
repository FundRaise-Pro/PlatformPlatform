using JetBrains.Annotations;
using PlatformPlatform.AccountManagement.Features.Subscriptions.Domain;
using PlatformPlatform.AccountManagement.Integrations.Stripe;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.AccountManagement.Features.Subscriptions.Commands;

[PublicAPI]
public sealed record CancelSubscriptionCommand : ICommand, IRequest<Result>;

public sealed class CancelSubscriptionHandler(
    ISubscriptionRepository subscriptionRepository,
    StripeClient stripeClient,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<CancelSubscriptionCommand, Result>
{
    public async Task<Result> Handle(CancelSubscriptionCommand command, CancellationToken cancellationToken)
    {
        var tenantId = executionContext.TenantId;
        if (tenantId is null) return Result.Forbidden("No tenant context.");

        var subscription = await subscriptionRepository.GetByTenantIdAsync(tenantId, cancellationToken);

        if (subscription is null)
        {
            return Result.BadRequest("No subscription found for tenant.");
        }

        if (subscription.Status == SubscriptionStatus.Cancelled)
        {
            return Result.BadRequest("Subscription is already cancelled.");
        }

        if (subscription.StripeSubscriptionId is not null)
        {
            var cancelled = await stripeClient.CancelSubscriptionAsync(subscription.StripeSubscriptionId, cancellationToken);
            if (!cancelled)
            {
                return Result.BadRequest("Failed to cancel Stripe subscription.");
            }
        }

        subscription.Cancel();
        subscriptionRepository.Update(subscription);

        events.CollectEvent(new SubscriptionCancelled(subscription.TenantId, subscription.Plan));

        return Result.Success();
    }
}
