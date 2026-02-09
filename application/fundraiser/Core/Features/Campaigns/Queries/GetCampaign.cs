using Mapster;
using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
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
    CampaignImageResponse[] Images,
    string[] Tags
);

[PublicAPI]
public sealed record CampaignImageResponse(Guid Id, string BlobUrl, string MimeType, long FileSizeBytes);

public sealed class GetCampaignHandler(ICampaignRepository campaignRepository)
    : IRequestHandler<GetCampaignQuery, Result<CampaignResponse>>
{
    public async Task<Result<CampaignResponse>> Handle(GetCampaignQuery query, CancellationToken cancellationToken)
    {
        var campaign = await campaignRepository.GetByIdAsync(query.Id, cancellationToken);
        if (campaign is null) return Result<CampaignResponse>.NotFound($"Campaign with id '{query.Id}' not found.");

        return MapToResponse(campaign);
    }

    private static CampaignResponse MapToResponse(Campaign campaign)
    {
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
            campaign.Images.Select(i => new CampaignImageResponse(i.Id, i.BlobUrl, i.MimeType, i.FileSizeBytes)).ToArray(),
            campaign.Tags.Select(t => t.Tag).ToArray()
        );
    }
}
