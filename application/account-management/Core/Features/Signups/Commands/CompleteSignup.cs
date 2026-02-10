using JetBrains.Annotations;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using PlatformPlatform.AccountManagement.Features.Authentication.Domain;
using PlatformPlatform.AccountManagement.Features.EmailConfirmations.Commands;
using PlatformPlatform.AccountManagement.Features.EmailConfirmations.Domain;
using PlatformPlatform.AccountManagement.Features.Tenants.Commands;
using PlatformPlatform.AccountManagement.Features.Tenants.Domain;
using PlatformPlatform.AccountManagement.Features.Users.Domain;
using PlatformPlatform.AccountManagement.Features.Users.Shared;
using PlatformPlatform.SharedKernel.Authentication.TokenGeneration;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.AccountManagement.Features.Signups.Commands;

[PublicAPI]
public sealed record CompleteSignupCommand(
    string OneTimePassword,
    string PreferredLocale,
    string OrganizationName,
    string Slug,
    NpoType OrgType,
    string Country,
    string? RegistrationNumber = null,
    string? Description = null
) : ICommand, IRequest<Result>
{
    [JsonIgnore]
    public EmailConfirmationId EmailConfirmationId { get; init; } = null!;
}

public sealed class CompleteSignupValidator : AbstractValidator<CompleteSignupCommand>
{
    public CompleteSignupValidator()
    {
        RuleFor(x => x.OrganizationName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(63)
            .Must(slug => TenantSlugValidator.Validate(slug).IsValid)
            .WithMessage("Invalid slug format.");
        RuleFor(x => x.OrgType).IsInEnum();
        RuleFor(x => x.Country).NotEmpty().MaximumLength(3);
        RuleFor(x => x.RegistrationNumber).MaximumLength(50).When(x => x.RegistrationNumber is not null);
        RuleFor(x => x.Description).MaximumLength(500).When(x => x.Description is not null);
    }
}

public sealed class CompleteSignupHandler(
    IUserRepository userRepository,
    ISessionRepository sessionRepository,
    UserInfoFactory userInfoFactory,
    AuthenticationTokenService authenticationTokenService,
    IHttpContextAccessor httpContextAccessor,
    IExecutionContext executionContext,
    IMediator mediator,
    ITelemetryEventsCollector events,
    TimeProvider timeProvider
) : IRequestHandler<CompleteSignupCommand, Result>
{
    public async Task<Result> Handle(CompleteSignupCommand command, CancellationToken cancellationToken)
    {
        var completeEmailConfirmationResult = await mediator.Send(
            new CompleteEmailConfirmationCommand(command.EmailConfirmationId, command.OneTimePassword),
            cancellationToken
        );

        if (!completeEmailConfirmationResult.IsSuccess) return Result.From(completeEmailConfirmationResult);

        var createTenantResult = await mediator.Send(
            new CreateTenantCommand(
                completeEmailConfirmationResult.Value!.Email,
                true,
                command.PreferredLocale,
                command.OrganizationName,
                command.Slug,
                command.OrgType,
                command.Country,
                command.RegistrationNumber,
                command.Description
            ),
            cancellationToken
        );

        if (!createTenantResult.IsSuccess) return Result.From(createTenantResult);

        var user = await userRepository.GetByIdAsync(createTenantResult.Value!.UserId, cancellationToken);

        var userAgent = httpContextAccessor.HttpContext?.Request.Headers.UserAgent.ToString() ?? string.Empty;
        var ipAddress = executionContext.ClientIpAddress;

        var session = Session.Create(user!.TenantId, user.Id, userAgent, ipAddress);
        await sessionRepository.AddAsync(session, cancellationToken);

        user.UpdateLastSeen(timeProvider.GetUtcNow());
        userRepository.Update(user);

        var userInfo = await userInfoFactory.CreateUserInfoAsync(user, session.Id, cancellationToken);
        authenticationTokenService.CreateAndSetAuthenticationTokens(userInfo, session.Id, session.RefreshTokenJti);

        events.CollectEvent(new SessionCreated(session.Id));
        events.CollectEvent(new SignupCompleted(createTenantResult.Value.TenantId, completeEmailConfirmationResult.Value!.ConfirmationTimeInSeconds));
        return Result.Success();
    }
}
