using System.Collections.Immutable;
using PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.TenantSettings.Commands;

[PublicAPI]
public sealed record UpdateFeatureFlagsCommand(Dictionary<string, bool> Flags) : ICommand, IRequest<Result>;

public sealed class UpdateFeatureFlagsHandler(
    ITenantSettingsRepository tenantSettingsRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<UpdateFeatureFlagsCommand, Result>
{
    public async Task<Result> Handle(UpdateFeatureFlagsCommand command, CancellationToken cancellationToken)
    {
        var settings = await tenantSettingsRepository.GetByTenantIdAsync(executionContext.TenantId!, cancellationToken);
        if (settings is null)
            return Result.NotFound($"Tenant settings not found for tenant '{executionContext.TenantId}'.");

        settings.UpdateFeatureFlags(command.Flags.ToImmutableDictionary());
        tenantSettingsRepository.Update(settings);

        events.CollectEvent(new FeatureFlagsUpdated(settings.Id, command.Flags.Count));

        return Result.Success();
    }
}
