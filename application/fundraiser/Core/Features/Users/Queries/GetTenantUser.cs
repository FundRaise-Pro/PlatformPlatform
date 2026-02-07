using PlatformPlatform.Fundraiser.Features.Users.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.Users.Queries;

[PublicAPI]
public sealed record GetTenantUserQuery(TenantUserId Id) : IRequest<Result<TenantUserDetailResponse>>;

[PublicAPI]
public sealed record TenantUserDetailResponse(
    TenantUserId Id,
    string UserId,
    string DisplayName,
    string? PrimaryBranchId,
    bool IsActive,
    RoleAssignmentResponse[] Roles,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ModifiedAt
);

public sealed class GetTenantUserHandler(
    ITenantUserRepository tenantUserRepository
) : IRequestHandler<GetTenantUserQuery, Result<TenantUserDetailResponse>>
{
    public async Task<Result<TenantUserDetailResponse>> Handle(GetTenantUserQuery query, CancellationToken cancellationToken)
    {
        var tenantUser = await tenantUserRepository.GetByIdAsync(query.Id, cancellationToken);
        if (tenantUser is null)
            return Result<TenantUserDetailResponse>.NotFound($"TenantUser with ID '{query.Id}' not found.");

        var response = new TenantUserDetailResponse(
            tenantUser.Id,
            tenantUser.UserId.ToString(),
            tenantUser.DisplayName,
            tenantUser.PrimaryBranchId?.ToString(),
            tenantUser.IsActive,
            tenantUser.RoleAssignments.Select(r => new RoleAssignmentResponse(
                r.Role, r.ScopedBranchId?.ToString(), r.AssignedAt
            )).ToArray(),
            tenantUser.CreatedAt,
            tenantUser.ModifiedAt
        );

        return response;
    }
}
