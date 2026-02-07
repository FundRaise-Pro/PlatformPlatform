using PlatformPlatform.Fundraiser.Features.EndUsers.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.EndUsers.Queries;

[PublicAPI]
public sealed record GetEndUserQuery(EndUserId Id) : IRequest<Result<EndUserDetailResponse>>;

[PublicAPI]
public sealed record EndUserDetailResponse(
    EndUserId Id,
    EndUserType Type,
    string? Email,
    string? PhoneNumber,
    string? FirstName,
    string? LastName,
    bool IsVerified,
    bool IsAnonymous,
    string? SocialProvider,
    string? ExternalId,
    string? DonorProfileId,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ModifiedAt,
    DateTimeOffset? LastActiveAt
);

public sealed class GetEndUserHandler(
    IEndUserRepository endUserRepository
) : IRequestHandler<GetEndUserQuery, Result<EndUserDetailResponse>>
{
    public async Task<Result<EndUserDetailResponse>> Handle(GetEndUserQuery query, CancellationToken cancellationToken)
    {
        var endUser = await endUserRepository.GetByIdAsync(query.Id, cancellationToken);
        if (endUser is null)
            return Result<EndUserDetailResponse>.NotFound($"EndUser with ID '{query.Id}' not found.");

        var response = new EndUserDetailResponse(
            endUser.Id, endUser.Type, endUser.Email, endUser.PhoneNumber,
            endUser.FirstName, endUser.LastName, endUser.IsVerified, endUser.IsAnonymous,
            endUser.SocialProvider, endUser.ExternalId, endUser.DonorProfileId?.ToString(),
            endUser.CreatedAt, endUser.ModifiedAt, endUser.LastActiveAt
        );

        return response;
    }
}
