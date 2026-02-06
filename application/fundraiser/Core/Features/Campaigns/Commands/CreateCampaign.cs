using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Campaigns.Commands;

[PublicAPI]
public sealed record CreateCampaignCommand : ICommand, IRequest<Result<CampaignId>>
{
    public required string Title { get; init; }

    public required string Content { get; init; }

    public string? Summary { get; init; }
}

public sealed class CreateCampaignValidator : AbstractValidator<CreateCampaignCommand>
{
    public CreateCampaignValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Content).NotEmpty();
        RuleFor(x => x.Summary).MaximumLength(2000);
    }
}

public sealed class CreateCampaignHandler(
    ICampaignRepository campaignRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<CreateCampaignCommand, Result<CampaignId>>
{
    public async Task<Result<CampaignId>> Handle(CreateCampaignCommand command, CancellationToken cancellationToken)
    {
        var tenantId = executionContext.TenantId!;
        var campaign = Campaign.Create(tenantId, command.Title, command.Content);

        if (command.Summary is not null)
        {
            campaign.UpdateContent(command.Title, command.Content, command.Summary);
        }

        await campaignRepository.AddAsync(campaign, cancellationToken);

        events.CollectEvent(new CampaignCreated(campaign.Id));
        return campaign.Id;
    }
}
