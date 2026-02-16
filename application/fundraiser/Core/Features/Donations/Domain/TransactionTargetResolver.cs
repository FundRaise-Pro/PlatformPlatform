using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.Fundraiser.Features.Events.Domain;

namespace PlatformPlatform.Fundraiser.Features.Donations.Domain;

/// <summary>
///     The sole authority for resolving fundraising targets referenced by transactions.
///     No other handler should implement its own target existence check.
/// </summary>
public sealed record TargetInfo(string Id, FundraisingTargetType Type, string Title, decimal TargetAmount);

public interface ITransactionTargetResolver
{
    Task<TargetInfo?> ResolveAsync(FundraisingTargetType targetType, string targetId, CancellationToken cancellationToken);
}

internal sealed class TransactionTargetResolver(
    ICampaignRepository campaignRepository,
    IFundraisingEventRepository eventRepository
) : ITransactionTargetResolver
{
    public async Task<TargetInfo?> ResolveAsync(FundraisingTargetType targetType, string targetId, CancellationToken cancellationToken)
    {
        return targetType switch
        {
            FundraisingTargetType.Campaign => await ResolveCampaign(targetId, cancellationToken),
            FundraisingTargetType.Event => await ResolveEvent(targetId, cancellationToken),
            // Story will be added in Phase 3 when IStoryRepository is created
            FundraisingTargetType.Story => null,
            _ => null
        };
    }

    private async Task<TargetInfo?> ResolveCampaign(string targetId, CancellationToken cancellationToken)
    {
        var campaign = await campaignRepository.GetByIdAsync(new CampaignId(targetId), cancellationToken);
        if (campaign is null) return null;

        // Campaigns are containers — they don't have a TargetAmount, so we use 0
        return new TargetInfo(campaign.Id, FundraisingTargetType.Campaign, campaign.Title, 0);
    }

    private async Task<TargetInfo?> ResolveEvent(string targetId, CancellationToken cancellationToken)
    {
        var evt = await eventRepository.GetByIdAsync(new FundraisingEventId(targetId), cancellationToken);
        if (evt is null) return null;

        return new TargetInfo(evt.Id, FundraisingTargetType.Event, evt.Name, evt.TargetAmount);
    }
}
