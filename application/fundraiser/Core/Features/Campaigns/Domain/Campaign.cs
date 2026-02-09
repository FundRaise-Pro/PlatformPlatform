using System.Text.RegularExpressions;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.StronglyTypedIds;

namespace PlatformPlatform.Fundraiser.Features.Campaigns.Domain;

[IdPrefix("cmp")]
public sealed record CampaignId(string Value) : StronglyTypedUlid<CampaignId>(Value);

/// <summary>
///     A Campaign represents a fundraising story / beneficiary case that donors can contribute to.
///     Ported from GOS-Dev's Story entity, adapted for multi-tenant SaaS.
/// </summary>
public sealed class Campaign : AggregateRoot<CampaignId>, ITenantScopedEntity
{
    private Campaign(CampaignId id, TenantId tenantId, string title, string content) : base(id)
    {
        TenantId = tenantId;
        Title = title;
        Content = content;
    }

    public TenantId TenantId { get; private init; }

    public string Title { get; private set; } = string.Empty;

    public string Content { get; private set; } = string.Empty;

    public string Slug { get; private set; } = string.Empty;

    public string? Summary { get; private set; }

    public string? FeaturedImageUrl { get; private set; }

    public string? ExternalFundingUrl { get; private set; }

    public CampaignStatus Status { get; private set; } = CampaignStatus.Draft;

    public bool IsPrivate { get; private set; }

    public DateTime? PublishedAt { get; private set; }

    public DateTime? ScreeningDate { get; private set; }

    private readonly List<CampaignImage> _images = [];
    public IReadOnlyCollection<CampaignImage> Images => _images.AsReadOnly();

    private readonly List<CampaignTag> _tags = [];
    public IReadOnlyCollection<CampaignTag> Tags => _tags.AsReadOnly();

    public static Campaign Create(TenantId tenantId, string title, string content)
    {
        var campaign = new Campaign(CampaignId.NewId(), tenantId, title, content)
        {
            Slug = GenerateSlug(title)
        };
        return campaign;
    }

    public void UpdateContent(string title, string content, string? summary)
    {
        Title = title;
        Content = content;
        Summary = summary;
        Slug = GenerateSlug(title);
    }

    public void SetFeaturedImage(string imageUrl)
    {
        FeaturedImageUrl = imageUrl;
    }

    public void Publish()
    {
        Status = CampaignStatus.Published;
        PublishedAt = DateTime.UtcNow;
    }

    public void AddImage(string blobUrl, string blobName, string mimeType, long fileSizeBytes)
    {
        _images.Add(new CampaignImage(blobUrl, blobName, mimeType, fileSizeBytes));
    }

    public void AddTag(string tag)
    {
        if (_tags.All(t => t.Tag != tag))
        {
            _tags.Add(new CampaignTag(tag));
        }
    }

    private static string GenerateSlug(string title)
    {
        var slug = title.ToLowerInvariant();
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"-+", "-");
        return slug.Trim('-');
    }
}

public enum CampaignStatus
{
    Draft = 0,
    RequiresScreening = 1,
    Approved = 2,
    Published = 3,
    FundingInProgress = 4,
    Fulfilled = 5,
    Archived = 6
}

public sealed class CampaignImage
{
    public Guid Id { get; private init; } = Guid.NewGuid();

    public string BlobUrl { get; private init; } = string.Empty;

    public string BlobName { get; private init; } = string.Empty;

    public string MimeType { get; private init; } = string.Empty;

    public long FileSizeBytes { get; private init; }

    public DateTime UploadedAt { get; private init; } = DateTime.UtcNow;

    internal CampaignImage(string blobUrl, string blobName, string mimeType, long fileSizeBytes)
    {
        BlobUrl = blobUrl;
        BlobName = blobName;
        MimeType = mimeType;
        FileSizeBytes = fileSizeBytes;
    }

    private CampaignImage() { } // EF Core
}

public sealed class CampaignTag
{
    public int Id { get; private init; }

    public string Tag { get; private init; } = string.Empty;

    internal CampaignTag(string tag)
    {
        Tag = tag;
    }

    private CampaignTag() { } // EF Core
}
