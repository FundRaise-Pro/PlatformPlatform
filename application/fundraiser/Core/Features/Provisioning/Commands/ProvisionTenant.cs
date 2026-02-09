using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using PlatformPlatform.Fundraiser.Features.Blogs.Domain;
using PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Provisioning.Commands;

[PublicAPI]
public sealed record ProvisionTenantCommand : ICommand, IRequest<Result>
{
    [JsonIgnore] // Removes from API contract
    public TenantId TenantId { get; init; } = null!;
}

public sealed class ProvisionTenantHandler(
    ITenantSettingsRepository tenantSettingsRepository,
    IBlogCategoryRepository blogCategoryRepository,
    ITelemetryEventsCollector events,
    ILogger<ProvisionTenantHandler> logger
) : IRequestHandler<ProvisionTenantCommand, Result>
{
    public async Task<Result> Handle(ProvisionTenantCommand command, CancellationToken cancellationToken)
    {
        var existing = await tenantSettingsRepository.GetByTenantIdUnfilteredAsync(command.TenantId, cancellationToken);
        if (existing is not null)
        {
            logger.LogInformation("Tenant '{TenantId}' already provisioned, skipping", command.TenantId);
            return Result.Success();
        }

        var settings = TenantSettings.Domain.TenantSettings.Create(command.TenantId);
        await tenantSettingsRepository.AddAsync(settings, cancellationToken);

        var newsCategory = BlogCategory.Create(command.TenantId, "News", "news", "Latest news and updates");
        await blogCategoryRepository.AddAsync(newsCategory, cancellationToken);

        logger.LogInformation("Provisioned tenant '{TenantId}' with default settings and blog category", command.TenantId);
        events.CollectEvent(new TenantProvisioned(settings.Id));

        return Result.Success();
    }
}
