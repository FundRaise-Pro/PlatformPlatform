using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Donations.Commands;

[PublicAPI]
public sealed record CancelSubscriptionCommand(SubscriptionId Id, CancellationSource Source = CancellationSource.Admin) : ICommand, IRequest<Result>;

public sealed class CancelSubscriptionHandler(
    IPaymentSubscriptionRepository subscriptionRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<CancelSubscriptionCommand, Result>
{
    public async Task<Result> Handle(CancelSubscriptionCommand command, CancellationToken cancellationToken)
    {
        var subscription = await subscriptionRepository.GetByIdAsync(command.Id, cancellationToken);
        if (subscription is null) return Result.NotFound($"Subscription with id '{command.Id}' not found.");

        if (subscription.Status != SubscriptionStatus.Active)
            return Result.BadRequest("Only active subscriptions can be cancelled.");

        subscription.Cancel(command.Source);
        subscriptionRepository.Update(subscription);

        events.CollectEvent(new SubscriptionCancelled(subscription.Id));
        return Result.Success();
    }
}
