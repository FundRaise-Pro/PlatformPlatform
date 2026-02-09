using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Campaigns.Commands;

[PublicAPI]
public sealed record PublishCampaignCommand(CampaignId Id) : ICommand, IRequest<Result>;

public sealed class PublishCampaignHandler(
    ICampaignRepository campaignRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<PublishCampaignCommand, Result>
{
    public async Task<Result> Handle(PublishCampaignCommand command, CancellationToken cancellationToken)
    {
        var campaign = await campaignRepository.GetByIdAsync(command.Id, cancellationToken);
        if (campaign is null) return Result.NotFound($"Campaign with id '{command.Id}' not found.");

        if (campaign.Status == CampaignStatus.Published)
        {
            return Result.BadRequest("Campaign is already published.");
        }

        campaign.Publish();
        campaignRepository.Update(campaign);

        events.CollectEvent(new CampaignPublished(campaign.Id));
        return Result.Success();
    }
}
