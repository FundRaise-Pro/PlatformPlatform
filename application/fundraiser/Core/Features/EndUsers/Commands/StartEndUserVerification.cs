using FluentValidation;
using Microsoft.AspNetCore.Identity;
using PlatformPlatform.Fundraiser.Features.EndUsers.Domain;
using PlatformPlatform.SharedKernel.Authentication;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.EndUsers.Commands;

/// <summary>
///     Initiates a verification flow for an end-user by generating a one-time code.
///     The code is hashed and stored; the actual delivery (SMS/email) is handled externally.
/// </summary>
[PublicAPI]
public sealed record StartEndUserVerificationCommand(EndUserId EndUserId) : ICommand, IRequest<Result<string>>;

public sealed class StartEndUserVerificationValidator : AbstractValidator<StartEndUserVerificationCommand>
{
    public StartEndUserVerificationValidator()
    {
        RuleFor(x => x.EndUserId).NotNull();
    }
}

public sealed class StartEndUserVerificationHandler(
    IEndUserRepository endUserRepository,
    IPasswordHasher<object> passwordHasher,
    TimeProvider timeProvider,
    ITelemetryEventsCollector events
) : IRequestHandler<StartEndUserVerificationCommand, Result<string>>
{
    private const int VerificationCodeValidMinutes = 10;

    public async Task<Result<string>> Handle(StartEndUserVerificationCommand command, CancellationToken cancellationToken)
    {
        var endUser = await endUserRepository.GetByIdAsync(command.EndUserId, cancellationToken);
        if (endUser is null)
            return Result<string>.NotFound($"EndUser with ID '{command.EndUserId}' not found.");

        if (endUser.IsVerified)
            return Result<string>.BadRequest("End-user is already verified.");

        if (endUser.PhoneNumber is null && endUser.Email is null)
            return Result<string>.BadRequest("End-user has no phone number or email to verify.");

        var oneTimeCode = OneTimePasswordHelper.GenerateOneTimePassword(6);
        var codeHash = passwordHasher.HashPassword(this, oneTimeCode);
        var expiry = timeProvider.GetUtcNow().AddMinutes(VerificationCodeValidMinutes);

        endUser.SetVerificationCode(codeHash, expiry);
        endUserRepository.Update(endUser);

        events.CollectEvent(new EndUserVerificationStarted(endUser.Id));

        // Return the code — in production, this would be sent via SMS/email by an integration service
        // rather than returned to the caller. The handler returns it for now to enable testing.
        return oneTimeCode;
    }
}
