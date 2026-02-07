using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Users.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Users.Commands;

[PublicAPI]
public sealed record CreateTenantUserCommand(string UserId, string DisplayName)
    : ICommand, IRequest<Result<TenantUserId>>;

public sealed class CreateTenantUserValidator : AbstractValidator<CreateTenantUserCommand>
{
    public CreateTenantUserValidator()
    {
        RuleFor(x => x.UserId).NotEmpty().MaximumLength(50);
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(200);
    }
}

public sealed class CreateTenantUserHandler(
    ITenantUserRepository tenantUserRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<CreateTenantUserCommand, Result<TenantUserId>>
{
    public async Task<Result<TenantUserId>> Handle(CreateTenantUserCommand command, CancellationToken cancellationToken)
    {
        var tenantId = executionContext.TenantId!;
        var userId = new UserId(command.UserId);

        var existing = await tenantUserRepository.GetByUserIdAsync(userId, cancellationToken);
        if (existing is not null)
            return Result<TenantUserId>.Conflict($"TenantUser already exists for user '{userId}'.");

        var tenantUser = TenantUser.Create(tenantId, userId, command.DisplayName);
        await tenantUserRepository.AddAsync(tenantUser, cancellationToken);

        events.CollectEvent(new TenantUserCreated(tenantUser.Id));

        return tenantUser.Id;
    }
}
