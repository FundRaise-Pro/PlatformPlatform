using Microsoft.EntityFrameworkCore;
using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Persistence;

namespace PlatformPlatform.Fundraiser.Features.Certificates.Domain;

public interface ICertificateTemplateRepository : ICrudRepository<CertificateTemplate, CertificateTemplateId>
{
    Task<CertificateTemplate[]> GetAllAsync(CancellationToken cancellationToken);
    Task<CertificateTemplate?> GetDefaultAsync(CancellationToken cancellationToken);
}

internal sealed class CertificateTemplateRepository(FundraiserDbContext dbContext)
    : RepositoryBase<CertificateTemplate, CertificateTemplateId>(dbContext), ICertificateTemplateRepository
{
    public async Task<CertificateTemplate[]> GetAllAsync(CancellationToken cancellationToken)
    {
        return await DbSet.OrderByDescending(t => t.CreatedAt).ToArrayAsync(cancellationToken);
    }

    public async Task<CertificateTemplate?> GetDefaultAsync(CancellationToken cancellationToken)
    {
        return await DbSet.FirstOrDefaultAsync(t => t.IsDefault, cancellationToken);
    }
}
