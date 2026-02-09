using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Branches.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Branches.Commands;

[PublicAPI]
public sealed record CreateBranchCommand : ICommand, IRequest<Result<BranchId>>
{
    public required string Name { get; init; }

    public required string AddressLine1 { get; init; }

    public required string City { get; init; }

    public required string State { get; init; }

    public required string PostalCode { get; init; }
}

public sealed class CreateBranchValidator : AbstractValidator<CreateBranchCommand>
{
    public CreateBranchValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.AddressLine1).NotEmpty().MaximumLength(300);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.State).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PostalCode).NotEmpty().MaximumLength(20);
    }
}

public sealed class CreateBranchHandler(
    IBranchRepository branchRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<CreateBranchCommand, Result<BranchId>>
{
    public async Task<Result<BranchId>> Handle(CreateBranchCommand command, CancellationToken cancellationToken)
    {
        var branch = Branch.Create(
            executionContext.TenantId!, command.Name, command.AddressLine1,
            command.City, command.State, command.PostalCode
        );

        await branchRepository.AddAsync(branch, cancellationToken);

        events.CollectEvent(new BranchCreated(branch.Id));
        return branch.Id;
    }
}
