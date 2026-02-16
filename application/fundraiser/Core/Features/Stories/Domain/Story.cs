using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.StronglyTypedIds;

namespace PlatformPlatform.Fundraiser.Features.Stories.Domain;

[IdPrefix("sto")]
public sealed record StoryId(string Value) : StronglyTypedUlid<StoryId>(Value);

public sealed class Story : AggregateRoot<StoryId>, ITenantScopedEntity
{
    private Story(StoryId id, TenantId tenantId, string title, string content) : base(id)
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

    public decimal GoalAmount { get; private set; }

    public CampaignId? CampaignId { get; private set; }

    public FundraisingStatus FundraisingStatus { get; private set; } = FundraisingStatus.Draft;

    public FulfilmentStatus FulfilmentStatus { get; private set; } = FulfilmentStatus.Pending;

    public bool IsPrivate { get; private set; }

    public DateTime? PublishedAt { get; private set; }

    public DateTime? ScreeningDate { get; private set; }

    private readonly List<StoryImage> _images = [];
    public IReadOnlyCollection<StoryImage> Images => _images.AsReadOnly();

    private readonly List<StoryUpdate> _updates = [];
    public IReadOnlyCollection<StoryUpdate> Updates => _updates.AsReadOnly();

    public static Story Create(TenantId tenantId, string title, string content, decimal goalAmount, CampaignId? campaignId)
    {
        var story = new Story(StoryId.NewId(), tenantId, title, content)
        {
            Slug = GenerateSlug(title),
            GoalAmount = goalAmount,
            CampaignId = campaignId
        };
        return story;
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

    public void SetGoalAmount(decimal goalAmount)
    {
        GoalAmount = goalAmount;
    }

    public void LinkToCampaign(CampaignId? campaignId)
    {
        CampaignId = campaignId;
    }

    public void SubmitForScreening()
    {
        FundraisingStatus = FundraisingStatus.RequiresScreening;
        ScreeningDate = DateTime.UtcNow;
    }

    public void Approve()
    {
        FundraisingStatus = FundraisingStatus.Approved;
    }

    public void Publish()
    {
        FundraisingStatus = FundraisingStatus.Raising;
        PublishedAt ??= DateTime.UtcNow;
    }

    public void CompleteFundraising()
    {
        FundraisingStatus = FundraisingStatus.Funded;
    }

    public void Archive()
    {
        FundraisingStatus = FundraisingStatus.Archived;
    }

    public void MarkFulfilmentInProgress()
    {
        FulfilmentStatus = FulfilmentStatus.InProgress;
    }

    public void MarkFulfilled()
    {
        FulfilmentStatus = FulfilmentStatus.Fulfilled;
    }

    public void AddImage(string blobUrl, string blobName, string mimeType, long fileSizeBytes)
    {
        _images.Add(new StoryImage(blobUrl, blobName, mimeType, fileSizeBytes));
    }

    public void AddUpdate(string title, string content)
    {
        _updates.Add(new StoryUpdate(title, content));
    }

    private static string GenerateSlug(string title)
    {
        var slug = title.ToLowerInvariant();
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"\s+", "-");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-+", "-");
        return slug.Trim('-');
    }
}

public enum FundraisingStatus
{
    Draft = 0,
    RequiresScreening = 1,
    Approved = 2,
    Raising = 3,
    Funded = 4,
    Archived = 5
}

public enum FulfilmentStatus
{
    Pending = 0,
    InProgress = 1,
    Fulfilled = 2
}

public sealed class StoryImage
{
    public Guid Id { get; private init; } = Guid.NewGuid();

    public string BlobUrl { get; private init; } = string.Empty;

    public string BlobName { get; private init; } = string.Empty;

    public string MimeType { get; private init; } = string.Empty;

    public long FileSizeBytes { get; private init; }

    public DateTime UploadedAt { get; private init; } = DateTime.UtcNow;

    internal StoryImage(string blobUrl, string blobName, string mimeType, long fileSizeBytes)
    {
        BlobUrl = blobUrl;
        BlobName = blobName;
        MimeType = mimeType;
        FileSizeBytes = fileSizeBytes;
    }

    private StoryImage() { }
}

public sealed class StoryUpdate
{
    public Guid Id { get; private init; } = Guid.NewGuid();

    public string Title { get; private init; } = string.Empty;

    public string Content { get; private init; } = string.Empty;

    public DateTime CreatedAt { get; private init; } = DateTime.UtcNow;

    internal StoryUpdate(string title, string content)
    {
        Title = title;
        Content = content;
    }

    private StoryUpdate() { }
}
