using PlatformPlatform.Fundraiser.Features.Branches.Domain;
using PlatformPlatform.Fundraiser.Features.Users.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Users.Commands;

[PublicAPI]
public sealed record AssignFundraiserRoleCommand(TenantUserId TenantUserId, FundraiserRole Role, string? ScopedBranchId = null)
    : ICommand, IRequest<Result>;

public sealed class AssignFundraiserRoleHandler(
    ITenantUserRepository tenantUserRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<AssignFundraiserRoleCommand, Result>
{
    public async Task<Result> Handle(AssignFundraiserRoleCommand command, CancellationToken cancellationToken)
    {
        var tenantUser = await tenantUserRepository.GetByIdAsync(command.TenantUserId, cancellationToken);
        if (tenantUser is null)
            return Result.NotFound($"TenantUser with ID '{command.TenantUserId}' not found.");

        var scopedBranchId = command.ScopedBranchId is not null ? new BranchId(command.ScopedBranchId) : null;
        tenantUser.AssignRole(command.Role, scopedBranchId);
        tenantUserRepository.Update(tenantUser);

        events.CollectEvent(new FundraiserRoleAssigned(tenantUser.Id, command.Role));

        return Result.Success();
    }
}
