using PlatformPlatform.SharedKernel.Domain;

namespace PlatformPlatform.Fundraiser.Features.Certificates.Domain;

/// <summary>
///     Tracks the next receipt number per tenant per tax year.
///     Monotonic allocation with gaps allowed — voided certificates keep their receipt number.
///     Increment is atomic via SQL Server MERGE WITH (HOLDLOCK).
/// </summary>
public sealed class ReceiptNumberSequence
{
    public TenantId TenantId { get; init; } = null!;

    public int TaxYear { get; init; }

    public long CurrentValue { get; private set; }

    public static ReceiptNumberSequence Create(TenantId tenantId, int taxYear)
    {
        return new ReceiptNumberSequence
        {
            TenantId = tenantId,
            TaxYear = taxYear,
            CurrentValue = 0
        };
    }
}

/// <summary>
///     Allocates sequential receipt numbers atomically, safe in multi-worker environments.
///     Uses SQL Server MERGE WITH (HOLDLOCK) for atomic upsert.
/// </summary>
public interface IReceiptNumberAllocator
{
    Task<long> NextReceiptNumberAsync(TenantId tenantId, int taxYear, CancellationToken cancellationToken);
}
