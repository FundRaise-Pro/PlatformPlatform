using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.StronglyTypedIds;

namespace PlatformPlatform.Fundraiser.Features.Branches.Domain;

[IdPrefix("brn")]
public sealed record BranchId(string Value) : StronglyTypedUlid<BranchId>(Value);

/// <summary>
///     A Branch represents a physical office or service location for the tenant organization.
///     Branches can offer services and have assigned staff.
/// </summary>
public sealed class Branch : AggregateRoot<BranchId>, ITenantScopedEntity
{
    private Branch(BranchId id, TenantId tenantId, string name) : base(id)
    {
        TenantId = tenantId;
        Name = name;
    }

    public TenantId TenantId { get; private init; }

    public string Name { get; private set; } = string.Empty;

    // Address
    public string AddressLine1 { get; private set; } = string.Empty;

    public string? AddressLine2 { get; private set; }

    public string? Area { get; private set; }

    public string? Suburb { get; private set; }

    public string City { get; private set; } = string.Empty;

    public string State { get; private set; } = string.Empty;

    public string PostalCode { get; private set; } = string.Empty;

    public string? Country { get; private set; }

    // Geolocation
    public double? Latitude { get; private set; }

    public double? Longitude { get; private set; }

    public string? GoogleMapsUrl { get; private set; }

    public string? AppleMapsUrl { get; private set; }

    // Contact
    public string? PhoneNumber { get; private set; }

    private readonly List<BranchService> _services = [];
    public IReadOnlyCollection<BranchService> Services => _services.AsReadOnly();

    public static Branch Create(TenantId tenantId, string name, string addressLine1, string city, string state, string postalCode)
    {
        return new Branch(BranchId.NewId(), tenantId, name)
        {
            AddressLine1 = addressLine1,
            City = city,
            State = state,
            PostalCode = postalCode
        };
    }

    public void UpdateAddress(string addressLine1, string? addressLine2, string? suburb, string city, string state, string postalCode)
    {
        AddressLine1 = addressLine1;
        AddressLine2 = addressLine2;
        Suburb = suburb;
        City = city;
        State = state;
        PostalCode = postalCode;
    }

    public void SetGeolocation(double latitude, double longitude, string? googleMapsUrl = null, string? appleMapsUrl = null)
    {
        Latitude = latitude;
        Longitude = longitude;
        GoogleMapsUrl = googleMapsUrl;
        AppleMapsUrl = appleMapsUrl;
    }

    public void AddService(string description)
    {
        _services.Add(new BranchService(description));
    }
}

public sealed class BranchService
{
    public int Id { get; private init; }

    public string? Description { get; private set; }

    internal BranchService(string? description)
    {
        Description = description;
    }

    private BranchService() { } // EF Core
}
