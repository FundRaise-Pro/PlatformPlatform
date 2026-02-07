using JetBrains.Annotations;
using PlatformPlatform.AccountManagement.Features.Authentication.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.AccountManagement.Features.Authentication.Commands;

/// <summary>
///     Removes a WebAuthn credential from the authenticated user's account.
/// </summary>
[PublicAPI]
public sealed record RemoveWebAuthnCredentialCommand(WebAuthnCredentialId Id) : ICommand, IRequest<Result>;

public sealed class RemoveWebAuthnCredentialHandler(
    IWebAuthnCredentialRepository webAuthnCredentialRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<RemoveWebAuthnCredentialCommand, Result>
{
    public async Task<Result> Handle(RemoveWebAuthnCredentialCommand command, CancellationToken cancellationToken)
    {
        var userInfo = executionContext.UserInfo;
        if (!userInfo.IsAuthenticated || userInfo.Id is null)
            return Result.Unauthorized("User must be authenticated.");

        var credential = await webAuthnCredentialRepository.GetByIdAsync(command.Id, cancellationToken);
        if (credential is null)
            return Result.NotFound($"WebAuthn credential with ID '{command.Id}' not found.");

        if (credential.UserId != userInfo.Id)
            return Result.Forbidden("Cannot remove another user's credential.");

        webAuthnCredentialRepository.Remove(credential);

        events.CollectEvent(new WebAuthnCredentialRemoved(credential.Id, userInfo.Id));

        return Result.Success();
    }
}
