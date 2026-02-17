using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.Fundraiser.Features.Events.Domain;
using PlatformPlatform.Fundraiser.Features.Stories.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Campaigns.Queries;

[PublicAPI]
public sealed record GetCampaignsQuery : IRequest<Result<CampaignSummaryResponse[]>>;

[PublicAPI]
public sealed record CampaignSummaryResponse(
    CampaignId Id,
    string Title,
    string? Summary,
    string? FeaturedImageUrl,
    CampaignStatus Status,
    DateTime? PublishedAt,
    DateTimeOffset CreatedAt,
    int StoryCount,
    int EventCount,
    decimal GoalAmount,
    decimal RaisedAmount
);

public sealed class GetCampaignsHandler(
    ICampaignRepository campaignRepository,
    IStoryRepository storyRepository,
    IFundraisingEventRepository eventRepository,
    ITransactionRepository transactionRepository
) : IRequestHandler<GetCampaignsQuery, Result<CampaignSummaryResponse[]>>
{
    public async Task<Result<CampaignSummaryResponse[]>> Handle(GetCampaignsQuery query, CancellationToken cancellationToken)
    {
        var campaigns = await campaignRepository.GetAllAsync(cancellationToken);
        var allStories = await storyRepository.GetAllAsync(cancellationToken);
        var allEvents = await eventRepository.GetAllAsync(cancellationToken);

        // Group stories and events by CampaignId for efficient lookup
        var storiesByCampaign = allStories
            .Where(s => s.CampaignId is not null)
            .GroupBy(s => s.CampaignId!)
            .ToDictionary(g => g.Key, g => g.ToArray());

        var eventsByCampaign = allEvents
            .Where(e => e.CampaignId is not null)
            .GroupBy(e => e.CampaignId!)
            .ToDictionary(g => g.Key, g => g.ToArray());

        // Collect all target IDs for bulk raised amount query
        var allStoryIds = allStories
            .Where(s => s.CampaignId is not null)
            .Select(s => s.Id.ToString()).ToArray();
        var allEventIds = allEvents
            .Where(e => e.CampaignId is not null)
            .Select(e => e.Id.ToString()).ToArray();
        var allCampaignIds = campaigns.Select(c => c.Id.ToString()).ToArray();

        var storyRaisedTask = transactionRepository.GetRaisedAmountsForTargetsAsync(
            FundraisingTargetType.Story, allStoryIds, cancellationToken);
        var eventRaisedTask = transactionRepository.GetRaisedAmountsForTargetsAsync(
            FundraisingTargetType.Event, allEventIds, cancellationToken);
        var campaignRaisedTask = transactionRepository.GetRaisedAmountsForTargetsAsync(
            FundraisingTargetType.Campaign, allCampaignIds, cancellationToken);
        await Task.WhenAll(storyRaisedTask, eventRaisedTask, campaignRaisedTask);

        var storyRaisedAmounts = storyRaisedTask.Result;
        var eventRaisedAmounts = eventRaisedTask.Result;
        var campaignRaisedAmounts = campaignRaisedTask.Result;

        var response = campaigns.Select(c =>
        {
            var campaignStories = storiesByCampaign.GetValueOrDefault(c.Id, []);
            var campaignEvents = eventsByCampaign.GetValueOrDefault(c.Id, []);

            var goalAmount = campaignStories.Sum(s => s.GoalAmount) + campaignEvents.Sum(e => e.TargetAmount);
            var raisedAmount = campaignRaisedAmounts.GetValueOrDefault(c.Id.ToString(), 0)
                + campaignStories.Sum(s => storyRaisedAmounts.GetValueOrDefault(s.Id.ToString(), 0))
                + campaignEvents.Sum(e => eventRaisedAmounts.GetValueOrDefault(e.Id.ToString(), 0));

            return new CampaignSummaryResponse(
                c.Id, c.Title, c.Summary, c.FeaturedImageUrl, c.Status, c.PublishedAt, c.CreatedAt,
                campaignStories.Length, campaignEvents.Length, goalAmount, raisedAmount
            );
        }).ToArray();

        return response;
    }
}
