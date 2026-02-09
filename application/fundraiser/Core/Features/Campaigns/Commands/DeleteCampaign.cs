using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Campaigns.Commands;

[PublicAPI]
public sealed record DeleteCampaignCommand(CampaignId Id) : ICommand, IRequest<Result>;

public sealed class DeleteCampaignHandler(
    ICampaignRepository campaignRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<DeleteCampaignCommand, Result>
{
    public async Task<Result> Handle(DeleteCampaignCommand command, CancellationToken cancellationToken)
    {
        var campaign = await campaignRepository.GetByIdAsync(command.Id, cancellationToken);
        if (campaign is null) return Result.NotFound($"Campaign with id '{command.Id}' not found.");

        campaignRepository.Remove(campaign);

        events.CollectEvent(new CampaignDeleted(campaign.Id));
        return Result.Success();
    }
}
