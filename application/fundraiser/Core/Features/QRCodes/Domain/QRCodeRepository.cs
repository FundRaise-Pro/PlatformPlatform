using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.QRCodes.Domain;

public interface IQRCodeRepository : ICrudRepository<QRCode, QRCodeId>
{
    Task<QRCode[]> GetAllAsync(CancellationToken cancellationToken);
    Task<QRCode[]> GetActiveAsync(CancellationToken cancellationToken);
}

internal sealed class QRCodeRepository(FundraiserDbContext dbContext)
    : RepositoryBase<QRCode, QRCodeId>(dbContext), IQRCodeRepository
{
    public async Task<QRCode[]> GetAllAsync(CancellationToken cancellationToken)
    {
        return await DbSet.OrderByDescending(q => q.CreatedAt).ToArrayAsync(cancellationToken);
    }

    public async Task<QRCode[]> GetActiveAsync(CancellationToken cancellationToken)
    {
        return await DbSet
            .Where(q => q.IsActive)
            .OrderByDescending(q => q.CreatedAt)
            .ToArrayAsync(cancellationToken);
    }
}
