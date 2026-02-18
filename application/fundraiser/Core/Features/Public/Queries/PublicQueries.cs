using PlatformPlatform.Fundraiser.Features.Blogs.Domain;
using PlatformPlatform.Fundraiser.Features.Branches.Domain;
using PlatformPlatform.Fundraiser.Features.Branches.Queries;
using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.Fundraiser.Features.Campaigns.Queries;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.Fundraiser.Features.Events.Domain;
using PlatformPlatform.Fundraiser.Features.Stories.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Public.Queries;

// --- Public Campaigns ---

[PublicAPI]
public sealed record GetPublicCampaignsQuery : IRequest<Result<PublicCampaignSummaryResponse[]>>;

[PublicAPI]
public sealed record PublicCampaignSummaryResponse(
    string Id,
    string Slug,
    string Title,
    string? Summary,
    string? FeaturedImageUrl,
    CampaignStatus Status,
    DateTime? PublishedAt,
    CampaignImageResponse[] Images,
    string[] Tags
);

public sealed class GetPublicCampaignsHandler(ICampaignRepository campaignRepository)
    : IRequestHandler<GetPublicCampaignsQuery, Result<PublicCampaignSummaryResponse[]>>
{
    public async Task<Result<PublicCampaignSummaryResponse[]>> Handle(GetPublicCampaignsQuery query, CancellationToken cancellationToken)
    {
        var campaigns = await campaignRepository.GetPublishedAsync(cancellationToken);

        return campaigns.Select(c => new PublicCampaignSummaryResponse(
            c.Id, c.Slug, c.Title, c.Summary, c.FeaturedImageUrl, c.Status, c.PublishedAt,
            c.Images.Select(i => new CampaignImageResponse(i.Id, i.BlobUrl, i.MimeType, i.FileSizeBytes)).ToArray(),
            c.Tags.Select(t => t.Tag).ToArray()
        )).ToArray();
    }
}

// --- Public Campaign by Slug ---

[PublicAPI]
public sealed record GetPublicCampaignBySlugQuery(string Slug) : IRequest<Result<PublicCampaignResponse>>;

[PublicAPI]
public sealed record PublicCampaignResponse(
    string Id,
    string Slug,
    string Title,
    string Content,
    string? Summary,
    string? FeaturedImageUrl,
    string? ExternalFundingUrl,
    CampaignStatus Status,
    DateTime? PublishedAt,
    CampaignImageResponse[] Images,
    string[] Tags
);

public sealed class GetPublicCampaignBySlugHandler(ICampaignRepository campaignRepository)
    : IRequestHandler<GetPublicCampaignBySlugQuery, Result<PublicCampaignResponse>>
{
    public async Task<Result<PublicCampaignResponse>> Handle(GetPublicCampaignBySlugQuery query, CancellationToken cancellationToken)
    {
        var campaign = await campaignRepository.GetBySlugAsync(query.Slug, cancellationToken);
        if (campaign is null || campaign.Status < CampaignStatus.Published || campaign.IsPrivate)
            return Result<PublicCampaignResponse>.NotFound($"Campaign '{query.Slug}' not found.");

        return new PublicCampaignResponse(
            campaign.Id, campaign.Slug, campaign.Title, campaign.Content, campaign.Summary,
            campaign.FeaturedImageUrl, campaign.ExternalFundingUrl, campaign.Status, campaign.PublishedAt,
            campaign.Images.Select(i => new CampaignImageResponse(i.Id, i.BlobUrl, i.MimeType, i.FileSizeBytes)).ToArray(),
            campaign.Tags.Select(t => t.Tag).ToArray()
        );
    }
}

// --- Public Blog Categories ---

[PublicAPI]
public sealed record GetPublicBlogCategoriesQuery : IRequest<Result<PublicBlogCategoryResponse[]>>;

[PublicAPI]
public sealed record PublicBlogCategoryResponse(string Title, string Slug, string? Description, int DisplayOrder);

