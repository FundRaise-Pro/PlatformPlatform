using PlatformPlatform.Fundraiser.Features.Branches.Domain;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.StronglyTypedIds;

namespace PlatformPlatform.Fundraiser.Features.Users.Domain;

[IdPrefix("tuser")]
[JsonConverter(typeof(StronglyTypedIdJsonConverter<string, TenantUserId>))]
public sealed record TenantUserId(string Value) : StronglyTypedUlid<TenantUserId>(Value);

/// <summary>
///     Represents a tenant-scoped projection of a PlatformPlatform user into the fundraiser SCS.
///     Links an account-management UserId to fundraiser-specific roles, branch assignments, and permissions.
///     Org admins/staff get TenantUser records; lightweight donors/applicants get EndUser records instead.
/// </summary>
public sealed class TenantUser : AggregateRoot<TenantUserId>, ITenantScopedEntity
{
    private TenantUser(TenantUserId id, TenantId tenantId, UserId userId, string displayName)
        : base(id)
    {
        TenantId = tenantId;
        UserId = userId;
        DisplayName = displayName;
    }

    public TenantId TenantId { get; private init; }

    /// <summary>References the User in account-management's Users table via SharedKernel UserId.</summary>
    public UserId UserId { get; private init; }

    public string DisplayName { get; private set; } = string.Empty;
    public BranchId? PrimaryBranchId { get; private set; }
    public bool IsActive { get; private set; } = true;

    private readonly List<RoleAssignment> _roleAssignments = [];
    public IReadOnlyCollection<RoleAssignment> RoleAssignments => _roleAssignments.AsReadOnly();

    public static TenantUser Create(TenantId tenantId, UserId userId, string displayName)
    {
        return new TenantUser(TenantUserId.NewId(), tenantId, userId, displayName);
    }

    public void UpdateDisplayName(string displayName)
    {
        DisplayName = displayName;
    }

    public void AssignRole(FundraiserRole role, BranchId? scopedBranchId = null)
    {
        var existing = _roleAssignments.FirstOrDefault(r => r.Role == role && r.ScopedBranchId == scopedBranchId);
        if (existing is not null) return; // Idempotent

        _roleAssignments.Add(new RoleAssignment(role, scopedBranchId));
    }

    public void RevokeRole(FundraiserRole role, BranchId? scopedBranchId = null)
    {
        var existing = _roleAssignments.FirstOrDefault(r => r.Role == role && r.ScopedBranchId == scopedBranchId);
        if (existing is not null) _roleAssignments.Remove(existing);
    }

    public bool HasRole(FundraiserRole role, BranchId? branchId = null)
    {
        return _roleAssignments.Any(r =>
            r.Role == role && (r.ScopedBranchId is null || r.ScopedBranchId == branchId));
    }

    public void SetPrimaryBranch(BranchId? branchId)
    {
        PrimaryBranchId = branchId;
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    public void Activate()
    {
        IsActive = true;
    }
}

/// <summary>
///     Fundraiser-specific roles that extend the platform-level roles (Member, Admin, Owner).
///     These roles are scoped to the fundraiser SCS and can optionally be scoped to a specific Branch.
/// </summary>
[PublicAPI]
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum FundraiserRole
{
    /// <summary>Can manage fundraising applications: view, assign reviewers, set status.</summary>
    ApplicationManager,

    /// <summary>Can review applications and provide assessments.</summary>
    ApplicationReviewer,

    /// <summary>Can give final approval/rejection on applications.</summary>
    ApplicationApprover,

    /// <summary>Can create and edit blog posts and categories.</summary>
    BlogEditor,

    /// <summary>Can manage payment configurations, view transactions, process refunds.</summary>
    PaymentManager,

    /// <summary>Can access analytics dashboards and export reports.</summary>
    DataAnalyst,

    /// <summary>Can manage a specific branch: staff, services, settings.</summary>
    BranchManager
}

/// <summary>
///     A role assignment links a FundraiserRole to a TenantUser, optionally scoped to a specific branch.
///     When ScopedBranchId is null, the role applies tenant-wide.
/// </summary>
public sealed class RoleAssignment
{
    public int Id { get; private init; }
    public FundraiserRole Role { get; private set; }
    public BranchId? ScopedBranchId { get; private set; }
    public DateTimeOffset AssignedAt { get; private set; }

    internal RoleAssignment(FundraiserRole role, BranchId? scopedBranchId)
    {
        Role = role;
        ScopedBranchId = scopedBranchId;
        AssignedAt = TimeProvider.System.GetUtcNow();
    }

    private RoleAssignment() { } // EF Core
}
