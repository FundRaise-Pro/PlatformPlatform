using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.Fundraiser.Features.Stories.Domain;

namespace PlatformPlatform.Fundraiser.Features.Stories.EventHandlers;

public sealed class AutoFundStoryOnTransactionSucceeded(
    IStoryRepository storyRepository,
    ITransactionRepository transactionRepository,
    ILogger<AutoFundStoryOnTransactionSucceeded> logger
) : INotificationHandler<TransactionSucceededDomainEvent>
{
    public async Task Handle(TransactionSucceededDomainEvent notification, CancellationToken cancellationToken)
    {
        if (notification.TargetType != FundraisingTargetType.Story)
            return;

        if (!StoryId.TryParse(notification.TargetId, out var storyId) || storyId is null)
        {
            logger.LogWarning("Invalid StoryId '{TargetId}' in TransactionSucceededDomainEvent", notification.TargetId);
            return;
        }

        var story = await storyRepository.GetByIdAsync(storyId, cancellationToken);
        if (story is null)
        {
            logger.LogWarning("Story '{StoryId}' not found for auto-funding", storyId);
            return;
        }

        if (story.GoalAmount <= 0 || story.FundraisingStatus != FundraisingStatus.Raising)
            return;

        var raisedAmount = await transactionRepository.GetRaisedAmountAsync(
            FundraisingTargetType.Story, story.Id.ToString(), cancellationToken);

        if (raisedAmount >= story.GoalAmount)
        {
            story.CompleteFundraising();
            storyRepository.Update(story);
            logger.LogInformation("Story '{StoryId}' auto-funded: raised {Raised} >= goal {Goal}",
                storyId, raisedAmount, story.GoalAmount);
        }
    }
}
