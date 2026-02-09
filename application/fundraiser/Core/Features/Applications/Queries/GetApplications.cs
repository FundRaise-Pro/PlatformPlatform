using PlatformPlatform.Fundraiser.Features.Applications.Domain;
using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Applications.Queries;

[PublicAPI]
public sealed record GetApplicationsQuery : IRequest<Result<ApplicationSummaryResponse[]>>;

[PublicAPI]
public sealed record ApplicationSummaryResponse(
    FundraisingApplicationId Id,
    CampaignId CampaignId,
    ApplicationStatus Status,
    int Priority,
    DateTime? SubmittedAt,
    int ReviewsCompletedCount,
    DateTimeOffset CreatedAt
);

[PublicAPI]
public sealed record GetApplicationQuery(FundraisingApplicationId Id) : IRequest<Result<ApplicationResponse>>;

[PublicAPI]
public sealed record ApplicationResponse(
    FundraisingApplicationId Id,
    CampaignId CampaignId,
    ApplicationStatus Status,
    bool IsMutable,
    int Priority,
    string? InternalNotes,
    string? ReviewNotes,
    DateTime? SubmittedAt,
    DateTime? ReviewedAt,
    int ReviewsCompletedCount,
    int ReviewsPendingCount,
    bool RequiresEscalation,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ModifiedAt,
    ApplicationFieldDataResponse[] FieldData,
    ApplicationReviewResponse[] Reviews
);

[PublicAPI]
public sealed record ApplicationFieldDataResponse(Guid Id, string FieldName, string? FieldValue, string? FieldType);

[PublicAPI]
public sealed record ApplicationReviewResponse(
    Guid Id, ReviewStage Stage, string ReviewType, ReviewDecision Decision,
    string Notes, int PriorityScore, DateTime ReviewedAt
);

public sealed class GetApplicationsHandler(IFundraisingApplicationRepository applicationRepository)
    : IRequestHandler<GetApplicationsQuery, Result<ApplicationSummaryResponse[]>>
{
    public async Task<Result<ApplicationSummaryResponse[]>> Handle(GetApplicationsQuery query, CancellationToken cancellationToken)
    {
        var applications = await applicationRepository.GetAllAsync(cancellationToken);

        return applications.Select(a => new ApplicationSummaryResponse(
            a.Id, a.CampaignId, a.Status, a.Priority, a.SubmittedAt, a.ReviewsCompletedCount, a.CreatedAt
        )).ToArray();
    }
}

public sealed class GetApplicationHandler(IFundraisingApplicationRepository applicationRepository)
    : IRequestHandler<GetApplicationQuery, Result<ApplicationResponse>>
{
    public async Task<Result<ApplicationResponse>> Handle(GetApplicationQuery query, CancellationToken cancellationToken)
    {
        var app = await applicationRepository.GetByIdAsync(query.Id, cancellationToken);
        if (app is null) return Result<ApplicationResponse>.NotFound($"Application with id '{query.Id}' not found.");

        return new ApplicationResponse(
            app.Id, app.CampaignId, app.Status, app.IsMutable, app.Priority,
            app.InternalNotes, app.ReviewNotes, app.SubmittedAt, app.ReviewedAt,
            app.ReviewsCompletedCount, app.ReviewsPendingCount, app.RequiresEscalation,
            app.CreatedAt, app.ModifiedAt,
            app.FieldData.Select(f => new ApplicationFieldDataResponse(f.Id, f.FieldName, f.FieldValue, f.FieldType)).ToArray(),
            app.Reviews.Select(r => new ApplicationReviewResponse(
                r.Id, r.Stage, r.ReviewType, r.Decision, r.Notes, r.PriorityScore, r.ReviewedAt
            )).ToArray()
        );
    }
}
