using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.Users.Domain;

public interface ITenantUserRepository : ICrudRepository<TenantUser, TenantUserId>
{
    Task<TenantUser?> GetByUserIdAsync(UserId userId, CancellationToken cancellationToken);
    Task<TenantUser[]> GetAllAsync(CancellationToken cancellationToken);
    Task<TenantUser[]> GetByBranchAsync(Branches.Domain.BranchId branchId, CancellationToken cancellationToken);
}

internal sealed class TenantUserRepository(FundraiserDbContext dbContext)
    : RepositoryBase<TenantUser, TenantUserId>(dbContext), ITenantUserRepository
{
    public async Task<TenantUser?> GetByUserIdAsync(UserId userId, CancellationToken cancellationToken)
    {
        return await DbSet
            .Include(t => t.RoleAssignments)
            .FirstOrDefaultAsync(t => t.UserId == userId, cancellationToken);
    }

    public async Task<TenantUser[]> GetAllAsync(CancellationToken cancellationToken)
    {
        return await DbSet
            .Include(t => t.RoleAssignments)
            .OrderBy(t => t.DisplayName)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<TenantUser[]> GetByBranchAsync(Branches.Domain.BranchId branchId, CancellationToken cancellationToken)
    {
        return await DbSet
            .Include(t => t.RoleAssignments)
            .Where(t => t.PrimaryBranchId == branchId)
            .OrderBy(t => t.DisplayName)
            .ToArrayAsync(cancellationToken);
    }
}
