using PlatformPlatform.Fundraiser.Features.EndUsers.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.EndUsers.Queries;

[PublicAPI]
public sealed record GetEndUsersQuery(EndUserType? Type = null) : IRequest<Result<EndUserSummaryResponse[]>>;

[PublicAPI]
public sealed record EndUserSummaryResponse(
    EndUserId Id,
    EndUserType Type,
    string? Email,
    string? PhoneNumber,
    string? FirstName,
    string? LastName,
    bool IsVerified,
    bool IsAnonymous,
    string? SocialProvider,
    DateTimeOffset CreatedAt,
    DateTimeOffset? LastActiveAt
);

public sealed class GetEndUsersHandler(
    IEndUserRepository endUserRepository
) : IRequestHandler<GetEndUsersQuery, Result<EndUserSummaryResponse[]>>
{
    public async Task<Result<EndUserSummaryResponse[]>> Handle(GetEndUsersQuery query, CancellationToken cancellationToken)
    {
        var endUsers = query.Type.HasValue
            ? await endUserRepository.GetByTypeAsync(query.Type.Value, cancellationToken)
            : await endUserRepository.GetAllAsync(cancellationToken);

        var responses = endUsers.Select(e => new EndUserSummaryResponse(
            e.Id, e.Type, e.Email, e.PhoneNumber, e.FirstName, e.LastName,
            e.IsVerified, e.IsAnonymous, e.SocialProvider, e.CreatedAt, e.LastActiveAt
        )).ToArray();

        return responses;
    }
}
