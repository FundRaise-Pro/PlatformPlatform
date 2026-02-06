using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.StronglyTypedIds;

namespace PlatformPlatform.Fundraiser.Features.Forms.Domain;

[IdPrefix("fv")]
public sealed record FormVersionId(string Value) : StronglyTypedUlid<FormVersionId>;

/// <summary>
///     A FormVersion defines a versioned dynamic form template that tenants use to collect application data.
///     Each version has sections, fields, flags, and select controls.
/// </summary>
public sealed class FormVersion : AggregateRoot<FormVersionId>, ITenantScopedEntity
{
    private FormVersion(FormVersionId id, TenantId tenantId, string versionNumber, string name) : base(id)
    {
        TenantId = tenantId;
        VersionNumber = versionNumber;
        Name = name;
    }

    public TenantId TenantId { get; private init; }

    public string VersionNumber { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public bool IsActive { get; private set; }

    public string? ConfigurationJson { get; private set; }

    private readonly List<FormSection> _sections = [];
    public IReadOnlyCollection<FormSection> Sections => _sections.AsReadOnly();

    public static FormVersion Create(TenantId tenantId, string versionNumber, string name, string? description = null)
    {
        return new FormVersion(FormVersionId.NewId(), tenantId, versionNumber, name)
        {
            Description = description
        };
    }

    public void Activate()
    {
        IsActive = true;
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    public FormSection AddSection(string name, string title, int displayOrder, string? description = null, string? icon = null)
    {
        var section = new FormSection(name, title, displayOrder, description, icon);
        _sections.Add(section);
        return section;
    }
}

public sealed class FormSection
{
    public Guid Id { get; private init; } = Guid.NewGuid();

    public string Name { get; private set; } = string.Empty;

    public string Title { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public int DisplayOrder { get; private set; }

    public bool IsActive { get; private set; } = true;

    public string? Icon { get; private set; }

    private readonly List<FormField> _fields = [];
    public IReadOnlyCollection<FormField> Fields => _fields.AsReadOnly();

    private readonly List<FormFlag> _flags = [];
    public IReadOnlyCollection<FormFlag> Flags => _flags.AsReadOnly();

    private readonly List<FormSelectControl> _selects = [];
    public IReadOnlyCollection<FormSelectControl> Selects => _selects.AsReadOnly();

    internal FormSection(string name, string title, int displayOrder, string? description, string? icon)
    {
        Name = name;
        Title = title;
        DisplayOrder = displayOrder;
        Description = description;
        Icon = icon;
    }

    private FormSection() { } // EF Core

    public void AddField(string name, string label, FormFieldType fieldType, string defaultValue,
        int displayOrder, bool isRequired = false, string? placeholder = null,
        string? validationRules = null, string? options = null,
        decimal? minValue = null, decimal? maxValue = null, int? minLength = null, int? maxLength = null)
    {
        _fields.Add(new FormField(name, label, fieldType, defaultValue, displayOrder, isRequired,
            placeholder, validationRules, options, minValue, maxValue, minLength, maxLength));
    }

    public void AddFlag(string name, string question, int displayOrder, bool isRequired = false, string? helpText = null)
    {
        _flags.Add(new FormFlag(name, question, displayOrder, isRequired, helpText));
    }
}

public sealed class FormField
{
    public Guid Id { get; private init; } = Guid.NewGuid();
    public string Name { get; private set; } = string.Empty;
    public string Label { get; private set; } = string.Empty;
    public FormFieldType FieldType { get; private set; }
    public string DefaultValue { get; private set; } = string.Empty;
    public int DisplayOrder { get; private set; }
    public bool IsRequired { get; private set; }
    public string? Placeholder { get; private set; }
    public string? ValidationRules { get; private set; }
    public string? Options { get; private set; }
    public decimal? MinValue { get; private set; }
    public decimal? MaxValue { get; private set; }
    public int? MinLength { get; private set; }
    public int? MaxLength { get; private set; }

    internal FormField(string name, string label, FormFieldType fieldType, string defaultValue,
        int displayOrder, bool isRequired, string? placeholder, string? validationRules,
        string? options, decimal? minValue, decimal? maxValue, int? minLength, int? maxLength)
    {
        Name = name;
        Label = label;
        FieldType = fieldType;
        DefaultValue = defaultValue;
        DisplayOrder = displayOrder;
        IsRequired = isRequired;
        Placeholder = placeholder;
        ValidationRules = validationRules;
        Options = options;
        MinValue = minValue;
        MaxValue = maxValue;
        MinLength = minLength;
        MaxLength = maxLength;
    }

    private FormField() { } // EF Core
}

public sealed class FormFlag
{
    public Guid Id { get; private init; } = Guid.NewGuid();
    public string Name { get; private set; } = string.Empty;
    public string Question { get; private set; } = string.Empty;
    public int DisplayOrder { get; private set; }
    public bool IsRequired { get; private set; }
    public string? HelpText { get; private set; }

    internal FormFlag(string name, string question, int displayOrder, bool isRequired, string? helpText)
    {
        Name = name;
        Question = question;
        DisplayOrder = displayOrder;
        IsRequired = isRequired;
        HelpText = helpText;
    }

    private FormFlag() { } // EF Core
}

public sealed class FormSelectControl
{
    public Guid Id { get; private init; } = Guid.NewGuid();
    public string Name { get; private set; } = string.Empty;
    public string Label { get; private set; } = string.Empty;
    public string? Options { get; private set; }
    public int DisplayOrder { get; private set; }
    public bool IsRequired { get; private set; }
    public string? Placeholder { get; private set; }

    private FormSelectControl() { } // EF Core
}

public enum FormFieldType
{
    String = 0,
    Number = 1,
    Date = 2,
    Color = 3,
    Boolean = 4,
    Select = 5,
    Textarea = 6,
    Email = 7,
    Phone = 8,
    Currency = 9
}
