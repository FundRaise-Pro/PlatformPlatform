using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.Donations.Domain;

// --- Transaction Repository ---
public interface ITransactionRepository : ICrudRepository<Transaction, TransactionId>
{
    Task<Transaction[]> GetAllAsync(CancellationToken cancellationToken);
}

internal sealed class TransactionRepository(FundraiserDbContext dbContext)
    : RepositoryBase<Transaction, TransactionId>(dbContext), ITransactionRepository
{
    public async Task<Transaction[]> GetAllAsync(CancellationToken cancellationToken)
    {
        return await DbSet.OrderByDescending(t => t.CreatedAt).ToArrayAsync(cancellationToken);
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
