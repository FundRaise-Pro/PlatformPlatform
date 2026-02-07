using System.Collections.Immutable;
using FluentValidation;
using PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.TenantSettings.Commands;

[PublicAPI]
public sealed record UpdateDomainConfigCommand(string? Subdomain, string[]? CustomDomains) : ICommand, IRequest<Result>;

public sealed class UpdateDomainConfigValidator : AbstractValidator<UpdateDomainConfigCommand>
{
    public UpdateDomainConfigValidator()
    {
        RuleFor(x => x.Subdomain).MaximumLength(63).WithMessage("Subdomain must be at most 63 characters.");
    }
}

public sealed class UpdateDomainConfigHandler(
    ITenantSettingsRepository tenantSettingsRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<UpdateDomainConfigCommand, Result>
{
    public async Task<Result> Handle(UpdateDomainConfigCommand command, CancellationToken cancellationToken)
    {
        var settings = await tenantSettingsRepository.GetByTenantIdAsync(executionContext.TenantId!, cancellationToken);
        if (settings is null)
            return Result.NotFound($"Tenant settings not found for tenant '{executionContext.TenantId}'.");

        var domain = new DomainConfig(
            command.Subdomain,
            command.CustomDomains is not null ? [..command.CustomDomains] : null
        );

        settings.UpdateDomain(domain);
        tenantSettingsRepository.Update(settings);

        events.CollectEvent(new DomainConfigUpdated(settings.Id, command.Subdomain));

        return Result.Success();
    }
}
