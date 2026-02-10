using System.Text.RegularExpressions;

namespace PlatformPlatform.AccountManagement.Features.Tenants.Domain;

public static partial class TenantSlugValidator
{
    public const int MinLength = 3;
    public const int MaxLength = 63;

    private static readonly HashSet<string> ReservedSlugs =
    [
        "admin", "api", "login", "signup", "error", "legal", "www", "app", "static",
        "internal-api", "account-management", "fundraiser", "back-office", "public-site",
        "health", "metrics"
    ];

    private static readonly HashSet<string> BlockedExtensions =
    [
        ".js", ".css", ".map", ".json", ".png", ".ico", ".svg", ".html", ".xml", ".txt",
        ".jpg", ".jpeg", ".gif", ".webp", ".woff", ".woff2", ".ttf", ".eot"
    ];

    public static string Canonicalize(string input)
    {
        var slug = input.Trim().ToLowerInvariant();
        slug = WhitespaceRegex().Replace(slug, "-");
        slug = NonSlugCharRegex().Replace(slug, "");
        slug = ConsecutiveHyphensRegex().Replace(slug, "-");
        slug = slug.Trim('-');
        return slug;
    }

    public static (bool IsValid, string? Reason) Validate(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return (false, "Slug is required.");

        var canonical = Canonicalize(slug);

        if (canonical != slug)
            return (false, "Slug is not in canonical form.");

        if (canonical.Length < MinLength)
            return (false, $"Slug must be at least {MinLength} characters.");

        if (canonical.Length > MaxLength)
            return (false, $"Slug must be at most {MaxLength} characters.");

        if (!SlugFormatRegex().IsMatch(canonical))
            return (false, "Slug must contain only lowercase letters, digits, and hyphens.");

        if (!ContainsLetterRegex().IsMatch(canonical))
            return (false, "Slug must contain at least one letter.");

        if (canonical.StartsWith("xn--", StringComparison.Ordinal))
            return (false, "Punycode slugs are not allowed.");

        if (ReservedSlugs.Contains(canonical))
            return (false, "This slug is reserved.");

        if (BlockedExtensions.Any(ext => canonical.EndsWith(ext, StringComparison.Ordinal)))
            return (false, "Slug must not end with a file extension.");

        return (true, null);
    }

    [GeneratedRegex(@"\s+")]
    private static partial Regex WhitespaceRegex();

    [GeneratedRegex(@"[^a-z0-9-]")]
    private static partial Regex NonSlugCharRegex();

    [GeneratedRegex(@"-{2,}")]
    private static partial Regex ConsecutiveHyphensRegex();

    [GeneratedRegex(@"^[a-z0-9]([a-z0-9-]*[a-z0-9])?$")]
    private static partial Regex SlugFormatRegex();

    [GeneratedRegex(@"[a-z]")]
    private static partial Regex ContainsLetterRegex();
}
