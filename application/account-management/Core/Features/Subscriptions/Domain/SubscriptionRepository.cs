using Microsoft.EntityFrameworkCore;
using PlatformPlatform.AccountManagement.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.AccountManagement.Features.Subscriptions.Domain;

public interface ISubscriptionRepository : ICrudRepository<Subscription, SubscriptionId>
{
    Task<Subscription?> GetByTenantIdAsync(TenantId tenantId, CancellationToken cancellationToken);
    Task<Subscription?> GetByStripeCustomerIdAsync(string stripeCustomerId, CancellationToken cancellationToken);
    Task<Subscription?> GetByStripeSubscriptionIdAsync(string stripeSubscriptionId, CancellationToken cancellationToken);
}

internal sealed class SubscriptionRepository(AccountManagementDbContext dbContext)
    : RepositoryBase<Subscription, SubscriptionId>(dbContext), ISubscriptionRepository
{
    public async Task<Subscription?> GetByTenantIdAsync(TenantId tenantId, CancellationToken cancellationToken)
    {
        return await DbSet.FirstOrDefaultAsync(s => s.TenantId == tenantId, cancellationToken);
    }

    public async Task<Subscription?> GetByStripeCustomerIdAsync(string stripeCustomerId, CancellationToken cancellationToken)
    {
        return await DbSet.FirstOrDefaultAsync(s => s.StripeCustomerId == stripeCustomerId, cancellationToken);
    }

    public async Task<Subscription?> GetByStripeSubscriptionIdAsync(string stripeSubscriptionId, CancellationToken cancellationToken)
    {
        return await DbSet.FirstOrDefaultAsync(s => s.StripeSubscriptionId == stripeSubscriptionId, cancellationToken);
    }
}
