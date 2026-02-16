using JetBrains.Annotations;

namespace PlatformPlatform.AccountManagement.Features.Tenants.Domain;

[PublicAPI]
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TenantState
{
    Trial,
    Active,
    Suspended
}

[PublicAPI]
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum NpoType
{
    Charity,
    Foundation,
    Ngo,
    Religious,
    Educational,
    CommunityBased,
    Other
}
