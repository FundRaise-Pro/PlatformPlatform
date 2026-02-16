using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace PlatformPlatform.Fundraiser.Features.Donations.Domain;

/// <summary>
///     Generates and parses HMAC-signed merchant references for PayFast ITN tenant resolution.
///     Format: {tenantId}:{transactionId}:{sig} where sig = HMACSHA256(tenantId:transactionId, secret)[0..12].
///     Prevents cross-tenant probing and makes logs trustworthy.
/// </summary>
public sealed record MerchantReferenceParseResult(long TenantId, string TransactionId, bool IsValid);

public interface IMerchantReferenceGenerator
{
    string Generate(long tenantId, string transactionId);
    MerchantReferenceParseResult Parse(string merchantReference);
}

internal sealed class MerchantReferenceGenerator : IMerchantReferenceGenerator
{
    private readonly byte[] _secretBytes;

    public MerchantReferenceGenerator(IConfiguration configuration)
    {
        var secret = configuration["PaymentPlatformSecret"]
            ?? throw new InvalidOperationException("PaymentPlatformSecret configuration is required.");
        _secretBytes = Encoding.UTF8.GetBytes(secret);
    }

    public string Generate(long tenantId, string transactionId)
    {
        var sig = ComputeSignature(tenantId, transactionId);
        return $"{tenantId}:{transactionId}:{sig}";
    }

    public MerchantReferenceParseResult Parse(string merchantReference)
    {
        var invalid = new MerchantReferenceParseResult(0, string.Empty, false);

        if (string.IsNullOrWhiteSpace(merchantReference)) return invalid;

        var segments = merchantReference.Split(':');
        if (segments.Length != 3) return invalid;

        // Validate tenantId format (numeric long)
        if (!long.TryParse(segments[0], out var tenantId)) return invalid;

        // Validate transactionId format (26-char ULID — alphanumeric only)
        var transactionId = segments[1];
        if (transactionId.Length != 26) return invalid;
        if (!transactionId.All(c => char.IsLetterOrDigit(c))) return invalid;

        // Validate signature with constant-time comparison
        var receivedSig = segments[2].ToLowerInvariant();
        var expectedSig = ComputeSignature(tenantId, transactionId);

        if (receivedSig.Length != expectedSig.Length) return invalid;

        var receivedBytes = Encoding.UTF8.GetBytes(receivedSig);
        var expectedBytes = Encoding.UTF8.GetBytes(expectedSig);

        if (!CryptographicOperations.FixedTimeEquals(receivedBytes, expectedBytes)) return invalid;

        return new MerchantReferenceParseResult(tenantId, transactionId, true);
    }

    private string ComputeSignature(long tenantId, string transactionId)
    {
        var payload = Encoding.UTF8.GetBytes($"{tenantId}:{transactionId}");
        var hash = HMACSHA256.HashData(_secretBytes, payload);
        // Take first 12 chars of lowercase hex — always produces exactly 12 chars
        return Convert.ToHexStringLower(hash)[..12];
    }
}
