using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.Fundraiser.Features.Certificates.Domain;

public sealed class ReceiptNumberSequenceConfiguration : IEntityTypeConfiguration<ReceiptNumberSequence>
{
    public void Configure(EntityTypeBuilder<ReceiptNumberSequence> builder)
    {
        builder.ToTable("ReceiptNumberSequences");
        builder.MapStronglyTypedLongId<ReceiptNumberSequence, TenantId>(r => r.TenantId);

        builder.HasKey(r => new { r.TenantId, r.TaxYear });

        builder.Property(r => r.CurrentValue).IsRequired();
    }
}
