using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.Fundraiser.Features.Stories.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Stories.Queries;

[PublicAPI]
public sealed record GetStoryQuery(StoryId Id) : IRequest<Result<StoryResponse>>;

[PublicAPI]
public sealed record StoryResponse(
    StoryId Id,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ModifiedAt,
    string Title,
    string Slug,
    string Content,
    string? Summary,
    string? FeaturedImageUrl,
    decimal GoalAmount,
    decimal RaisedAmount,
    FundraisingStatus FundraisingStatus,
    FulfilmentStatus FulfilmentStatus,
    CampaignId? CampaignId,
    bool IsPrivate,
    DateTime? PublishedAt,
    DateTime? ScreeningDate,
    StoryImageResponse[] Images,
    StoryUpdateResponse[] Updates
);

[PublicAPI]
public sealed record StoryImageResponse(Guid Id, string BlobUrl, string MimeType, long FileSizeBytes);

[PublicAPI]
public sealed record StoryUpdateResponse(Guid Id, string Title, string Content, DateTime CreatedAt);

public sealed class GetStoryHandler(
    IStoryRepository storyRepository,
    ITransactionRepository transactionRepository
) : IRequestHandler<GetStoryQuery, Result<StoryResponse>>
{
    public async Task<Result<StoryResponse>> Handle(GetStoryQuery query, CancellationToken cancellationToken)
    {
        var story = await storyRepository.GetByIdAsync(query.Id, cancellationToken);
        if (story is null) return Result<StoryResponse>.NotFound($"Story with id '{query.Id}' not found.");

        var raisedAmount = await transactionRepository.GetRaisedAmountAsync(
            FundraisingTargetType.Story, story.Id.ToString(), cancellationToken);

        return new StoryResponse(
            story.Id,
            story.CreatedAt,
            story.ModifiedAt,
            story.Title,
            story.Slug,
            story.Content,
            story.Summary,
            story.FeaturedImageUrl,
            story.GoalAmount,
            raisedAmount,
            story.FundraisingStatus,
            story.FulfilmentStatus,
            story.CampaignId,
            story.IsPrivate,
            story.PublishedAt,
            story.ScreeningDate,
            story.Images.Select(i => new StoryImageResponse(i.Id, i.BlobUrl, i.MimeType, i.FileSizeBytes)).ToArray(),
            story.Updates.Select(u => new StoryUpdateResponse(u.Id, u.Title, u.Content, u.CreatedAt)).ToArray()
        );
    }
}
