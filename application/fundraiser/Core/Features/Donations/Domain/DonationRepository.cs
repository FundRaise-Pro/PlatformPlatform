using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.Donations.Domain;

// --- Transaction Repository ---
public interface ITransactionRepository : ICrudRepository<Transaction, TransactionId>
{
    Task<Transaction[]> GetAllAsync(CancellationToken cancellationToken);
    Task<decimal> GetRaisedAmountAsync(FundraisingTargetType targetType, string targetId, CancellationToken cancellationToken);
    Task<Dictionary<string, decimal>> GetRaisedAmountsForTargetsAsync(FundraisingTargetType targetType, string[] targetIds, CancellationToken cancellationToken);
    Task<Transaction?> GetByMerchantReferenceUnfilteredAsync(string merchantReference, CancellationToken cancellationToken);
}

internal sealed class TransactionRepository(FundraiserDbContext dbContext)
    : RepositoryBase<Transaction, TransactionId>(dbContext), ITransactionRepository
{
    public async Task<Transaction[]> GetAllAsync(CancellationToken cancellationToken)
    {
        return await DbSet.OrderByDescending(t => t.CreatedAt).ToArrayAsync(cancellationToken);
    }

    public async Task<decimal> GetRaisedAmountAsync(FundraisingTargetType targetType, string targetId, CancellationToken cancellationToken)
    {
        var raisedAmount = await DbSet
            .Where(t => t.TargetType == targetType && t.TargetId == targetId && t.Status == TransactionStatus.Success)
            .SumAsync(t => (decimal?)(t.AmountNet ?? t.Amount), cancellationToken);

        return raisedAmount ?? 0;
    }

    public async Task<Dictionary<string, decimal>> GetRaisedAmountsForTargetsAsync(
        FundraisingTargetType targetType, string[] targetIds, CancellationToken cancellationToken)
    {
        if (targetIds.Length == 0) return new Dictionary<string, decimal>();

        return await DbSet
            .Where(t => t.TargetType == targetType && targetIds.Contains(t.TargetId) && t.Status == TransactionStatus.Success)
            .GroupBy(t => t.TargetId)
            .ToDictionaryAsync(
                g => g.Key,
                g => g.Sum(t => t.AmountNet ?? t.Amount),
                cancellationToken);
    }

    public async Task<Transaction?> GetByMerchantReferenceUnfilteredAsync(string merchantReference, CancellationToken cancellationToken)
    {
        return await DbSet
            .IgnoreQueryFilters([QueryFilterNames.Tenant])
            .FirstOrDefaultAsync(t => t.MerchantReference == merchantReference, cancellationToken);
    }
}

// --- Donation Repository ---
public interface IDonationRepository : ICrudRepository<Donation, DonationId>
{
    Task<Donation[]> GetAllAsync(CancellationToken cancellationToken);
}

internal sealed class DonationRepository(FundraiserDbContext dbContext)
    : RepositoryBase<Donation, DonationId>(dbContext), IDonationRepository
{
    public async Task<Donation[]> GetAllAsync(CancellationToken cancellationToken)
    {
        return await DbSet.OrderByDescending(d => d.CreatedAt).ToArrayAsync(cancellationToken);
    }
}

// --- DonorProfile Repository ---
public interface IDonorProfileRepository : ICrudRepository<DonorProfile, DonorProfileId>
{
}

internal sealed class DonorProfileRepository(FundraiserDbContext dbContext)
    : RepositoryBase<DonorProfile, DonorProfileId>(dbContext), IDonorProfileRepository;

// --- Subscription Repository ---
public interface IPaymentSubscriptionRepository : ICrudRepository<PaymentSubscription, SubscriptionId>
{
    Task<PaymentSubscription[]> GetActiveAsync(CancellationToken cancellationToken);
}

internal sealed class PaymentSubscriptionRepository(FundraiserDbContext dbContext)
    : RepositoryBase<PaymentSubscription, SubscriptionId>(dbContext), IPaymentSubscriptionRepository
{
    public async Task<PaymentSubscription[]> GetActiveAsync(CancellationToken cancellationToken)
    {
        return await DbSet
            .Where(s => s.Status == SubscriptionStatus.Active)
            .OrderByDescending(s => s.CreatedAt)
            .ToArrayAsync(cancellationToken);
    }
}
