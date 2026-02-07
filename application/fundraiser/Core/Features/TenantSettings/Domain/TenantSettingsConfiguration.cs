using System.Collections.Immutable;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;

public sealed class TenantSettingsConfiguration : IEntityTypeConfiguration<TenantSettings>
{
    private static readonly JsonSerializerOptions JsonSerializerOptions = JsonSerializerOptions.Default;

    public void Configure(EntityTypeBuilder<TenantSettings> builder)
    {
        builder.MapStronglyTypedUuid<TenantSettings, TenantSettingsId>(t => t.Id);
        builder.MapStronglyTypedLongId<TenantSettings, TenantId>(t => t.TenantId);

        builder.OwnsOne(t => t.Theme, b => b.ToJson());
        builder.OwnsOne(t => t.Brand, b => b.ToJson());
        builder.OwnsOne(t => t.Domain, b => b.ToJson());
        builder.OwnsOne(t => t.Content, b => b.ToJson());

        builder.Property(t => t.FeatureFlags)
            .HasColumnName("FeatureFlags")
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonSerializerOptions),
                v => JsonSerializer.Deserialize<ImmutableDictionary<string, bool>>(v, JsonSerializerOptions) ?? ImmutableDictionary<string, bool>.Empty
            );
    }
}
