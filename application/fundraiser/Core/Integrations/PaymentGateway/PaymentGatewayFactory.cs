using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;
using PlatformPlatform.SharedKernel.Domain;

namespace PlatformPlatform.Fundraiser.Integrations.PaymentGateway;

/// <summary>
///     Resolves the correct IPaymentGateway implementation based on the tenant's configured payment provider.
///     Falls back to PayFast if no tenant-specific configuration exists.
/// </summary>
public sealed class PaymentGatewayFactory(
    IEnumerable<IPaymentGateway> gateways,
    ITenantSettingsRepository tenantSettingsRepository,
    ILogger<PaymentGatewayFactory> logger
)
{
    private readonly Dictionary<PaymentProvider, IPaymentGateway> _gatewayMap =
        gateways.ToDictionary(g => g.Provider);

    /// <summary>
    ///     Gets the payment gateway for the specified tenant.
    ///     Reads the tenant's PaymentConfig to determine the provider, defaulting to PayFast.
    /// </summary>
    public async Task<IPaymentGateway> GetGatewayAsync(TenantId tenantId, CancellationToken cancellationToken)
    {
        var settings = await tenantSettingsRepository.GetByTenantIdAsync(tenantId, cancellationToken);
        var provider = settings?.Payment?.Provider ?? PaymentProvider.PayFast;

        if (_gatewayMap.TryGetValue(provider, out var gateway))
        {
            return gateway;
        }

        logger.LogWarning("Payment provider '{Provider}' not registered. Falling back to PayFast for tenant {TenantId}",
            provider, tenantId);

        return _gatewayMap[PaymentProvider.PayFast];
    }
}
