using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Campaigns.Commands;

[PublicAPI]
public sealed record UpdateCampaignCommand : ICommand, IRequest<Result>
{
    public required CampaignId Id { get; init; }

    public required string Title { get; init; }

    public required string Content { get; init; }

    public string? Summary { get; init; }
}

public sealed class UpdateCampaignValidator : AbstractValidator<UpdateCampaignCommand>
{
    public UpdateCampaignValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Content).NotEmpty();
        RuleFor(x => x.Summary).MaximumLength(2000);
    }
}

public sealed class UpdateCampaignHandler(
    ICampaignRepository campaignRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<UpdateCampaignCommand, Result>
{
    public async Task<Result> Handle(UpdateCampaignCommand command, CancellationToken cancellationToken)
    {
        var campaign = await campaignRepository.GetByIdAsync(command.Id, cancellationToken);
        if (campaign is null) return Result.NotFound($"Campaign with id '{command.Id}' not found.");

        campaign.UpdateContent(command.Title, command.Content, command.Summary);
        campaignRepository.Update(campaign);

        events.CollectEvent(new CampaignUpdated(campaign.Id));
        return Result.Success();
    }
}
