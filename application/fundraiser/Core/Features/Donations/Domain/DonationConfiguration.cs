using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.Fundraiser.Features.Donations.Domain;

public sealed class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.MapStronglyTypedUuid<Transaction, TransactionId>(t => t.Id);
        builder.MapStronglyTypedLongId<Transaction, TenantId>(t => t.TenantId);

        builder.Property(t => t.Name).HasMaxLength(200).IsRequired();
        builder.Property(t => t.Description).HasMaxLength(1000);
        builder.Property(t => t.GatewayPaymentId).HasMaxLength(200);
        builder.Property(t => t.PayeeName).HasMaxLength(200);
        builder.Property(t => t.PayeeEmail).HasMaxLength(200);
        builder.Property(t => t.Status).HasMaxLength(50);
        builder.Property(t => t.Type).HasMaxLength(50);
        builder.Property(t => t.PaymentProvider).HasMaxLength(50);
        builder.Property(t => t.PaymentMethod).HasMaxLength(50);
        builder.Property(t => t.Amount).HasColumnType("decimal(18,2)");
        builder.Property(t => t.AmountFee).HasColumnType("decimal(18,2)");
        builder.Property(t => t.AmountNet).HasColumnType("decimal(18,2)");

        builder.OwnsMany(t => t.ProcessingLogs, plb =>
        {
            plb.WithOwner().HasForeignKey("TransactionId");
            plb.Property(p => p.PreviousStatus).HasMaxLength(50);
            plb.Property(p => p.NewStatus).HasMaxLength(50);
        });
    }
}

public sealed class DonationConfiguration : IEntityTypeConfiguration<Donation>
{
    public void Configure(EntityTypeBuilder<Donation> builder)
    {
        builder.MapStronglyTypedUuid<Donation, DonationId>(d => d.Id);
        builder.MapStronglyTypedLongId<Donation, TenantId>(d => d.TenantId);
        builder.MapStronglyTypedUuid<Donation, TransactionId>(d => d.TransactionId);
        builder.MapStronglyTypedNullableId<Donation, DonorProfileId, string>(d => d.DonorProfileId);

        builder.Property(d => d.Message).HasMaxLength(1000);
    }
}

public sealed class DonorProfileConfiguration : IEntityTypeConfiguration<DonorProfile>
{
    public void Configure(EntityTypeBuilder<DonorProfile> builder)
    {
        builder.MapStronglyTypedUuid<DonorProfile, DonorProfileId>(p => p.Id);
        builder.MapStronglyTypedLongId<DonorProfile, TenantId>(p => p.TenantId);

        builder.Property(p => p.TaxIdNumber).HasMaxLength(50);
        builder.Property(p => p.CompanyRegistration).HasMaxLength(100);
        builder.Property(p => p.CompanyName).HasMaxLength(200);
        builder.Property(p => p.StreetAddress).HasMaxLength(300);
        builder.Property(p => p.Suburb).HasMaxLength(100);
        builder.Property(p => p.City).HasMaxLength(100);
        builder.Property(p => p.Province).HasMaxLength(100);
        builder.Property(p => p.PostalCode).HasMaxLength(20);
        builder.Property(p => p.Country).HasMaxLength(100);
    }
}

public sealed class PaymentSubscriptionConfiguration : IEntityTypeConfiguration<PaymentSubscription>
{
    public void Configure(EntityTypeBuilder<PaymentSubscription> builder)
    {
        builder.MapStronglyTypedUuid<PaymentSubscription, SubscriptionId>(s => s.Id);
        builder.MapStronglyTypedLongId<PaymentSubscription, TenantId>(s => s.TenantId);
        builder.MapStronglyTypedNullableId<PaymentSubscription, DonorProfileId, string>(s => s.DonorProfileId);

        builder.Property(s => s.GatewayToken).HasMaxLength(500);
        builder.Property(s => s.Currency).HasMaxLength(10);
        builder.Property(s => s.ItemName).HasMaxLength(200).IsRequired();
        builder.Property(s => s.ItemDescription).HasMaxLength(1000);
        builder.Property(s => s.Status).HasMaxLength(50);
        builder.Property(s => s.InitialAmount).HasColumnType("decimal(18,2)");
        builder.Property(s => s.RecurringAmount).HasColumnType("decimal(18,2)");
    }
}
