using JetBrains.Annotations;
using PlatformPlatform.AccountManagement.Features.Authentication.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;

namespace PlatformPlatform.AccountManagement.Features.Authentication.Queries;

[PublicAPI]
public sealed record GetWebAuthnCredentialsQuery : IRequest<Result<WebAuthnCredentialResponse[]>>;

[PublicAPI]
public sealed record WebAuthnCredentialResponse(
    WebAuthnCredentialId Id,
    string FriendlyName,
    bool IsActive,
    Guid? AaGuid,
    string? Transports,
    DateTimeOffset CreatedAt,
    DateTimeOffset? LastUsedAt
);

public sealed class GetWebAuthnCredentialsHandler(
    IWebAuthnCredentialRepository webAuthnCredentialRepository,
    IExecutionContext executionContext
) : IRequestHandler<GetWebAuthnCredentialsQuery, Result<WebAuthnCredentialResponse[]>>
{
    public async Task<Result<WebAuthnCredentialResponse[]>> Handle(
        GetWebAuthnCredentialsQuery query, CancellationToken cancellationToken)
    {
        var userInfo = executionContext.UserInfo;
        if (!userInfo.IsAuthenticated || userInfo.Id is null)
            return Result<WebAuthnCredentialResponse[]>.Unauthorized("User must be authenticated.");

        var credentials = await webAuthnCredentialRepository.GetByUserIdAsync(userInfo.Id, cancellationToken);

        var responses = credentials.Select(c => new WebAuthnCredentialResponse(
            c.Id, c.FriendlyName, c.IsActive, c.AaGuid, c.Transports,
            c.CreatedAt, c.LastUsedAt
        )).ToArray();

        return responses;
    }
}
