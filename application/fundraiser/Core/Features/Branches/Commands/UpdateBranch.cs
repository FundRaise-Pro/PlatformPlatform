using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Branches.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Branches.Commands;

[PublicAPI]
public sealed record UpdateBranchCommand : ICommand, IRequest<Result>
{
    public required BranchId Id { get; init; }

    public required string AddressLine1 { get; init; }

    public string? AddressLine2 { get; init; }

    public string? Suburb { get; init; }

    public required string City { get; init; }

    public required string State { get; init; }

    public required string PostalCode { get; init; }
}

public sealed class UpdateBranchValidator : AbstractValidator<UpdateBranchCommand>
{
    public UpdateBranchValidator()
    {
        RuleFor(x => x.AddressLine1).NotEmpty().MaximumLength(300);
        RuleFor(x => x.AddressLine2).MaximumLength(300);
        RuleFor(x => x.Suburb).MaximumLength(100);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.State).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PostalCode).NotEmpty().MaximumLength(20);
    }
}

public sealed class UpdateBranchHandler(
    IBranchRepository branchRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<UpdateBranchCommand, Result>
{
    public async Task<Result> Handle(UpdateBranchCommand command, CancellationToken cancellationToken)
    {
        var branch = await branchRepository.GetByIdAsync(command.Id, cancellationToken);
        if (branch is null) return Result.NotFound($"Branch with id '{command.Id}' not found.");

        branch.UpdateAddress(command.AddressLine1, command.AddressLine2, command.Suburb, command.City, command.State, command.PostalCode);
        branchRepository.Update(branch);

        events.CollectEvent(new BranchUpdated(branch.Id));
        return Result.Success();
    }
}
