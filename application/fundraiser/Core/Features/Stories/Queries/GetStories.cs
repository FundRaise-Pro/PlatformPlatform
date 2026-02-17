using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.Fundraiser.Features.Stories.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Stories.Queries;

[PublicAPI]
public sealed record GetStoriesQuery : IRequest<Result<StorySummaryResponse[]>>;

[PublicAPI]
public sealed record StorySummaryResponse(
    StoryId Id,
    string Title,
    string? Summary,
    string? FeaturedImageUrl,
    decimal GoalAmount,
    FundraisingStatus FundraisingStatus,
    FulfilmentStatus FulfilmentStatus,
    CampaignId? CampaignId,
    DateTime? PublishedAt,
    DateTimeOffset CreatedAt
);

public sealed class GetStoriesHandler(
    IStoryRepository storyRepository
) : IRequestHandler<GetStoriesQuery, Result<StorySummaryResponse[]>>
{
    public async Task<Result<StorySummaryResponse[]>> Handle(GetStoriesQuery query, CancellationToken cancellationToken)
    {
        var stories = await storyRepository.GetAllAsync(cancellationToken);

        var response = stories.Select(s => new StorySummaryResponse(
            s.Id, s.Title, s.Summary, s.FeaturedImageUrl, s.GoalAmount,
            s.FundraisingStatus, s.FulfilmentStatus, s.CampaignId,
            s.PublishedAt, s.CreatedAt
        )).ToArray();

        return response;
    }
}
