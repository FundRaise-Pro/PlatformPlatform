using Microsoft.EntityFrameworkCore;
using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.Certificates.Domain;

public interface ICertificateIssuanceBatchRepository : ICrudRepository<CertificateIssuanceBatch, CertificateIssuanceBatchId>
{
    Task<CertificateIssuanceBatch[]> GetAllAsync(CancellationToken cancellationToken);
    Task<CertificateIssuanceBatch?> GetByIdWithCertificatesAsync(CertificateIssuanceBatchId id, CancellationToken cancellationToken);
}

internal sealed class CertificateIssuanceBatchRepository(FundraiserDbContext dbContext)
    : RepositoryBase<CertificateIssuanceBatch, CertificateIssuanceBatchId>(dbContext), ICertificateIssuanceBatchRepository
{
    public async Task<CertificateIssuanceBatch[]> GetAllAsync(CancellationToken cancellationToken)
    {
        return await DbSet.OrderByDescending(b => b.CreatedAt).ToArrayAsync(cancellationToken);
    }

    public async Task<CertificateIssuanceBatch?> GetByIdWithCertificatesAsync(CertificateIssuanceBatchId id, CancellationToken cancellationToken)
    {
        return await DbSet
            .Include(b => b.Certificates)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }
}

public interface ITaxCertificateRepository : ICrudRepository<TaxCertificate, TaxCertificateId>
{
    Task<TaxCertificate[]> GetByBatchIdAsync(CertificateIssuanceBatchId batchId, CancellationToken cancellationToken);
}

internal sealed class TaxCertificateRepository(FundraiserDbContext dbContext)
    : RepositoryBase<TaxCertificate, TaxCertificateId>(dbContext), ITaxCertificateRepository
{
    public async Task<TaxCertificate[]> GetByBatchIdAsync(CertificateIssuanceBatchId batchId, CancellationToken cancellationToken)
    {
        return await DbSet
            .Where(c => c.BatchId == batchId)
            .OrderBy(c => c.ReceiptNumber)
            .ToArrayAsync(cancellationToken);
    }
}
