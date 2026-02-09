using FluentValidation;
using PlatformPlatform.Fundraiser.Features.EndUsers.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.EndUsers.Commands;

[PublicAPI]
public sealed record UpdateEndUserCommand : ICommand, IRequest<Result>
{
    [JsonIgnore]
    public EndUserId Id { get; init; } = null!;

    public string? Email { get; init; }
    public string? PhoneNumber { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
}

public sealed class UpdateEndUserValidator : AbstractValidator<UpdateEndUserCommand>
{
    public UpdateEndUserValidator()
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
    }
}

public sealed class UpdateEndUserHandler(
    IEndUserRepository endUserRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<UpdateEndUserCommand, Result>
{
    public async Task<Result> Handle(UpdateEndUserCommand command, CancellationToken cancellationToken)
    {
        var endUser = await endUserRepository.GetByIdAsync(command.Id, cancellationToken);
        if (endUser is null)
            return Result.NotFound($"EndUser with ID '{command.Id}' not found.");

        endUser.UpdateProfile(command.FirstName, command.LastName, command.Email, command.PhoneNumber);
        endUserRepository.Update(endUser);

        events.CollectEvent(new EndUserUpdated(endUser.Id));

        return Result.Success();
    }
}
