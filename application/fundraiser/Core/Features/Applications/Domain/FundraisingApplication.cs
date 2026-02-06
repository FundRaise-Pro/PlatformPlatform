using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.StronglyTypedIds;
using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.Fundraiser.Features.Forms.Domain;

namespace PlatformPlatform.Fundraiser.Features.Applications.Domain;

[IdPrefix("app")]
public sealed record FundraisingApplicationId(string Value) : StronglyTypedUlid<FundraisingApplicationId>;

/// <summary>
///     A FundraisingApplication represents a funding/assistance request submitted by a beneficiary.
///     Contains the dynamic form responses, review workflow, and status tracking.
/// </summary>
public sealed class FundraisingApplication : AggregateRoot<FundraisingApplicationId>, ITenantScopedEntity
{
    private FundraisingApplication(FundraisingApplicationId id, TenantId tenantId, CampaignId campaignId) : base(id)
    {
        TenantId = tenantId;
        CampaignId = campaignId;
    }

    public TenantId TenantId { get; private init; }

    public CampaignId CampaignId { get; private init; }

    public FormVersionId? FormVersionId { get; private set; }

    public ApplicationStatus Status { get; private set; } = ApplicationStatus.Incomplete;

    public bool IsMutable { get; private set; } = true;

    public int Priority { get; private set; }

    public string? InternalNotes { get; private set; }

    public string? ReviewNotes { get; private set; }

    // Workflow timestamps
    public DateTime? SubmittedAt { get; private set; }

    public DateTime? ReviewedAt { get; private set; }

    public ReviewStage? CurrentReviewStage { get; private set; }

    public int ReviewsCompletedCount { get; private set; }

    public int ReviewsPendingCount { get; private set; }

    public bool RequiresEscalation { get; private set; }

    // Field data — the user-submitted form responses
    private readonly List<ApplicationFieldData> _fieldData = [];
    public IReadOnlyCollection<ApplicationFieldData> FieldData => _fieldData.AsReadOnly();

    // Reviews
    private readonly List<ApplicationReview> _reviews = [];
    public IReadOnlyCollection<ApplicationReview> Reviews => _reviews.AsReadOnly();

    // Documents
    private readonly List<ApplicationDocument> _documents = [];
    public IReadOnlyCollection<ApplicationDocument> Documents => _documents.AsReadOnly();

    public static FundraisingApplication Create(TenantId tenantId, CampaignId campaignId, FormVersionId? formVersionId = null)
    {
        return new FundraisingApplication(FundraisingApplicationId.NewId(), tenantId, campaignId)
        {
            FormVersionId = formVersionId
        };
    }

    public void Submit()
    {
        Status = ApplicationStatus.Submitted;
        SubmittedAt = DateTime.UtcNow;
        IsMutable = false;
    }

    public void SetFieldData(string fieldName, string? fieldValue, string? fieldType = null)
    {
        var existing = _fieldData.FirstOrDefault(f => f.FieldName == fieldName);
        if (existing is not null)
        {
            _fieldData.Remove(existing);
        }

        _fieldData.Add(new ApplicationFieldData(fieldName, fieldValue, fieldType));
    }

    public void AddReview(ReviewStage stage, string reviewType, ReviewDecision decision, string notes, int priorityScore = 5)
    {
        var review = new ApplicationReview(stage, reviewType, decision, notes, priorityScore);
        _reviews.Add(review);
        ReviewsCompletedCount++;

        if (decision == ReviewDecision.Approve && stage == ReviewStage.FinalApproval)
        {
            Status = ApplicationStatus.Approved;
        }
        else if (decision == ReviewDecision.Reject)
        {
            Status = ApplicationStatus.Denied;
        }
        else if (decision == ReviewDecision.NeedsMoreInfo)
        {
            Status = ApplicationStatus.RequiresInfo;
            IsMutable = true;
        }

        ReviewedAt = DateTime.UtcNow;
    }

    public void AddDocument(string fileName, string blobUrl, string blobName, string mimeType, long fileSizeBytes)
    {
        _documents.Add(new ApplicationDocument(fileName, blobUrl, blobName, mimeType, fileSizeBytes));
    }

    public void SetPriority(int priority)
    {
        Priority = Math.Clamp(priority, 0, 10);
    }
}

public enum ApplicationStatus
{
    Incomplete = 0,
    Submitted = 1,
    Reviewed = 2,
    Approved = 3,
    RequiresInfo = 4,
    Denied = 5,
    Paid = 6
}

public enum ReviewStage
{
    Screening = 1,
    MedicalReview = 2,
    FinancialAssessment = 3,
    FinalApproval = 4
}

public enum ReviewDecision
{
    Pending = 0,
    Approve = 1,
    Reject = 2,
    NeedsMoreInfo = 3,
    Uncertain = 4
}

public sealed class ApplicationFieldData
{
    public Guid Id { get; private init; } = Guid.NewGuid();
    public string FieldName { get; private set; } = string.Empty;
    public string? FieldValue { get; private set; }
    public string? FieldType { get; private set; }
    public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

    internal ApplicationFieldData(string fieldName, string? fieldValue, string? fieldType)
    {
        FieldName = fieldName;
        FieldValue = fieldValue;
        FieldType = fieldType;
    }

    private ApplicationFieldData() { } // EF Core
}

public sealed class ApplicationReview
{
    public Guid Id { get; private init; } = Guid.NewGuid();
    public ReviewStage Stage { get; private set; }
    public string ReviewType { get; private set; } = string.Empty;
    public ReviewDecision Decision { get; private set; }
    public string Notes { get; private set; } = string.Empty;
    public string? InternalNotes { get; private set; }
    public int PriorityScore { get; private set; }
    public int ConfidenceLevel { get; private set; } = 5;
    public bool IsEscalated { get; private set; }
    public DateTime ReviewedAt { get; private set; } = DateTime.UtcNow;
    public int? TimeSpentSeconds { get; private set; }

    internal ApplicationReview(ReviewStage stage, string reviewType, ReviewDecision decision, string notes, int priorityScore)
    {
        Stage = stage;
        ReviewType = reviewType;
        Decision = decision;
        Notes = notes;
        PriorityScore = priorityScore;
    }

    private ApplicationReview() { } // EF Core
}

public sealed class ApplicationDocument
{
    public Guid Id { get; private init; } = Guid.NewGuid();
    public string FileName { get; private set; } = string.Empty;
    public string BlobUrl { get; private set; } = string.Empty;
    public string BlobName { get; private set; } = string.Empty;
    public string MimeType { get; private set; } = string.Empty;
    public long FileSizeBytes { get; private set; }
    public DateTime UploadedAt { get; private set; } = DateTime.UtcNow;

    internal ApplicationDocument(string fileName, string blobUrl, string blobName, string mimeType, long fileSizeBytes)
    {
        FileName = fileName;
        BlobUrl = blobUrl;
        BlobName = blobName;
        MimeType = mimeType;
        FileSizeBytes = fileSizeBytes;
    }

    private ApplicationDocument() { } // EF Core
}
