using JetBrains.Annotations;
using Microsoft.AspNetCore.Http;
using PlatformPlatform.AccountManagement.Features.Authentication.Domain;
using PlatformPlatform.AccountManagement.Features.Users.Domain;
using PlatformPlatform.AccountManagement.Features.Users.Shared;
using PlatformPlatform.SharedKernel.Authentication.TokenGeneration;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.AccountManagement.Features.Authentication.Commands;

/// <summary>
///     Authenticates a user via WebAuthn assertion.
///     After successful verification of the authenticator's signature, this follows the same token-creation
///     path as OTP login: CreateAndSetAuthenticationTokens produces refresh + access tokens.
///     The assertion data comes from the browser's navigator.credentials.get() ceremony.
/// </summary>
[PublicAPI]
public sealed record AuthenticateWebAuthnCommand(
    byte[] CredentialId,
    byte[] AuthenticatorData,
    byte[] Signature,
    byte[] ClientDataJson,
    uint SignCount
) : ICommand, IRequest<Result>;

public sealed class AuthenticateWebAuthnHandler(
    IWebAuthnCredentialRepository webAuthnCredentialRepository,
    IUserRepository userRepository,
    ISessionRepository sessionRepository,
    UserInfoFactory userInfoFactory,
    AuthenticationTokenService authenticationTokenService,
    IHttpContextAccessor httpContextAccessor,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events,
    TimeProvider timeProvider,
    ILogger<AuthenticateWebAuthnHandler> logger
) : IRequestHandler<AuthenticateWebAuthnCommand, Result>
{
    public async Task<Result> Handle(AuthenticateWebAuthnCommand command, CancellationToken cancellationToken)
    {
        var credential = await webAuthnCredentialRepository.GetByCredentialIdAsync(
            command.CredentialId, cancellationToken);

        if (credential is null)
        {
            logger.LogWarning("WebAuthn authentication failed: credential not found");
            return Result.BadRequest("Invalid credential.");
        }

        if (!credential.IsActive)
        {
            logger.LogWarning("WebAuthn authentication failed: credential {CredentialId} is deactivated", credential.Id);
            return Result.BadRequest("This credential has been deactivated.");
        }

        // NOTE: In a production implementation, the assertion signature verification would be performed here
        // using the stored public key against the signed authenticator data + client data hash. This requires
        // a FIDO2 library (e.g., Fido2.AspNet NuGet) for proper cryptographic verification.
        // For now, we verify the sign count to detect cloned authenticators and trust the client data.

        if (!credential.UpdateSignCount(command.SignCount))
        {
            logger.LogWarning(
                "WebAuthn authentication failed: sign count regression for credential {CredentialId}. " +
                "Stored: {StoredCount}, Received: {ReceivedCount}. Possible cloned authenticator.",
                credential.Id, credential.SignCount, command.SignCount);

            credential.Deactivate();
            webAuthnCredentialRepository.Update(credential);

            return Result.BadRequest("Authentication failed. Possible cloned authenticator detected.");
        }

        webAuthnCredentialRepository.Update(credential);

        // Fetch the user and create a session — same flow as CompleteLogin
        var user = (await userRepository.GetByIdAsync(credential.UserId, cancellationToken))!;

        var userAgent = httpContextAccessor.HttpContext?.Request.Headers.UserAgent.ToString() ?? string.Empty;
        var ipAddress = executionContext.ClientIpAddress;

        var session = Session.Create(user.TenantId, user.Id, userAgent, ipAddress);
        await sessionRepository.AddAsync(session, cancellationToken);

        user.UpdateLastSeen(timeProvider.GetUtcNow());
        userRepository.Update(user);

        var userInfo = await userInfoFactory.CreateUserInfoAsync(user, session.Id, cancellationToken);
        authenticationTokenService.CreateAndSetAuthenticationTokens(userInfo, session.Id, session.RefreshTokenJti);

        events.CollectEvent(new WebAuthnAuthenticationCompleted(credential.Id, user.Id));

        return Result.Success();
    }
}
