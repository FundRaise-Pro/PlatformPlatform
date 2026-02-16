using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.Fundraiser.Features.Certificates.Domain;

public sealed class CertificateTemplateConfiguration : IEntityTypeConfiguration<CertificateTemplate>
{
    public void Configure(EntityTypeBuilder<CertificateTemplate> builder)
    {
        builder.MapStronglyTypedUuid<CertificateTemplate, CertificateTemplateId>(t => t.Id);
        builder.MapStronglyTypedLongId<CertificateTemplate, TenantId>(t => t.TenantId);

        builder.Property(t => t.Name).HasMaxLength(200).IsRequired();
        builder.Property(t => t.Description).HasMaxLength(2000);
        builder.Property(t => t.OrganisationName).HasMaxLength(300);
        builder.Property(t => t.PboNumber).HasMaxLength(50);
        builder.Property(t => t.OrganisationAddress).HasMaxLength(500);
        builder.Property(t => t.RegistrationNumber).HasMaxLength(100);
        builder.Property(t => t.LogoUrl).HasMaxLength(500);
        builder.Property(t => t.SignatoryName).HasMaxLength(200);
        builder.Property(t => t.SignatoryTitle).HasMaxLength(200);

        builder.HasIndex(t => new { t.TenantId, t.IsDefault });
    }
}
