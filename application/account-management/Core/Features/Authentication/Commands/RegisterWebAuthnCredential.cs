using FluentValidation;
using JetBrains.Annotations;
using PlatformPlatform.AccountManagement.Features.Authentication.Domain;
using PlatformPlatform.AccountManagement.Features.Users.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.AccountManagement.Features.Authentication.Commands;

/// <summary>
///     Registers a new WebAuthn credential for the authenticated user.
///     This is an optional upgrade path — users can add FIDO2 authenticators for passwordless login
///     alongside (or instead of) OTP email verification.
///     The credential data comes from the browser's navigator.credentials.create() ceremony.
/// </summary>
[PublicAPI]
public sealed record RegisterWebAuthnCredentialCommand(
    byte[] CredentialId,
    byte[] PublicKey,
    byte[] UserHandle,
    uint SignCount,
    string FriendlyName,
    Guid? AaGuid = null,
    string? AttestationType = null,
    string? Transports = null
) : ICommand, IRequest<Result<WebAuthnCredentialId>>;

public sealed class RegisterWebAuthnCredentialValidator : AbstractValidator<RegisterWebAuthnCredentialCommand>
{
    public RegisterWebAuthnCredentialValidator()
    {
        RuleFor(x => x.CredentialId).NotEmpty().Must(x => x.Length <= 1024)
            .WithMessage("Credential ID must not exceed 1024 bytes.");
        RuleFor(x => x.PublicKey).NotEmpty().Must(x => x.Length <= 2048)
            .WithMessage("Public key must not exceed 2048 bytes.");
        RuleFor(x => x.UserHandle).NotEmpty().Must(x => x.Length <= 128)
            .WithMessage("User handle must not exceed 128 bytes.");
        RuleFor(x => x.FriendlyName).NotEmpty().MaximumLength(200);
    }
}

public sealed class RegisterWebAuthnCredentialHandler(
    IWebAuthnCredentialRepository webAuthnCredentialRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<RegisterWebAuthnCredentialCommand, Result<WebAuthnCredentialId>>
{
    public async Task<Result<WebAuthnCredentialId>> Handle(
        RegisterWebAuthnCredentialCommand command, CancellationToken cancellationToken)
    {
        var userInfo = executionContext.UserInfo;
        if (!userInfo.IsAuthenticated || userInfo.Id is null || userInfo.TenantId is null)
            return Result<WebAuthnCredentialId>.Unauthorized("User must be authenticated to register a credential.");

        // Check for duplicate credential ID (should be globally unique per authenticator)
        var existing = await webAuthnCredentialRepository.GetByCredentialIdAsync(command.CredentialId, cancellationToken);
        if (existing is not null)
            return Result<WebAuthnCredentialId>.Conflict("A credential with this ID is already registered.");

        var credential = WebAuthnCredential.Create(
            userInfo.TenantId, userInfo.Id, command.CredentialId, command.PublicKey,
            command.SignCount, command.FriendlyName, command.UserHandle,
            command.AaGuid, command.AttestationType, command.Transports);

        await webAuthnCredentialRepository.AddAsync(credential, cancellationToken);

        events.CollectEvent(new WebAuthnCredentialRegistered(credential.Id, userInfo.Id));

        return credential.Id;
    }
}
