using PlatformPlatform.Fundraiser.Features.Branches.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Branches.Queries;

[PublicAPI]
public sealed record GetBranchesQuery : IRequest<Result<BranchSummaryResponse[]>>;

[PublicAPI]
public sealed record BranchSummaryResponse(
    BranchId Id, string Name, string City, string State, string PostalCode,
    double? Latitude, double? Longitude, int ServiceCount, DateTimeOffset CreatedAt
);

[PublicAPI]
public sealed record GetBranchQuery(BranchId Id) : IRequest<Result<BranchResponse>>;

[PublicAPI]
public sealed record BranchResponse(
    BranchId Id, string Name, string AddressLine1, string? AddressLine2, string? Area, string? Suburb,
    string City, string State, string PostalCode, string? Country,
    double? Latitude, double? Longitude, string? GoogleMapsUrl, string? AppleMapsUrl,
    string? PhoneNumber, DateTimeOffset CreatedAt, DateTimeOffset? ModifiedAt,
    BranchServiceResponse[] Services
);

[PublicAPI]
public sealed record BranchServiceResponse(int Id, string? Description);

public sealed class GetBranchesHandler(IBranchRepository branchRepository)
    : IRequestHandler<GetBranchesQuery, Result<BranchSummaryResponse[]>>
{
    public async Task<Result<BranchSummaryResponse[]>> Handle(GetBranchesQuery query, CancellationToken cancellationToken)
    {
        var branches = await branchRepository.GetAllAsync(cancellationToken);

        return branches.Select(b => new BranchSummaryResponse(
            b.Id, b.Name, b.City, b.State, b.PostalCode, b.Latitude, b.Longitude,
            b.Services.Count, b.CreatedAt
        )).ToArray();
    }
}

public sealed class GetBranchHandler(IBranchRepository branchRepository)
    : IRequestHandler<GetBranchQuery, Result<BranchResponse>>
{
    public async Task<Result<BranchResponse>> Handle(GetBranchQuery query, CancellationToken cancellationToken)
    {
        var b = await branchRepository.GetByIdAsync(query.Id, cancellationToken);
        if (b is null) return Result<BranchResponse>.NotFound($"Branch with id '{query.Id}' not found.");

        return new BranchResponse(
            b.Id, b.Name, b.AddressLine1, b.AddressLine2, b.Area, b.Suburb,
            b.City, b.State, b.PostalCode, b.Country,
            b.Latitude, b.Longitude, b.GoogleMapsUrl, b.AppleMapsUrl,
            b.PhoneNumber, b.CreatedAt, b.ModifiedAt,
            b.Services.Select(s => new BranchServiceResponse(s.Id, s.Description)).ToArray()
        );
    }
}
