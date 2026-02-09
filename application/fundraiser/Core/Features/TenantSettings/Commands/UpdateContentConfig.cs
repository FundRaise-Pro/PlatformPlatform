using FluentValidation;
using PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.TenantSettings.Commands;

[PublicAPI]
public sealed record UpdateContentConfigCommand(
    string ApplicationLabel,
    string CauseType,
    string BeneficiaryLabel,
    string DonationLabel,
    string CampaignLabel,
    string BranchLabel
) : ICommand, IRequest<Result>;

public sealed class UpdateContentConfigValidator : AbstractValidator<UpdateContentConfigCommand>
{
    public UpdateContentConfigValidator()
    {
        RuleFor(x => x.ApplicationLabel).NotEmpty().MaximumLength(100).WithMessage("Application label must be between 1 and 100 characters.");
        RuleFor(x => x.CauseType).NotEmpty().MaximumLength(100).WithMessage("Cause type must be between 1 and 100 characters.");
        RuleFor(x => x.BeneficiaryLabel).NotEmpty().MaximumLength(100).WithMessage("Beneficiary label must be between 1 and 100 characters.");
        RuleFor(x => x.DonationLabel).NotEmpty().MaximumLength(100).WithMessage("Donation label must be between 1 and 100 characters.");
        RuleFor(x => x.CampaignLabel).NotEmpty().MaximumLength(100).WithMessage("Campaign label must be between 1 and 100 characters.");
        RuleFor(x => x.BranchLabel).NotEmpty().MaximumLength(100).WithMessage("Branch label must be between 1 and 100 characters.");
    }
}

public sealed class UpdateContentConfigHandler(
    ITenantSettingsRepository tenantSettingsRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<UpdateContentConfigCommand, Result>
{
    public async Task<Result> Handle(UpdateContentConfigCommand command, CancellationToken cancellationToken)
    {
        var settings = await tenantSettingsRepository.GetByTenantIdAsync(executionContext.TenantId!, cancellationToken);
        if (settings is null)
            return Result.NotFound($"Tenant settings not found for tenant '{executionContext.TenantId}'.");

        var content = new ContentConfig(
            command.ApplicationLabel,
            command.CauseType,
            command.BeneficiaryLabel,
            command.DonationLabel,
            command.CampaignLabel,
            command.BranchLabel
        );

        settings.UpdateContent(content);
        tenantSettingsRepository.Update(settings);

        events.CollectEvent(new ContentConfigUpdated(settings.Id));

        return Result.Success();
    }
}