public sealed class GetPublicBlogCategoriesHandler(IBlogCategoryRepository blogCategoryRepository)
    : IRequestHandler<GetPublicBlogCategoriesQuery, Result<PublicBlogCategoryResponse[]>>
{
    public async Task<Result<PublicBlogCategoryResponse[]>> Handle(GetPublicBlogCategoriesQuery query, CancellationToken cancellationToken)
    {
        var categories = await blogCategoryRepository.GetAllAsync(cancellationToken);

        return categories
            .Where(c => c.ShowInNavigation)
            .Select(c => new PublicBlogCategoryResponse(c.Title, c.Slug, c.Description, c.DisplayOrder))
            .ToArray();
    }
}

// --- Public Blog Posts ---

[PublicAPI]
public sealed record GetPublicBlogPostsQuery(string? CategorySlug = null) : IRequest<Result<PublicBlogPostSummaryResponse[]>>;

[PublicAPI]
public sealed record PublicBlogPostSummaryResponse(
    string Slug,
    string Title,
    string? Summary,
    string? FeaturedImageUrl,
    string CategorySlug,
    string CategoryTitle,
    DateTime? PublishedAt,
    string[] Tags
);

public sealed class GetPublicBlogPostsHandler(IBlogPostRepository blogPostRepository, IBlogCategoryRepository blogCategoryRepository)
    : IRequestHandler<GetPublicBlogPostsQuery, Result<PublicBlogPostSummaryResponse[]>>
{
    public async Task<Result<PublicBlogPostSummaryResponse[]>> Handle(GetPublicBlogPostsQuery query, CancellationToken cancellationToken)
    {
        BlogCategoryId? categoryId = null;
        var categories = await blogCategoryRepository.GetAllAsync(cancellationToken);
        var categoryLookup = categories.ToDictionary(c => c.Id);

        if (query.CategorySlug is not null)
        {
            var category = categories.FirstOrDefault(c => c.Slug == query.CategorySlug);
            if (category is null) return Result<PublicBlogPostSummaryResponse[]>.NotFound($"Blog category '{query.CategorySlug}' not found.");
            categoryId = category.Id;
        }

        var posts = await blogPostRepository.GetPublishedAsync(categoryId, cancellationToken);

        return posts.Select(p =>
        {
            var cat = categoryLookup.GetValueOrDefault(p.CategoryId);
            return new PublicBlogPostSummaryResponse(
                p.Slug, p.Title, p.Summary, p.FeaturedImageUrl,
                cat?.Slug ?? "", cat?.Title ?? "",
                p.PublishedAt,
                p.Tags.Select(t => t.Tag).ToArray()
            );
        }).ToArray();
    }
}

// --- Public Blog Post by Slug ---

[PublicAPI]
public sealed record GetPublicBlogPostBySlugQuery(string CategorySlug, string PostSlug) : IRequest<Result<PublicBlogPostResponse>>;

[PublicAPI]
public sealed record PublicBlogPostResponse(
    string Slug,
    string Title,
    string Content,
    string? Summary,
    string? FeaturedImageUrl,
    string? MetaTitle,
    string? MetaDescription,
    string CategorySlug,
    string CategoryTitle,
    DateTime? PublishedAt,
    DateTimeOffset CreatedAt,
    string[] Tags
);

public sealed class GetPublicBlogPostBySlugHandler(IBlogPostRepository blogPostRepository, IBlogCategoryRepository blogCategoryRepository)
    : IRequestHandler<GetPublicBlogPostBySlugQuery, Result<PublicBlogPostResponse>>
{
    public async Task<Result<PublicBlogPostResponse>> Handle(GetPublicBlogPostBySlugQuery query, CancellationToken cancellationToken)
    {
        var post = await blogPostRepository.GetBySlugAsync(query.PostSlug, cancellationToken);
        if (post is null || post.Status != BlogPostStatus.Published)
            return Result<PublicBlogPostResponse>.NotFound($"Blog post '{query.PostSlug}' not found.");

        var category = await blogCategoryRepository.GetBySlugAsync(query.CategorySlug, cancellationToken);

        return new PublicBlogPostResponse(
            post.Slug, post.Title, post.Content, post.Summary,
            post.FeaturedImageUrl, post.MetaTitle, post.MetaDescription,
            category?.Slug ?? "", category?.Title ?? "",
            post.PublishedAt, post.CreatedAt,
            post.Tags.Select(t => t.Tag).ToArray()
        );
    }
}

// --- Public Events ---

[PublicAPI]
public sealed record GetPublicEventsQuery : IRequest<Result<PublicEventResponse[]>>;

