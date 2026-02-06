using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Applications.Domain;
using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.Fundraiser.Features.Forms.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Applications.Commands;

[PublicAPI]
public sealed record CreateApplicationCommand : ICommand, IRequest<Result<FundraisingApplicationId>>
{
    public required CampaignId CampaignId { get; init; }

    public FormVersionId? FormVersionId { get; init; }
}

public sealed class CreateApplicationHandler(
    IFundraisingApplicationRepository applicationRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<CreateApplicationCommand, Result<FundraisingApplicationId>>
{
    public async Task<Result<FundraisingApplicationId>> Handle(CreateApplicationCommand command, CancellationToken cancellationToken)
    {
        var application = FundraisingApplication.Create(
            executionContext.TenantId!, command.CampaignId, command.FormVersionId
        );

        await applicationRepository.AddAsync(application, cancellationToken);

        events.CollectEvent(new ApplicationCreated(application.Id));
        return application.Id;
    }
}
