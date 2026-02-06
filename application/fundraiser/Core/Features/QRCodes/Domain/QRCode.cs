using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.StronglyTypedIds;

namespace PlatformPlatform.Fundraiser.Features.QRCodes.Domain;

[IdPrefix("qr")]
public sealed record QRCodeId(string Value) : StronglyTypedUlid<QRCodeId>;

/// <summary>
///     A QRCode allows tenants to create trackable QR codes linking to campaigns, events, or donation pages.
///     Includes hit tracking and analytics.
/// </summary>
public sealed class QRCode : AggregateRoot<QRCodeId>, ITenantScopedEntity
{
    private QRCode(QRCodeId id, TenantId tenantId, string name, string redirectUrl, QRCodeType qrCodeType) : base(id)
    {
        TenantId = tenantId;
        Name = name;
        RedirectUrl = redirectUrl;
        QRCodeType = qrCodeType;
    }

    public TenantId TenantId { get; private init; }

    public string Name { get; private set; } = string.Empty;

    public string RedirectUrl { get; private set; } = string.Empty;

    public bool IsActive { get; private set; } = true;

    public QRCodeType QRCodeType { get; private set; }

    public int HitCount { get; private set; }

    public string? QRCodeImageUrl { get; private set; }

    private readonly List<QRCodeHit> _hits = [];
    public IReadOnlyCollection<QRCodeHit> Hits => _hits.AsReadOnly();

    public static QRCode Create(TenantId tenantId, string name, string redirectUrl, QRCodeType qrCodeType)
    {
        return new QRCode(QRCodeId.NewId(), tenantId, name, redirectUrl, qrCodeType);
    }

    public void RecordHit(string? userAgent = null, string? referrer = null, string? ipAddress = null)
    {
        HitCount++;
        _hits.Add(new QRCodeHit(userAgent, referrer, ipAddress));
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    public void SetImage(string imageUrl)
    {
        QRCodeImageUrl = imageUrl;
    }
}

public enum QRCodeType
{
    Clinic = 0,
    Event = 1,
    Campaign = 2,
    DonationPage = 3
}

public sealed class QRCodeHit
{
    public Guid Id { get; private init; } = Guid.NewGuid();
    public DateTime HitAt { get; private init; } = DateTime.UtcNow;
    public string? UserAgent { get; private set; }
    public string? Referrer { get; private set; }
    public string? IpAddress { get; private set; }

    internal QRCodeHit(string? userAgent, string? referrer, string? ipAddress)
    {
        UserAgent = userAgent;
        Referrer = referrer;
        IpAddress = ipAddress;
    }

    private QRCodeHit() { } // EF Core
}
