using System.Collections.Immutable;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.Fundraiser.Features.Forms.Domain;

public sealed class FormTemplateConfiguration : IEntityTypeConfiguration<FormTemplate>
{
    private static readonly JsonSerializerOptions JsonSerializerOptions = JsonSerializerOptions.Default;

    public void Configure(EntityTypeBuilder<FormTemplate> builder)
    {
        builder.MapStronglyTypedUuid<FormTemplate, FormTemplateId>(t => t.Id);

        builder.Property(t => t.Sections)
            .HasColumnName("Sections")
            .HasConversion(
                v => JsonSerializer.Serialize(v.ToArray(), JsonSerializerOptions),
                v => JsonSerializer.Deserialize<ImmutableArray<FormTemplateSection>>(v, JsonSerializerOptions)
            );
    }
}
