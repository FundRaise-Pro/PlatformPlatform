using PlatformPlatform.Fundraiser.Features.Users.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Users.Queries;

[PublicAPI]
public sealed record GetTenantUsersQuery : IRequest<Result<TenantUserResponse[]>>;

[PublicAPI]
public sealed record TenantUserResponse(
    TenantUserId Id,
    string UserId,
    string DisplayName,
    string? PrimaryBranchId,
    bool IsActive,
    RoleAssignmentResponse[] Roles,
    DateTimeOffset CreatedAt
);

[PublicAPI]
public sealed record RoleAssignmentResponse(
    FundraiserRole Role,
    string? ScopedBranchId,
    DateTimeOffset AssignedAt
);

public sealed class GetTenantUsersHandler(
    ITenantUserRepository tenantUserRepository
) : IRequestHandler<GetTenantUsersQuery, Result<TenantUserResponse[]>>
{
    public async Task<Result<TenantUserResponse[]>> Handle(GetTenantUsersQuery query, CancellationToken cancellationToken)
    {
        var tenantUsers = await tenantUserRepository.GetAllAsync(cancellationToken);

        var responses = tenantUsers.Select(t => new TenantUserResponse(
            t.Id,
            t.UserId.ToString(),
            t.DisplayName,
            t.PrimaryBranchId?.ToString(),
            t.IsActive,
            t.RoleAssignments.Select(r => new RoleAssignmentResponse(
                r.Role, r.ScopedBranchId?.ToString(), r.AssignedAt
            )).ToArray(),
            t.CreatedAt
        )).ToArray();

        return responses;
    }
}
