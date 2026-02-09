using FluentValidation;
using PlatformPlatform.Fundraiser.Features.EndUsers.Domain;
using PlatformPlatform.SharedKernel.Authentication;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.EndUsers.Commands;

/// <summary>
///     Verifies an end-user's identity using a one-time code (phone OTP or email verification).
///     This is the lighter auth path for applicants and donors who don't need full platform accounts.
/// </summary>
[PublicAPI]
public sealed record VerifyEndUserCommand(EndUserId EndUserId, string OneTimeCode) : ICommand, IRequest<Result>;

public sealed class VerifyEndUserValidator : AbstractValidator<VerifyEndUserCommand>
{
    public VerifyEndUserValidator()
    {
        RuleFor(x => x.EndUserId).NotNull();
        RuleFor(x => x.OneTimeCode).NotEmpty().Length(6);
    }
}

public sealed class VerifyEndUserHandler(
    IEndUserRepository endUserRepository,
    OneTimePasswordHelper oneTimePasswordHelper,
    TimeProvider timeProvider,
    ITelemetryEventsCollector events
) : IRequestHandler<VerifyEndUserCommand, Result>
{
    public async Task<Result> Handle(VerifyEndUserCommand command, CancellationToken cancellationToken)
    {
        var endUser = await endUserRepository.GetByIdAsync(command.EndUserId, cancellationToken);
        if (endUser is null)
            return Result.NotFound($"EndUser with ID '{command.EndUserId}' not found.");

        if (endUser.IsVerified)
            return Result.BadRequest("End-user is already verified.");

        if (endUser.HasExpiredVerificationCode(timeProvider.GetUtcNow()))
            return Result.BadRequest("The verification code has expired, please request a new one.");

        if (endUser.HasExceededVerificationAttempts())
        {
            endUser.RegisterInvalidVerificationAttempt();
            endUserRepository.Update(endUser);
            return Result.Forbidden("Too many attempts, please request a new code.");
        }

        if (oneTimePasswordHelper.Validate(endUser.VerificationCodeHash!, command.OneTimeCode))
        {
            endUser.RegisterInvalidVerificationAttempt();
            endUserRepository.Update(endUser);
            return Result.BadRequest("The verification code is wrong or no longer valid.");
        }

        endUser.MarkAsVerified();
        endUser.RecordActivity();
        endUserRepository.Update(endUser);

        events.CollectEvent(new EndUserVerified(endUser.Id, endUser.Type));

        return Result.Success();
    }
}
