using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
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
    DateTimeOffset CreatedAt
);

public sealed class GetCampaignsHandler(ICampaignRepository campaignRepository)
    : IRequestHandler<GetCampaignsQuery, Result<CampaignSummaryResponse[]>>
{
    public async Task<Result<CampaignSummaryResponse[]>> Handle(GetCampaignsQuery query, CancellationToken cancellationToken)
    {
        var campaigns = await campaignRepository.GetAllAsync(cancellationToken);

        var response = campaigns.Select(c => new CampaignSummaryResponse(
            c.Id, c.Title, c.Summary, c.FeaturedImageUrl, c.Status, c.PublishedAt, c.CreatedAt
        )).ToArray();

        return response;
    }
}
