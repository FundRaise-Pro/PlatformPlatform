using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.EndUsers.Domain;

public interface IEndUserRepository : ICrudRepository<EndUser, EndUserId>
{
    Task<EndUser?> GetByEmailAsync(string email, CancellationToken cancellationToken);
    Task<EndUser?> GetByPhoneNumberAsync(string phoneNumber, CancellationToken cancellationToken);
    Task<EndUser?> GetBySocialLoginAsync(string socialProvider, string externalId, CancellationToken cancellationToken);
    Task<EndUser[]> GetAllAsync(CancellationToken cancellationToken);
    Task<EndUser[]> GetByTypeAsync(EndUserType type, CancellationToken cancellationToken);
}

internal sealed class EndUserRepository(FundraiserDbContext dbContext)
    : RepositoryBase<EndUser, EndUserId>(dbContext), IEndUserRepository
{
    public async Task<EndUser?> GetByEmailAsync(string email, CancellationToken cancellationToken)
    {
        return await DbSet.FirstOrDefaultAsync(e => e.Email == email.ToLowerInvariant(), cancellationToken);
    }

    public async Task<EndUser?> GetByPhoneNumberAsync(string phoneNumber, CancellationToken cancellationToken)
    {
        return await DbSet.FirstOrDefaultAsync(e => e.PhoneNumber == phoneNumber, cancellationToken);
    }

    public async Task<EndUser?> GetBySocialLoginAsync(string socialProvider, string externalId, CancellationToken cancellationToken)
    {
        return await DbSet.FirstOrDefaultAsync(
            e => e.SocialProvider == socialProvider && e.ExternalId == externalId, cancellationToken);
    }

    public async Task<EndUser[]> GetAllAsync(CancellationToken cancellationToken)
    {
        return await DbSet.OrderByDescending(e => e.CreatedAt).ToArrayAsync(cancellationToken);
    }

    public async Task<EndUser[]> GetByTypeAsync(EndUserType type, CancellationToken cancellationToken)
    {
        return await DbSet.Where(e => e.Type == type).OrderByDescending(e => e.CreatedAt).ToArrayAsync(cancellationToken);
    }
}