[PublicAPI]
public sealed record PublicEventResponse(
    string Slug,
    string Name,
    string Description,
    DateTime EventDate,
    string? Location,
    decimal TargetAmount,
    string? ImageUrl,
    EventStatus Status
);

public sealed class GetPublicEventsHandler(IFundraisingEventRepository eventRepository)
    : IRequestHandler<GetPublicEventsQuery, Result<PublicEventResponse[]>>
{
    public async Task<Result<PublicEventResponse[]>> Handle(GetPublicEventsQuery query, CancellationToken cancellationToken)
    {
        var events = await eventRepository.GetUpcomingAsync(cancellationToken);

        return events.Select(e => new PublicEventResponse(
            e.Slug, e.Name, e.Description, e.EventDate, e.Location,
            e.TargetAmount, e.ImageUrl, e.Status
        )).ToArray();
    }
}

// --- Public Event by Slug ---

[PublicAPI]
public sealed record GetPublicEventBySlugQuery(string Slug) : IRequest<Result<PublicEventDetailResponse>>;

[PublicAPI]
public sealed record PublicEventDetailResponse(
    string Id,
    string Slug,
    string Name,
    string Description,
    DateTime EventDate,
    string? Location,
    decimal TargetAmount,
    decimal RaisedAmount,
    string? ImageUrl,
    EventStatus Status,
    string? CampaignSlug
);

public sealed class GetPublicEventBySlugHandler(
    IFundraisingEventRepository eventRepository,
    ITransactionRepository transactionRepository,
    ICampaignRepository campaignRepository
) : IRequestHandler<GetPublicEventBySlugQuery, Result<PublicEventDetailResponse>>
{
    public async Task<Result<PublicEventDetailResponse>> Handle(GetPublicEventBySlugQuery query, CancellationToken cancellationToken)
    {
        var evt = await eventRepository.GetBySlugAsync(query.Slug, cancellationToken);
        if (evt is null)
            return Result<PublicEventDetailResponse>.NotFound($"Event '{query.Slug}' not found.");

        var raisedAmount = await transactionRepository.GetRaisedAmountAsync(
            FundraisingTargetType.Event, evt.Id.Value, cancellationToken);

        string? campaignSlug = null;
        if (evt.CampaignId is not null)
        {
            var campaign = await campaignRepository.GetByIdAsync(evt.CampaignId, cancellationToken);
            campaignSlug = campaign?.Slug;
        }

        return new PublicEventDetailResponse(
            evt.Id, evt.Slug, evt.Name, evt.Description, evt.EventDate, evt.Location,
            evt.TargetAmount, raisedAmount, evt.ImageUrl, evt.Status, campaignSlug
        );
    }
}

// --- Public Stories by Campaign Slug ---

[PublicAPI]
public sealed record GetPublicStoriesByCampaignSlugQuery(string CampaignSlug) : IRequest<Result<PublicStorySummaryResponse[]>>;

[PublicAPI]
public sealed record PublicStorySummaryResponse(
    string Id,
    string Slug,
    string Title,
    string? Summary,
    string? FeaturedImageUrl,
    decimal GoalAmount,
    decimal RaisedAmount,
    FundraisingStatus FundraisingStatus
);

public sealed class GetPublicStoriesByCampaignSlugHandler(
    ICampaignRepository campaignRepository,
    IStoryRepository storyRepository,
    ITransactionRepository transactionRepository
) : IRequestHandler<GetPublicStoriesByCampaignSlugQuery, Result<PublicStorySummaryResponse[]>>
{
    public async Task<Result<PublicStorySummaryResponse[]>> Handle(GetPublicStoriesByCampaignSlugQuery query, CancellationToken cancellationToken)
    {
        var campaign = await campaignRepository.GetBySlugAsync(query.CampaignSlug, cancellationToken);
        if (campaign is null || campaign.Status < CampaignStatus.Published || campaign.IsPrivate)
            return Result<PublicStorySummaryResponse[]>.NotFound($"Campaign '{query.CampaignSlug}' not found.");

        var stories = await storyRepository.GetByCampaignIdAsync(campaign.Id, cancellationToken);
        var publishedStories = stories.Where(s => s.FundraisingStatus >= FundraisingStatus.Raising && !s.IsPrivate).ToArray();

        if (publishedStories.Length == 0) return Array.Empty<PublicStorySummaryResponse>();

        var targetIds = publishedStories.Select(s => s.Id.Value).ToArray();
        var raisedAmounts = await transactionRepository.GetRaisedAmountsForTargetsAsync(
            FundraisingTargetType.Story, targetIds, cancellationToken);

        return publishedStories.Select(s => new PublicStorySummaryResponse(
            s.Id, s.Slug, s.Title, s.Summary, s.FeaturedImageUrl, s.GoalAmount,
            raisedAmounts.GetValueOrDefault(s.Id, 0), s.FundraisingStatus
        )).ToArray();
    }
}

