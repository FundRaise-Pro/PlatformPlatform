using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.Fundraiser.Features.Events.Domain;
using PlatformPlatform.Fundraiser.Features.Stories.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Campaigns.Queries;

[PublicAPI]
public sealed record GetCampaignQuery(CampaignId Id) : IRequest<Result<CampaignResponse>>;

[PublicAPI]
public sealed record CampaignResponse(
    CampaignId Id,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ModifiedAt,
    string Title,
    string Content,
    string? Summary,
    string? FeaturedImageUrl,
    string? ExternalFundingUrl,
    CampaignStatus Status,
    bool IsPrivate,
    DateTime? PublishedAt,
    decimal GoalAmount,
    decimal RaisedAmount,
    int StoryCount,
    int EventCount,
    CampaignImageResponse[] Images,
    string[] Tags,
    CampaignLinkedStoryResponse[] LinkedStories,
    CampaignLinkedEventResponse[] LinkedEvents
);

[PublicAPI]
public sealed record CampaignImageResponse(Guid Id, string BlobUrl, string MimeType, long FileSizeBytes);

[PublicAPI]
public sealed record CampaignLinkedStoryResponse(
    StoryId Id, string Title, decimal GoalAmount, decimal RaisedAmount, FundraisingStatus FundraisingStatus
);

[PublicAPI]
public sealed record CampaignLinkedEventResponse(
    FundraisingEventId Id, string Name, DateTime EventDate, decimal TargetAmount, decimal RaisedAmount, EventStatus Status
);

public sealed class GetCampaignHandler(
    ICampaignRepository campaignRepository,
    IStoryRepository storyRepository,
    IFundraisingEventRepository eventRepository,
    ITransactionRepository transactionRepository
) : IRequestHandler<GetCampaignQuery, Result<CampaignResponse>>
{
    public async Task<Result<CampaignResponse>> Handle(GetCampaignQuery query, CancellationToken cancellationToken)
    {
        var campaign = await campaignRepository.GetByIdAsync(query.Id, cancellationToken);
        if (campaign is null) return Result<CampaignResponse>.NotFound($"Campaign with id '{query.Id}' not found.");

        // Fetch linked stories and events in parallel
        var storiesTask = storyRepository.GetByCampaignIdAsync(query.Id, cancellationToken);
        var eventsTask = eventRepository.GetByCampaignIdAsync(query.Id, cancellationToken);
        await Task.WhenAll(storiesTask, eventsTask);

        var stories = storiesTask.Result;
        var events = eventsTask.Result;

        // Bulk fetch raised amounts for all linked targets (no N+1)
        var storyIds = stories.Select(s => s.Id.ToString()).ToArray();
        var eventIds = events.Select(e => e.Id.ToString()).ToArray();

        var storyRaisedTask = transactionRepository.GetRaisedAmountsForTargetsAsync(
            FundraisingTargetType.Story, storyIds, cancellationToken);
        var eventRaisedTask = transactionRepository.GetRaisedAmountsForTargetsAsync(
            FundraisingTargetType.Event, eventIds, cancellationToken);
        var campaignDirectTask = transactionRepository.GetRaisedAmountAsync(
            FundraisingTargetType.Campaign, campaign.Id.ToString(), cancellationToken);
        await Task.WhenAll(storyRaisedTask, eventRaisedTask, campaignDirectTask);

        var storyRaisedAmounts = storyRaisedTask.Result;
        var eventRaisedAmounts = eventRaisedTask.Result;
        var campaignDirectRaised = campaignDirectTask.Result;

        // Aggregate totals: sum of all linked targets + direct campaign donations
        var totalGoalAmount = stories.Sum(s => s.GoalAmount) + events.Sum(e => e.TargetAmount);
        var totalRaisedAmount = campaignDirectRaised
            + storyRaisedAmounts.Values.Sum()
            + eventRaisedAmounts.Values.Sum();

        var linkedStories = stories.Select(s => new CampaignLinkedStoryResponse(
            s.Id, s.Title, s.GoalAmount,
            storyRaisedAmounts.GetValueOrDefault(s.Id.ToString(), 0),
            s.FundraisingStatus
        )).ToArray();

        var linkedEvents = events.Select(e => new CampaignLinkedEventResponse(
            e.Id, e.Name, e.EventDate, e.TargetAmount,
            eventRaisedAmounts.GetValueOrDefault(e.Id.ToString(), 0),
            e.Status
        )).ToArray();

        return new CampaignResponse(
            campaign.Id,
            campaign.CreatedAt,
            campaign.ModifiedAt,
            campaign.Title,
            campaign.Content,
            campaign.Summary,
            campaign.FeaturedImageUrl,
            campaign.ExternalFundingUrl,
            campaign.Status,
            campaign.IsPrivate,
            campaign.PublishedAt,
            totalGoalAmount,
            totalRaisedAmount,
            stories.Length,
            events.Length,
            campaign.Images.Select(i => new CampaignImageResponse(i.Id, i.BlobUrl, i.MimeType, i.FileSizeBytes)).ToArray(),
            campaign.Tags.Select(t => t.Tag).ToArray(),
            linkedStories,
            linkedEvents
        );
    }
}
