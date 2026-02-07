using PlatformPlatform.Fundraiser.Features.Branches.Domain;
using PlatformPlatform.Fundraiser.Features.Users.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Users.Commands;

[PublicAPI]
public sealed record AssignTenantUserToBranchCommand : ICommand, IRequest<Result>
{
    [JsonIgnore]
    public TenantUserId Id { get; init; } = null!;

    public required string? BranchId { get; init; }
}

public sealed class AssignTenantUserToBranchHandler(
    ITenantUserRepository tenantUserRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<AssignTenantUserToBranchCommand, Result>
{
    public async Task<Result> Handle(AssignTenantUserToBranchCommand command, CancellationToken cancellationToken)
    {
        var tenantUser = await tenantUserRepository.GetByIdAsync(command.Id, cancellationToken);
        if (tenantUser is null)
            return Result.NotFound($"TenantUser with ID '{command.Id}' not found.");

        var branchId = command.BranchId is not null ? new BranchId(command.BranchId) : null;
        tenantUser.SetPrimaryBranch(branchId);
        tenantUserRepository.Update(tenantUser);

        events.CollectEvent(new TenantUserBranchAssigned(tenantUser.Id));

        return Result.Success();
    }
}
