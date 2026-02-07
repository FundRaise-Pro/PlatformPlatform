using PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.TenantSettings.Commands;

[PublicAPI]
public sealed record InitializeTenantSettingsCommand : ICommand, IRequest<Result<TenantSettingsId>>;

public sealed class InitializeTenantSettingsHandler(
    ITenantSettingsRepository tenantSettingsRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<InitializeTenantSettingsCommand, Result<TenantSettingsId>>
{
    public async Task<Result<TenantSettingsId>> Handle(InitializeTenantSettingsCommand command, CancellationToken cancellationToken)
    {
        var tenantId = executionContext.TenantId!;
        var existing = await tenantSettingsRepository.GetByTenantIdAsync(tenantId, cancellationToken);
        if (existing is not null)
            return Result<TenantSettingsId>.BadRequest($"Tenant settings already exist for tenant '{tenantId}'.");

        var settings = Domain.TenantSettings.Create(tenantId);
        await tenantSettingsRepository.AddAsync(settings, cancellationToken);

        events.CollectEvent(new TenantSettingsInitialized(settings.Id));

        return settings.Id;
    }
}