// --- Public Story by Slug ---

[PublicAPI]
public sealed record GetPublicStoryBySlugQuery(string Slug) : IRequest<Result<PublicStoryDetailResponse>>;

[PublicAPI]
public sealed record PublicStoryDetailResponse(
    string Id,
    string Slug,
    string Title,
    string Content,
    string? Summary,
    string? FeaturedImageUrl,
    decimal GoalAmount,
    decimal RaisedAmount,
    FundraisingStatus FundraisingStatus,
    string? CampaignSlug,
    PublicStoryImageResponse[] Images,
    PublicStoryUpdateResponse[] Updates
);

[PublicAPI]
public sealed record PublicStoryImageResponse(Guid Id, string BlobUrl, string MimeType, long FileSizeBytes);

[PublicAPI]
public sealed record PublicStoryUpdateResponse(Guid Id, string Title, string Content, DateTime CreatedAt);

public sealed class GetPublicStoryBySlugHandler(
    IStoryRepository storyRepository,
    ITransactionRepository transactionRepository,
    ICampaignRepository campaignRepository
) : IRequestHandler<GetPublicStoryBySlugQuery, Result<PublicStoryDetailResponse>>
{
    public async Task<Result<PublicStoryDetailResponse>> Handle(GetPublicStoryBySlugQuery query, CancellationToken cancellationToken)
    {
        var story = await storyRepository.GetBySlugAsync(query.Slug, cancellationToken);
        if (story is null || story.FundraisingStatus < FundraisingStatus.Raising || story.IsPrivate)
            return Result<PublicStoryDetailResponse>.NotFound($"Story '{query.Slug}' not found.");

        var raisedAmount = await transactionRepository.GetRaisedAmountAsync(
            FundraisingTargetType.Story, story.Id.Value, cancellationToken);

        string? campaignSlug = null;
        if (story.CampaignId is not null)
        {
            var campaign = await campaignRepository.GetByIdAsync(story.CampaignId, cancellationToken);
            campaignSlug = campaign?.Slug;
        }

        return new PublicStoryDetailResponse(
            story.Id, story.Slug, story.Title, story.Content, story.Summary,
            story.FeaturedImageUrl, story.GoalAmount, raisedAmount, story.FundraisingStatus, campaignSlug,
            story.Images.Select(i => new PublicStoryImageResponse(i.Id, i.BlobUrl, i.MimeType, i.FileSizeBytes)).ToArray(),
            story.Updates.Select(u => new PublicStoryUpdateResponse(u.Id, u.Title, u.Content, u.CreatedAt)).ToArray()
        );
    }
}

// --- Public Branches ---

[PublicAPI]
public sealed record GetPublicBranchesQuery : IRequest<Result<BranchResponse[]>>;

public sealed class GetPublicBranchesHandler(IBranchRepository branchRepository)
    : IRequestHandler<GetPublicBranchesQuery, Result<BranchResponse[]>>
{
    public async Task<Result<BranchResponse[]>> Handle(GetPublicBranchesQuery query, CancellationToken cancellationToken)
    {
        var branches = await branchRepository.GetAllAsync(cancellationToken);

        return branches.Select(b => new BranchResponse(
            b.Id, b.Name, b.AddressLine1, b.AddressLine2, b.Area, b.Suburb,
            b.City, b.State, b.PostalCode, b.Country,
            b.Latitude, b.Longitude, b.GoogleMapsUrl, b.AppleMapsUrl,
            b.PhoneNumber, b.CreatedAt, b.ModifiedAt,
            b.Services.Select(s => new BranchServiceResponse(s.Id, s.Description)).ToArray()
        )).ToArray();
    }
}

