using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.Fundraiser.Features.Events.Domain;

namespace PlatformPlatform.Fundraiser.Features.Events.EventHandlers;

public sealed class AutoCompleteEventOnTransactionSucceeded(
    IFundraisingEventRepository eventRepository,
    ITransactionRepository transactionRepository,
    ILogger<AutoCompleteEventOnTransactionSucceeded> logger
) : INotificationHandler<TransactionSucceededDomainEvent>
{
    public async Task Handle(TransactionSucceededDomainEvent notification, CancellationToken cancellationToken)
    {
        if (notification.TargetType != FundraisingTargetType.Event)
            return;

        if (!FundraisingEventId.TryParse(notification.TargetId, out var eventId) || eventId is null)
        {
            logger.LogWarning("Invalid FundraisingEventId '{TargetId}' in TransactionSucceededDomainEvent", notification.TargetId);
            return;
        }

        var fundraisingEvent = await eventRepository.GetByIdAsync(eventId, cancellationToken);
        if (fundraisingEvent is null)
        {
            logger.LogWarning("Event '{EventId}' not found for auto-complete", eventId);
            return;
        }

        if (fundraisingEvent.TargetAmount <= 0 || fundraisingEvent.Status != EventStatus.InProgress)
            return;

        var raisedAmount = await transactionRepository.GetRaisedAmountAsync(
            FundraisingTargetType.Event, fundraisingEvent.Id.ToString(), cancellationToken);

        if (raisedAmount >= fundraisingEvent.TargetAmount)
        {
            fundraisingEvent.Complete();
            eventRepository.Update(fundraisingEvent);
            logger.LogInformation("Event '{EventId}' auto-completed: raised {Raised} >= target {Target}",
                eventId, raisedAmount, fundraisingEvent.TargetAmount);
        }
    }
}
