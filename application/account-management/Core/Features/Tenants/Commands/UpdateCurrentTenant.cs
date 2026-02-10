using FluentValidation;
using JetBrains.Annotations;
using PlatformPlatform.AccountManagement.Features.Tenants.Domain;
using PlatformPlatform.AccountManagement.Features.Users.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.AccountManagement.Features.Tenants.Commands;

[PublicAPI]
public sealed record UpdateCurrentTenantCommand : ICommand, IRequest<Result>
{
    public required string Name { get; init; }

    public required NpoType OrgType { get; init; }

    public string? Country { get; init; }

    public string? RegistrationNumber { get; init; }

    public string? Description { get; init; }
}

public sealed class UpdateCurrentTenantValidator : AbstractValidator<UpdateCurrentTenantCommand>
{
    public UpdateCurrentTenantValidator()
    {
        RuleFor(x => x.Name).Length(1, 200).WithMessage("Name must be between 1 and 200 characters.");
        RuleFor(x => x.OrgType).IsInEnum();
        RuleFor(x => x.Country).MaximumLength(3).When(x => x.Country is not null);
        RuleFor(x => x.RegistrationNumber).MaximumLength(50).When(x => x.RegistrationNumber is not null);
        RuleFor(x => x.Description).MaximumLength(500).When(x => x.Description is not null);
    }
}

public sealed class UpdateTenantHandler(
    ITenantRepository tenantRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<UpdateCurrentTenantCommand, Result>
{
    public async Task<Result> Handle(UpdateCurrentTenantCommand command, CancellationToken cancellationToken)
    {
        if (executionContext.UserInfo.Role != nameof(UserRole.Owner))
        {
            return Result.Forbidden("Only owners are allowed to update tenant information.");
        }

        var tenant = await tenantRepository.GetCurrentTenantAsync(cancellationToken);

        tenant.UpdateProfile(command.Name, command.OrgType, command.Country, command.RegistrationNumber, command.Description);
        tenantRepository.Update(tenant);

        events.CollectEvent(new TenantUpdated());

        return Result.Success();
    }
}
