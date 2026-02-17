using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using PlatformPlatform.SharedKernel.Domain;

namespace PlatformPlatform.Fundraiser.Integrations.AccountManagement;

/// <summary>
///     HTTP client for calling account-management internal APIs.
///     Used by PlanFeatureGuard to check subscription plan limits.
/// </summary>
public sealed class AccountManagementClient(HttpClient httpClient, ILogger<AccountManagementClient> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter() }
    };

    /// <summary>Retrieves subscription info for a tenant from account-management.</summary>
    public async Task<SubscriptionInfo?> GetSubscriptionInfoAsync(TenantId tenantId, CancellationToken cancellationToken)
    {
        try
        {
            var response = await httpClient.GetAsync(
                $"/internal-api/account-management/subscriptions/by-tenant/{tenantId}", cancellationToken
            );

            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning(
                    "Failed to get subscription info for tenant {TenantId}. Status: {StatusCode}",
                    tenantId, response.StatusCode
                );
                return null;
            }

            return await response.Content.ReadFromJsonAsync<SubscriptionInfo>(JsonOptions, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get subscription info for tenant {TenantId}", tenantId);
            return null;
        }
    }
}

public sealed record SubscriptionInfo(
    string Plan,
    string Status,
    int MaxDonationPages,
    int MaxForms,
    int MaxBlogPosts,
    int MaxBranches,
    bool CustomDomain,
    bool CustomCss,
    bool CertificatesEnabled,
    int StorageMb,
    int ApiCallsPerMonth
);
