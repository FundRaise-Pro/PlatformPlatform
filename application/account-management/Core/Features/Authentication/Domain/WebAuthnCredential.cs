using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.StronglyTypedIds;

namespace PlatformPlatform.AccountManagement.Features.Authentication.Domain;

[IdPrefix("wac")]
[JsonConverter(typeof(StronglyTypedIdJsonConverter<string, WebAuthnCredentialId>))]
public sealed record WebAuthnCredentialId(string Value) : StronglyTypedUlid<WebAuthnCredentialId>(Value);

/// <summary>
///     Stores a registered FIDO2/WebAuthn credential for a user.
///     WebAuthn provides passwordless authentication as an alternative to OTP email login.
///     After successful WebAuthn verification, the same CreateAndSetAuthenticationTokens flow is used.
/// </summary>
public sealed class WebAuthnCredential : AggregateRoot<WebAuthnCredentialId>, ITenantScopedEntity
{
    private WebAuthnCredential(
        WebAuthnCredentialId id, TenantId tenantId, UserId userId,
        byte[] credentialId, byte[] publicKey, uint signCount, string friendlyName)
        : base(id)
    {
        TenantId = tenantId;
        UserId = userId;
        CredentialId = credentialId;
        PublicKey = publicKey;
        SignCount = signCount;
        FriendlyName = friendlyName;
    }

    public TenantId TenantId { get; private init; }
    public UserId UserId { get; private init; }

    /// <summary>The credential ID from the authenticator. Used to look up the credential during authentication.</summary>
    public byte[] CredentialId { get; private init; }

    /// <summary>The COSE public key from the authenticator, used to verify assertion signatures.</summary>
    public byte[] PublicKey { get; private init; }

    /// <summary>Monotonically increasing counter from the authenticator. Detects cloned authenticators.</summary>
    public uint SignCount { get; private set; }

    /// <summary>User-friendly name for the credential (e.g., "MacBook Touch ID", "YubiKey 5").</summary>
    public string FriendlyName { get; private set; } = string.Empty;

    /// <summary>The AAGUID of the authenticator (identifies the authenticator model).</summary>
    public Guid? AaGuid { get; private set; }

    /// <summary>The attestation type used during registration.</summary>
    public string? AttestationType { get; private set; }

    /// <summary>Supported transports for this credential (usb, nfc, ble, internal).</summary>
    public string? Transports { get; private set; }

    /// <summary>Whether this credential is currently active and can be used for authentication.</summary>
    public bool IsActive { get; private set; } = true;

    /// <summary>Last time this credential was used for authentication.</summary>
    public DateTimeOffset? LastUsedAt { get; private set; }

    /// <summary>The user handle (opaque byte sequence) used during attestation.</summary>
    public byte[] UserHandle { get; private set; } = [];

    public static WebAuthnCredential Create(
        TenantId tenantId, UserId userId,
        byte[] credentialId, byte[] publicKey, uint signCount, string friendlyName,
        byte[] userHandle, Guid? aaGuid = null, string? attestationType = null, string? transports = null)
    {
        return new WebAuthnCredential(WebAuthnCredentialId.NewId(), tenantId, userId,
            credentialId, publicKey, signCount, friendlyName)
        {
            UserHandle = userHandle,
            AaGuid = aaGuid,
            AttestationType = attestationType,
            Transports = transports
        };
    }

    /// <summary>
    ///     Updates the sign count after successful authentication.
    ///     The new count must be greater than the stored count to prevent cloned authenticator attacks.
    /// </summary>
    public bool UpdateSignCount(uint newSignCount)
    {
        if (newSignCount <= SignCount) return false; // Possible cloned authenticator
        SignCount = newSignCount;
        LastUsedAt = TimeProvider.System.GetUtcNow();
        return true;
    }

    public void Rename(string friendlyName)
    {
        FriendlyName = friendlyName;
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
