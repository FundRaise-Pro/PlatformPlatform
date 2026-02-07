using System.Collections.Immutable;
using FluentValidation;
using PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.TenantSettings.Commands;

[PublicAPI]
public sealed record UpdateBrandConfigCommand(
    string? OrganizationName,
    string? Tagline,
    string? SupportEmail,
    string? PhoneNumber,
    SocialLink[]? SocialLinks,
    string? TermsUrl,
    string? PrivacyUrl
) : ICommand, IRequest<Result>;

public sealed class UpdateBrandConfigValidator : AbstractValidator<UpdateBrandConfigCommand>
{
    public UpdateBrandConfigValidator()
    {
        RuleFor(x => x.OrganizationName).MaximumLength(200).WithMessage("Organization name must be at most 200 characters.");
        RuleFor(x => x.Tagline).MaximumLength(500).WithMessage("Tagline must be at most 500 characters.");
        RuleFor(x => x.SupportEmail).MaximumLength(200).WithMessage("Support email must be at most 200 characters.");
        RuleFor(x => x.PhoneNumber).MaximumLength(30).WithMessage("Phone number must be at most 30 characters.");
        RuleFor(x => x.TermsUrl).MaximumLength(500).WithMessage("Terms URL must be at most 500 characters.");
        RuleFor(x => x.PrivacyUrl).MaximumLength(500).WithMessage("Privacy URL must be at most 500 characters.");
    }
}

public sealed class UpdateBrandConfigHandler(
    ITenantSettingsRepository tenantSettingsRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<UpdateBrandConfigCommand, Result>
{
    public async Task<Result> Handle(UpdateBrandConfigCommand command, CancellationToken cancellationToken)
    {
        var settings = await tenantSettingsRepository.GetByTenantIdAsync(executionContext.TenantId!, cancellationToken);
        if (settings is null)
            return Result.NotFound($"Tenant settings not found for tenant '{executionContext.TenantId}'.");

        var brand = new BrandConfig(
            command.OrganizationName,
            command.Tagline,
            command.SupportEmail,
            command.PhoneNumber,
            command.SocialLinks is not null ? [..command.SocialLinks] : null,
            command.TermsUrl,
            command.PrivacyUrl
        );

        settings.UpdateBrand(brand);
        tenantSettingsRepository.Update(settings);

        events.CollectEvent(new BrandConfigUpdated(settings.Id));

        return Result.Success();
    }
}
