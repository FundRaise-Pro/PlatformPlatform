using System.Security.Cryptography;
using System.Text;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;

namespace PlatformPlatform.Fundraiser.Integrations.PaymentGateway;

public static class PayFastValidation
{
    private static readonly (uint Start, uint End)[] IpWhitelist =
    [
        (ToUInt32("41.74.179.192"), ToUInt32("41.74.179.223")),
        (ToUInt32("102.216.36.0"), ToUInt32("102.216.36.15")),
        (ToUInt32("102.216.36.128"), ToUInt32("102.216.36.143")),
        (ToUInt32("144.126.193.139"), ToUInt32("144.126.193.139")),
        (ToUInt32("197.97.145.144"), ToUInt32("197.97.145.159"))
    ];

    private static readonly string[] PayFastFieldOrder =
    [
        "merchant_id", "merchant_key", "return_url", "cancel_url", "notify_url",
        "name_first", "name_last", "email_address", "cell_number",
        "m_payment_id", "amount", "item_name", "item_description",
        "custom_int1", "custom_int2", "custom_int3", "custom_int4", "custom_int5",
        "custom_str1", "custom_str2", "custom_str3", "custom_str4", "custom_str5",
        "email_confirmation", "confirmation_address", "payment_method",
        "subscription_type", "billing_date", "recurring_amount", "frequency", "cycles",
        "subscription_notify_email", "subscription_notify_webhook", "subscription_notify_buyer",
        "passphrase"
    ];

    public static bool IsIpWhitelisted(string? ipAddress)
    {
        if (string.IsNullOrWhiteSpace(ipAddress)) return false;
        var ip = ipAddress.Split(',')[0].Trim();
        if (!System.Net.IPAddress.TryParse(ip, out var parsed)) return false;
        if (parsed.AddressFamily != System.Net.Sockets.AddressFamily.InterNetwork) return false;
        var numeric = ToUInt32(ip);
        return IpWhitelist.Any(range => numeric >= range.Start && numeric <= range.End);
    }

    public static string ComputeSignatureForOutbound(IReadOnlyDictionary<string, string> fields, string passphrase)
    {
        var queryString = BuildOrderedQueryString(fields, passphrase);
        return ComputeMd5(queryString);
    }

    public static bool VerifyItnSignature(IEnumerable<KeyValuePair<string, string>> formFields, string passphrase, string receivedSignature)
    {
        var signatureString = BuildItnSignatureString(formFields, passphrase);
        var computed = ComputeMd5(signatureString);
        return string.Equals(computed, receivedSignature, StringComparison.OrdinalIgnoreCase);
    }

    public static string BuildOrderedQueryString(IReadOnlyDictionary<string, string> fields, string? passphrase)
    {
        var pairs = PayFastFieldOrder
            .Where(key => fields.ContainsKey(key) && !string.IsNullOrEmpty(fields[key]))
            .Select(key => $"{UrlEncode(key)}={UrlEncode(fields[key])}");
        var queryString = string.Join("&", pairs);
        if (!string.IsNullOrEmpty(passphrase))
            queryString += $"&passphrase={UrlEncode(passphrase)}";
        return queryString;
    }

    public static string BuildItnSignatureString(IEnumerable<KeyValuePair<string, string>> formFields, string passphrase)
    {
        var sb = new StringBuilder();
        foreach (var (key, value) in formFields)
        {
            if (key.Equals("signature", StringComparison.OrdinalIgnoreCase)) continue;
            if (sb.Length > 0) sb.Append('&');
            sb.Append(UrlEncode(key));
            sb.Append('=');
            sb.Append(UrlEncode(value.Trim()));
        }
        if (!string.IsNullOrEmpty(passphrase))
        {
            sb.Append("&passphrase=");
            sb.Append(UrlEncode(passphrase.Trim()));
        }
        return sb.ToString();
    }

    public static string ComputeMd5(string input)
    {
        var hashBytes = MD5.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }

    public static PaymentMethod? ParsePaymentMethodCode(string? code) => code?.ToLowerInvariant() switch
    {
        "ef" => PaymentMethod.Eft,
        "cc" => PaymentMethod.CreditCard,
        "dc" => PaymentMethod.DebitCard,
        "mp" => PaymentMethod.Masterpass,
        "mc" => PaymentMethod.Mobicred,
        "sc" => PaymentMethod.SCode,
        "ss" => PaymentMethod.SnapScan,
        "zp" => PaymentMethod.Zapper,
        "mt" => PaymentMethod.MoreTyme,
        "rc" => PaymentMethod.StoreCard,
        "mu" => PaymentMethod.Mukuru,
        "ap" => PaymentMethod.ApplePay,
        "sp" => PaymentMethod.SamsungPay,
        "cp" => PaymentMethod.CapitecPay,
        "gp" => PaymentMethod.GooglePay,
        _ => null
    };

    private static string UrlEncode(string value)
    {
        if (string.IsNullOrEmpty(value)) return string.Empty;
        var encoded = Uri.EscapeDataString(value);
        return encoded.Replace("%20", "+");
    }

    private static uint ToUInt32(string ip) =>
        ip.Split('.').Select(byte.Parse).Aggregate(0u, (acc, b) => (acc << 8) | b);
}
