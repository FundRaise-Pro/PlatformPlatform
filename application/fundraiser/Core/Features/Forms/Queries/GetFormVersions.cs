using PlatformPlatform.Fundraiser.Features.Forms.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Forms.Queries;

[PublicAPI]
public sealed record GetFormVersionsQuery : IRequest<Result<FormVersionSummaryResponse[]>>;

[PublicAPI]
public sealed record FormVersionSummaryResponse(
    FormVersionId Id,
    string VersionNumber,
    string Name,
    string? Description,
    bool IsActive,
    DateTimeOffset CreatedAt
);

[PublicAPI]
public sealed record GetFormVersionQuery(FormVersionId Id) : IRequest<Result<FormVersionResponse>>;

[PublicAPI]
public sealed record FormVersionResponse(
    FormVersionId Id,
    string VersionNumber,
    string Name,
    string? Description,
    bool IsActive,
    DateTimeOffset CreatedAt,
    FormSectionResponse[] Sections
);

[PublicAPI]
public sealed record FormSectionResponse(
    Guid Id,
    string Name,
    string Title,
    string? Description,
    int DisplayOrder,
    string? Icon,
    FormFieldResponse[] Fields,
    FormFlagResponse[] Flags
);

[PublicAPI]
public sealed record FormFieldResponse(
    Guid Id, string Name, string Label, FormFieldType FieldType,
    string DefaultValue, int DisplayOrder, bool IsRequired,
    string? Placeholder, decimal? MinValue, decimal? MaxValue
);

[PublicAPI]
public sealed record FormFlagResponse(
    Guid Id, string Name, string Question, int DisplayOrder, bool IsRequired, string? HelpText
);

public sealed class GetFormVersionsHandler(IFormVersionRepository formVersionRepository)
    : IRequestHandler<GetFormVersionsQuery, Result<FormVersionSummaryResponse[]>>
{
    public async Task<Result<FormVersionSummaryResponse[]>> Handle(GetFormVersionsQuery query, CancellationToken cancellationToken)
    {
        var versions = await formVersionRepository.GetAllAsync(cancellationToken);
        return versions.Select(v => new FormVersionSummaryResponse(
            v.Id, v.VersionNumber, v.Name, v.Description, v.IsActive, v.CreatedAt
        )).ToArray();
    }
}

public sealed class GetFormVersionHandler(IFormVersionRepository formVersionRepository)
    : IRequestHandler<GetFormVersionQuery, Result<FormVersionResponse>>
{
    public async Task<Result<FormVersionResponse>> Handle(GetFormVersionQuery query, CancellationToken cancellationToken)
    {
        var version = await formVersionRepository.GetByIdAsync(query.Id, cancellationToken);
        if (version is null) return Result<FormVersionResponse>.NotFound($"Form version with id '{query.Id}' not found.");

        return new FormVersionResponse(
            version.Id, version.VersionNumber, version.Name, version.Description,
            version.IsActive, version.CreatedAt,
            version.Sections.OrderBy(s => s.DisplayOrder).Select(s => new FormSectionResponse(
                s.Id, s.Name, s.Title, s.Description, s.DisplayOrder, s.Icon,
                s.Fields.OrderBy(f => f.DisplayOrder).Select(f => new FormFieldResponse(
                    f.Id, f.Name, f.Label, f.FieldType, f.DefaultValue,
                    f.DisplayOrder, f.IsRequired, f.Placeholder, f.MinValue, f.MaxValue
                )).ToArray(),
                s.Flags.OrderBy(f => f.DisplayOrder).Select(f => new FormFlagResponse(
                    f.Id, f.Name, f.Question, f.DisplayOrder, f.IsRequired, f.HelpText
                )).ToArray()
            )).ToArray()
        );
    }
}
