using PlatformPlatform.AccountManagement.Features.Tenants.Domain;
using PlatformPlatform.AccountManagement.Integrations.Fundraiser;

namespace PlatformPlatform.AccountManagement.Features.Tenants.EventHandlers;

public sealed class TenantCreatedEventHandler(ILogger<TenantCreatedEventHandler> logger, FundraiserProvisioningClient fundraiserProvisioningClient)
    : INotificationHandler<TenantCreatedEvent>
{
    public async Task Handle(TenantCreatedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Raise event to send Welcome mail to tenant");

        var provisioned = await fundraiserProvisioningClient.ProvisionTenantAsync(notification.TenantId, cancellationToken);
        if (!provisioned)
        {
            logger.LogWarning("Failed to provision fundraiser data for tenant {TenantId}, will be provisioned on first access", notification.TenantId);
        }
    }
}
