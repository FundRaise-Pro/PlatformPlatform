using FluentValidation;
using PlatformPlatform.Fundraiser.Features.EndUsers.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.EndUsers.Commands;

[PublicAPI]
public sealed record RegisterEndUserCommand(
    EndUserType Type,
    string? Email,
    string? PhoneNumber,
    string? FirstName,
    string? LastName,
    string? ExternalId,
    string? SocialProvider,
    bool IsAnonymous = false
) : ICommand, IRequest<Result<EndUserId>>;

public sealed class RegisterEndUserValidator : AbstractValidator<RegisterEndUserCommand>
{
    public RegisterEndUserValidator()
    {
        RuleFor(x => x.Email)
            .MaximumLength(254)
            .EmailAddress()
            .When(x => x.Email is not null);

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20)
            .Matches(@"^\+?[\d\s\-()]+$")
            .When(x => x.PhoneNumber is not null);

        RuleFor(x => x.FirstName).MaximumLength(100);
        RuleFor(x => x.LastName).MaximumLength(100);

        RuleFor(x => x)
            .Must(x => x.IsAnonymous || x.Email is not null || x.PhoneNumber is not null || x.ExternalId is not null)
            .WithMessage("Non-anonymous end-users must have at least an email, phone number, or social login.")
            .WithName("Identity");
    }
}

public sealed class RegisterEndUserHandler(
    IEndUserRepository endUserRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<RegisterEndUserCommand, Result<EndUserId>>
{
    public async Task<Result<EndUserId>> Handle(RegisterEndUserCommand command, CancellationToken cancellationToken)
    {
        var tenantId = executionContext.TenantId!;

        // Check for existing end-user by email or social login to avoid duplicates
        if (command.Email is not null)
        {
            var existing = await endUserRepository.GetByEmailAsync(command.Email, cancellationToken);
            if (existing is not null)
                return Result<EndUserId>.Conflict($"An end-user with email '{command.Email}' already exists.");
        }

        if (command.ExternalId is not null && command.SocialProvider is not null)
        {
            var existing = await endUserRepository.GetBySocialLoginAsync(
                command.SocialProvider, command.ExternalId, cancellationToken);
            if (existing is not null)
                return Result<EndUserId>.Conflict("An end-user with this social login already exists.");
        }

        EndUser endUser;

        if (command.IsAnonymous)
        {
            endUser = EndUser.CreateAnonymous(tenantId, command.Type);
        }
        else if (command.ExternalId is not null && command.SocialProvider is not null)
        {
            endUser = EndUser.CreateWithSocialLogin(
                tenantId, command.Type, command.ExternalId, command.SocialProvider,
                command.Email, command.FirstName, command.LastName);
        }
        else
        {
            endUser = EndUser.Create(
                tenantId, command.Type, command.Email, command.PhoneNumber,
                command.FirstName, command.LastName);
        }

        await endUserRepository.AddAsync(endUser, cancellationToken);

        events.CollectEvent(new EndUserRegistered(endUser.Id, endUser.Type));

        return endUser.Id;
    }
}
