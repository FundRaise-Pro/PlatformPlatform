using Microsoft.Extensions.Logging;
using PlatformPlatform.SharedKernel.Domain;

namespace PlatformPlatform.AccountManagement.Integrations.Fundraiser;

public sealed class FundraiserProvisioningClient(HttpClient httpClient, ILogger<FundraiserProvisioningClient> logger)
{
    public async Task<bool> ProvisionTenantAsync(TenantId tenantId, CancellationToken cancellationToken)
    {
        try
        {
            var response = await httpClient.PostAsync($"/internal-api/fundraiser/tenants/{tenantId}/provision", null, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                logger.LogInformation("Successfully provisioned fundraiser data for tenant {TenantId}", tenantId);
                return true;
            }

            logger.LogWarning("Failed to provision fundraiser data for tenant {TenantId}. Status: {StatusCode}", tenantId, response.StatusCode);
            return false;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error provisioning fundraiser data for tenant {TenantId}", tenantId);
            return false;
        }
    }
}
