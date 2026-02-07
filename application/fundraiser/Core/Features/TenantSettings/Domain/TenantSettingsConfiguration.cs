using System.Collections.Immutable;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;

public sealed class TenantSettingsConfiguration : IEntityTypeConfiguration<TenantSettings>
{
    private static readonly JsonSerializerOptions JsonSerializerOptions = JsonSerializerOptions.Default;
    private static readonly ValueComparer<SocialLink[]?> SocialLinksComparer = new(
        (left, right) =>
            ReferenceEquals(left, right) ||
            (left != null && right != null && left.SequenceEqual(right)),
        value => value == null ? 0 : value.Aggregate(0, (hash, item) => HashCode.Combine(hash, item.GetHashCode())),
        value => value == null ? null : value.ToArray()
    );
    private static readonly ValueComparer<string[]?> CustomDomainsComparer = new(
        (left, right) =>
            ReferenceEquals(left, right) ||
            (left != null && right != null && left.SequenceEqual(right)),
        value => value == null ? 0 : value.Aggregate(0, (hash, item) => HashCode.Combine(hash, item.GetHashCode())),
        value => value == null ? null : value.ToArray()
    );

    public void Configure(EntityTypeBuilder<TenantSettings> builder)
    {
        builder.MapStronglyTypedUuid<TenantSettings, TenantSettingsId>(t => t.Id);
        builder.MapStronglyTypedLongId<TenantSettings, TenantId>(t => t.TenantId);

        builder.OwnsOne(t => t.Theme, b => b.ToJson());
        builder.OwnsOne(t => t.Brand, b =>
        {
            b.ToJson();
            b.Property(x => x.SocialLinks)
                .HasConversion(
                    value => value == null ? null : JsonSerializer.Serialize(value, JsonSerializerOptions),
                    value => string.IsNullOrWhiteSpace(value)
                        ? null
                        : JsonSerializer.Deserialize<SocialLink[]>(value, JsonSerializerOptions)
                )
                .Metadata.SetValueComparer(SocialLinksComparer);
        });
        builder.OwnsOne(t => t.Domain, b =>
        {
            b.ToJson();
            b.Property(x => x.CustomDomains)
                .HasConversion(
                    value => value == null ? null : JsonSerializer.Serialize(value, JsonSerializerOptions),
                    value => string.IsNullOrWhiteSpace(value)
                        ? null
                        : JsonSerializer.Deserialize<string[]>(value, JsonSerializerOptions)
                )
                .Metadata.SetValueComparer(CustomDomainsComparer);
        });
        builder.OwnsOne(t => t.Content, b => b.ToJson());
        builder.OwnsOne(t => t.Payment, b => b.ToJson());

        builder.Property(t => t.FeatureFlags)
            .HasColumnName("FeatureFlags")
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonSerializerOptions),
                v => JsonSerializer.Deserialize<ImmutableDictionary<string, bool>>(v, JsonSerializerOptions) ?? ImmutableDictionary<string, bool>.Empty
            );
    }
}
