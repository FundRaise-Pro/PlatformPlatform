using System.Collections.Immutable;
using PlatformPlatform.Fundraiser.Features.Forms.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Forms.Queries;

[PublicAPI]
public sealed record GetFormTemplateQuery(FormTemplateId Id) : IRequest<Result<FormTemplateDetailResponse>>;

[PublicAPI]
public sealed record FormTemplateDetailResponse(
    FormTemplateId Id,
    string Name,
    string Category,
    string? Description,
    bool IsSystemTemplate,
    bool IsPublished,
    int CloneCount,
    string? PreviewImageUrl,
    ImmutableArray<FormTemplateSection> Sections,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ModifiedAt
);

public sealed class GetFormTemplateHandler(IFormTemplateRepository formTemplateRepository)
    : IRequestHandler<GetFormTemplateQuery, Result<FormTemplateDetailResponse>>
{
    public async Task<Result<FormTemplateDetailResponse>> Handle(GetFormTemplateQuery query, CancellationToken cancellationToken)
    {
        var template = await formTemplateRepository.GetByIdAsync(query.Id, cancellationToken);
        if (template is null)
            return Result<FormTemplateDetailResponse>.NotFound($"Form template '{query.Id}' not found.");

        var response = new FormTemplateDetailResponse(
            template.Id,
            template.Name,
            template.Category,
            template.Description,
            template.IsSystemTemplate,
            template.IsPublished,
            template.CloneCount,
            template.PreviewImageUrl,
            template.Sections,
            template.CreatedAt,
            template.ModifiedAt
        );

        return response;
    }
}
