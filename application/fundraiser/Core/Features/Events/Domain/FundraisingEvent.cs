using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.StronglyTypedIds;

namespace PlatformPlatform.Fundraiser.Features.Events.Domain;

[IdPrefix("evt")]
public sealed record FundraisingEventId(string Value) : StronglyTypedUlid<FundraisingEventId>(Value);

/// <summary>
///     A FundraisingEvent represents a planned fundraising activity by the tenant organization,
///     with fundraising targets, location, and status tracking.
/// </summary>
public sealed class FundraisingEvent : AggregateRoot<FundraisingEventId>, ITenantScopedEntity
{
    private FundraisingEvent(FundraisingEventId id, TenantId tenantId, string name, string description, DateTime eventDate) : base(id)
    {
        TenantId = tenantId;
        Name = name;
        Description = description;
        EventDate = eventDate;
    }

    public TenantId TenantId { get; private init; }

    public string Name { get; private set; } = string.Empty;

    public string Description { get; private set; } = string.Empty;

    public DateTime EventDate { get; private set; }

    public string? Location { get; private set; }

    public decimal TargetAmount { get; private set; }

    public decimal RaisedAmount { get; private set; }

    public EventStatus Status { get; private set; } = EventStatus.Planned;

    public string? ImageUrl { get; private set; }

    public static FundraisingEvent Create(TenantId tenantId, string name, string description, DateTime eventDate,
        string? location = null, decimal targetAmount = 0)
    {
        return new FundraisingEvent(FundraisingEventId.NewId(), tenantId, name, description, eventDate)
        {
            Location = location,
            TargetAmount = targetAmount
        };
    }

    public void Update(string name, string description, DateTime eventDate, string? location = null)
    {
        Name = name;
        Description = description;
        EventDate = eventDate;
        Location = location;
    }

    public void SetTarget(decimal targetAmount)
    {
        TargetAmount = targetAmount;
    }

    public void RecordContribution(decimal amount)
    {
        RaisedAmount += amount;
    }

    public void Start()
    {
        Status = EventStatus.InProgress;
    }

    public void Complete()
    {
        Status = EventStatus.Completed;
    }

    public void Cancel()
    {
        Status = EventStatus.Cancelled;
    }

    public void SetImage(string imageUrl)
    {
        ImageUrl = imageUrl;
    }
}

public enum EventStatus
{
    Planned = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3
}
