using System.Collections.Immutable;
using PlatformPlatform.Fundraiser.Features.Forms.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Forms.Queries;

[PublicAPI]
public sealed record GetFormTemplatesQuery(string? Category = null) : IRequest<Result<FormTemplateSummaryResponse[]>>;

[PublicAPI]
public sealed record FormTemplateSummaryResponse(
    FormTemplateId Id,
    string Name,
    string Category,
    string? Description,
    bool IsSystemTemplate,
    int CloneCount,
    string? PreviewImageUrl,
    DateTimeOffset CreatedAt
);

public sealed class GetFormTemplatesHandler(IFormTemplateRepository formTemplateRepository)
    : IRequestHandler<GetFormTemplatesQuery, Result<FormTemplateSummaryResponse[]>>
{
    public async Task<Result<FormTemplateSummaryResponse[]>> Handle(GetFormTemplatesQuery query, CancellationToken cancellationToken)
    {
        var templates = string.IsNullOrEmpty(query.Category)
            ? await formTemplateRepository.GetPublishedAsync(cancellationToken)
            : await formTemplateRepository.GetByCategoryAsync(query.Category, cancellationToken);

        var response = templates.Select(t => new FormTemplateSummaryResponse(
            t.Id,
            t.Name,
            t.Category,
            t.Description,
            t.IsSystemTemplate,
            t.CloneCount,
            t.PreviewImageUrl,
            t.CreatedAt
        )).ToArray();

        return response;
    }
}
