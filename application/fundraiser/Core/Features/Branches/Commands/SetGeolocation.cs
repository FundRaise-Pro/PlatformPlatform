using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Branches.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Branches.Commands;

[PublicAPI]
public sealed record SetGeolocationCommand : ICommand, IRequest<Result>
{
    public required BranchId Id { get; init; }

    public required double Latitude { get; init; }

    public required double Longitude { get; init; }

    public string? GoogleMapsUrl { get; init; }

    public string? AppleMapsUrl { get; init; }
}

public sealed class SetGeolocationValidator : AbstractValidator<SetGeolocationCommand>
{
    public SetGeolocationValidator()
    {
        RuleFor(x => x.Latitude).InclusiveBetween(-90, 90);
        RuleFor(x => x.Longitude).InclusiveBetween(-180, 180);
        RuleFor(x => x.GoogleMapsUrl).MaximumLength(500);
        RuleFor(x => x.AppleMapsUrl).MaximumLength(500);
    }
}

public sealed class SetGeolocationHandler(
    IBranchRepository branchRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<SetGeolocationCommand, Result>
{
    public async Task<Result> Handle(SetGeolocationCommand command, CancellationToken cancellationToken)
    {
        var branch = await branchRepository.GetByIdAsync(command.Id, cancellationToken);
        if (branch is null) return Result.NotFound($"Branch with id '{command.Id}' not found.");

        branch.SetGeolocation(command.Latitude, command.Longitude, command.GoogleMapsUrl, command.AppleMapsUrl);
        branchRepository.Update(branch);

        events.CollectEvent(new BranchGeolocationSet(branch.Id));
        return Result.Success();
    }
}
