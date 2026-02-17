using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.Fundraiser.Features.Certificates.Domain;

public sealed class CertificateIssuanceBatchConfiguration : IEntityTypeConfiguration<CertificateIssuanceBatch>
{
    public void Configure(EntityTypeBuilder<CertificateIssuanceBatch> builder)
    {
        builder.MapStronglyTypedUuid<CertificateIssuanceBatch, CertificateIssuanceBatchId>(b => b.Id);
        builder.MapStronglyTypedLongId<CertificateIssuanceBatch, TenantId>(b => b.TenantId);
        builder.MapStronglyTypedUuid<CertificateIssuanceBatch, CertificateTemplateId>(b => b.TemplateId);

        builder.Property(b => b.Status).HasMaxLength(50);
        builder.Property(b => b.GeneratedBy).HasMaxLength(200);
        builder.Property(b => b.ErrorMessage).HasMaxLength(2000);

        builder.HasIndex(b => new { b.TenantId, b.TaxYear });

        builder.HasMany(b => b.Certificates)
            .WithOne()
            .HasForeignKey(c => c.BatchId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class TaxCertificateConfiguration : IEntityTypeConfiguration<TaxCertificate>
{
    public void Configure(EntityTypeBuilder<TaxCertificate> builder)
    {
        builder.MapStronglyTypedUuid<TaxCertificate, TaxCertificateId>(c => c.Id);
        builder.MapStronglyTypedLongId<TaxCertificate, TenantId>(c => c.TenantId);
        builder.MapStronglyTypedUuid<TaxCertificate, CertificateIssuanceBatchId>(c => c.BatchId);
        builder.MapStronglyTypedUuid<TaxCertificate, DonorProfileId>(c => c.DonorProfileId);

        builder.Property(c => c.TotalDonated).HasColumnType("decimal(18,2)");
        builder.Property(c => c.DonorName).HasMaxLength(300).IsRequired();
        builder.Property(c => c.Status).HasMaxLength(50);
        builder.Property(c => c.CertificateUrl).HasMaxLength(500);
        builder.Property(c => c.ErrorMessage).HasMaxLength(2000);

        builder.HasIndex(c => new { c.TenantId, c.TaxYear, c.DonorProfileId });
        builder.HasIndex(c => new { c.TenantId, c.TaxYear, c.ReceiptNumber }).IsUnique();
    }
}
