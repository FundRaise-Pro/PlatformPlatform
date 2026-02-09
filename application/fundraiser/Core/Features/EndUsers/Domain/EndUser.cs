using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.StronglyTypedIds;

namespace PlatformPlatform.Fundraiser.Features.EndUsers.Domain;

[IdPrefix("euser")]
[JsonConverter(typeof(StronglyTypedIdJsonConverter<string, EndUserId>))]
public sealed record EndUserId(string Value) : StronglyTypedUlid<EndUserId>(Value);

/// <summary>
///     Lightweight user record for donors, applicants, and beneficiaries.
///     These users live entirely within the fundraiser SCS (not in account-management's Users table).
///     Auth is lighter: optional accounts, phone OTP for applicants, social login for donors.
/// </summary>
public sealed class EndUser : AggregateRoot<EndUserId>, ITenantScopedEntity
{
    private EndUser(EndUserId id, TenantId tenantId, EndUserType type) : base(id)
    {
        TenantId = tenantId;
        Type = type;
    }

    public TenantId TenantId { get; private init; }
    public EndUserType Type { get; private set; }
    public string? Email { get; private set; }
    public string? PhoneNumber { get; private set; }
    public string? FirstName { get; private set; }
    public string? LastName { get; private set; }

    /// <summary>External identity provider ID (Google, Facebook, etc.).</summary>
    public string? ExternalId { get; private set; }

    /// <summary>Social login provider name: "google", "facebook", "apple", etc.</summary>
    public string? SocialProvider { get; private set; }

    public bool IsVerified { get; private set; }
    public bool IsAnonymous { get; private set; }

    /// <summary>Links to the existing DonorProfile aggregate for tax certificate / address info.</summary>
    public DonorProfileId? DonorProfileId { get; private set; }

    /// <summary>Optional phone OTP verification code hash for applicant verification.</summary>
    public string? VerificationCodeHash { get; private set; }

    public DateTimeOffset? VerificationCodeExpiry { get; private set; }
    public int VerificationAttempts { get; private set; }
    public DateTimeOffset? LastActiveAt { get; private set; }

    public static EndUser CreateAnonymous(TenantId tenantId, EndUserType type)
    {
        return new EndUser(EndUserId.NewId(), tenantId, type)
        {
            IsAnonymous = true
        };
    }

    public static EndUser Create(TenantId tenantId, EndUserType type, string? email = null, string? phoneNumber = null,
        string? firstName = null, string? lastName = null)
    {
        return new EndUser(EndUserId.NewId(), tenantId, type)
        {
            Email = email?.ToLowerInvariant(),
            PhoneNumber = phoneNumber,
            FirstName = firstName,
            LastName = lastName
        };
    }

    public static EndUser CreateWithSocialLogin(TenantId tenantId, EndUserType type, string externalId,
        string socialProvider, string? email = null, string? firstName = null, string? lastName = null)
    {
        return new EndUser(EndUserId.NewId(), tenantId, type)
        {
            ExternalId = externalId,
            SocialProvider = socialProvider,
            Email = email?.ToLowerInvariant(),
            FirstName = firstName,
            LastName = lastName,
            IsVerified = true // Social login implies verified identity
        };
    }

    public void UpdateProfile(string? firstName, string? lastName, string? email, string? phoneNumber)
    {
        FirstName = firstName;
        LastName = lastName;
        Email = email?.ToLowerInvariant();
        PhoneNumber = phoneNumber;
    }

    public void LinkDonorProfile(DonorProfileId donorProfileId)
    {
        DonorProfileId = donorProfileId;
    }

    public void SetVerificationCode(string codeHash, DateTimeOffset expiry)
    {
        VerificationCodeHash = codeHash;
        VerificationCodeExpiry = expiry;
        VerificationAttempts = 0;
    }

    public bool HasExceededVerificationAttempts(int maxAttempts = 5)
    {
        return VerificationAttempts >= maxAttempts;
    }

    public bool HasExpiredVerificationCode(DateTimeOffset utcNow)
    {
        return VerificationCodeHash is null || VerificationCodeExpiry is null || VerificationCodeExpiry < utcNow;
    }

    public void RegisterInvalidVerificationAttempt()
    {
        VerificationAttempts++;
    }

    public void MarkAsVerified()
    {
        IsVerified = true;
        VerificationCodeHash = null;
        VerificationCodeExpiry = null;
        VerificationAttempts = 0;
    }

    public void RecordActivity()
    {
        LastActiveAt = TimeProvider.System.GetUtcNow();
    }

    public void PromoteFromAnonymous(string? email, string? phoneNumber, string? firstName, string? lastName)
    {
        IsAnonymous = false;
        Email = email?.ToLowerInvariant();
        PhoneNumber = phoneNumber;
        FirstName = firstName;
        LastName = lastName;
    }
}

/// <summary>The type of end-user in the fundraiser system.</summary>
[PublicAPI]
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum EndUserType
{
    /// <summary>A financial contributor to campaigns.</summary>
    Donor,

    /// <summary>Someone applying for assistance through the organization's application process.</summary>
    Applicant,

    /// <summary>Someone who has received assistance.</summary>
    Beneficiary
}
