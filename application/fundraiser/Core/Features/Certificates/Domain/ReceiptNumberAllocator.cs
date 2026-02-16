using Microsoft.EntityFrameworkCore;
using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.SharedKernel.Domain;

namespace PlatformPlatform.Fundraiser.Features.Certificates.Domain;

internal sealed class ReceiptNumberAllocator(FundraiserDbContext dbContext) : IReceiptNumberAllocator
{
    public async Task<long> NextReceiptNumberAsync(TenantId tenantId, int taxYear, CancellationToken cancellationToken)
    {
        var tenantIdValue = tenantId.Value;

        // Atomic upsert — safe under concurrency with SQL Server MERGE + HOLDLOCK.
        // Monotonic allocation, gaps allowed. Voided certificates retain their receipt number.
        var result = await dbContext.Database.SqlQueryRaw<long>(
            """
            MERGE ReceiptNumberSequences WITH (HOLDLOCK) AS target
            USING (SELECT {0} AS TenantId, {1} AS TaxYear) AS src
            ON target.TenantId = src.TenantId AND target.TaxYear = src.TaxYear
            WHEN MATCHED THEN
                UPDATE SET CurrentValue = target.CurrentValue + 1
            WHEN NOT MATCHED THEN
                INSERT (TenantId, TaxYear, CurrentValue) VALUES (src.TenantId, src.TaxYear, 1)
            OUTPUT inserted.CurrentValue;
            """,
            tenantIdValue, taxYear
        ).ToListAsync(cancellationToken);

        return result.First();
    }
}
