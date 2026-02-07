using System.Collections.Immutable;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.StronglyTypedIds;

namespace PlatformPlatform.Fundraiser.Features.Forms.Domain;

[IdPrefix("ftpl")]
[JsonConverter(typeof(StronglyTypedIdJsonConverter<string, FormTemplateId>))]
public sealed record FormTemplateId(string Value) : StronglyTypedUlid<FormTemplateId>(Value)
{
    public override string ToString() => Value;
}

/// <summary>
///     A FormTemplate is a reusable, pre-built form definition that tenants can clone into their own FormVersions.
///     Templates can be system-provided (no TenantId) or tenant-created (shared within a tenant).
///     Enables a template marketplace for multi-tenant form reuse.
/// </summary>
public sealed class FormTemplate : AggregateRoot<FormTemplateId>
{
    private FormTemplate(FormTemplateId id, string name, string category) : base(id)
    {
        Name = name;
        Category = category;
    }

    public string Name { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public string Category { get; private set; } = string.Empty;

    public bool IsSystemTemplate { get; private set; } = true;

    public bool IsPublished { get; private set; }

    public int CloneCount { get; private set; }

    public string? PreviewImageUrl { get; private set; }

    public ImmutableArray<FormTemplateSection> Sections { get; private set; } = [];

    public static FormTemplate Create(string name, string category, string? description = null, bool isSystemTemplate = true)
    {
        return new FormTemplate(FormTemplateId.NewId(), name, category)
        {
            Description = description,
            IsSystemTemplate = isSystemTemplate
        };
    }

    public void Publish()
    {
        IsPublished = true;
    }

    public void Unpublish()
    {
        IsPublished = false;
    }

    public void IncrementCloneCount()
    {
        CloneCount++;
    }

    public void UpdateDetails(string name, string category, string? description, string? previewImageUrl)
    {
        Name = name;
        Category = category;
        Description = description;
        PreviewImageUrl = previewImageUrl;
    }

    public void SetSections(ImmutableArray<FormTemplateSection> sections)
    {
        Sections = sections;
    }
}

public sealed record FormTemplateSection(
    string Name,
    string Title,
    int DisplayOrder,
    string? Description,
    string? Icon,
    ImmutableArray<FormTemplateField> Fields,
    ImmutableArray<FormTemplateFlag> Flags
);

public sealed record FormTemplateField(
    string Name,
    string Label,
    FormFieldType FieldType,
    string DefaultValue,
    int DisplayOrder,
    bool IsRequired,
    string? Placeholder,
    string? ValidationRules,
    string? Options
);

public sealed record FormTemplateFlag(
    string Name,
    string Question,
    int DisplayOrder,
    bool IsRequired,
    string? HelpText
);
