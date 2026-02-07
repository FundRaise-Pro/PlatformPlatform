using FluentValidation;
using PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.TenantSettings.Commands;

[PublicAPI]
public sealed record UpdateThemeConfigCommand(
    string PrimaryColor,
    string SecondaryColor,
    string AccentColor,
    string? FontFamily,
    string? FontUrl,
    string? FaviconUrl,
    string? CustomCss
) : ICommand, IRequest<Result>;

public sealed class UpdateThemeConfigValidator : AbstractValidator<UpdateThemeConfigCommand>
{
    public UpdateThemeConfigValidator()
    {
        RuleFor(x => x.PrimaryColor).NotEmpty().Length(4, 9).WithMessage("Primary color must be a valid hex color between 4 and 9 characters.");
        RuleFor(x => x.SecondaryColor).NotEmpty().Length(4, 9).WithMessage("Secondary color must be a valid hex color between 4 and 9 characters.");
        RuleFor(x => x.AccentColor).NotEmpty().Length(4, 9).WithMessage("Accent color must be a valid hex color between 4 and 9 characters.");
        RuleFor(x => x.FontFamily).MaximumLength(100).WithMessage("Font family must be at most 100 characters.");
        RuleFor(x => x.FontUrl).MaximumLength(500).WithMessage("Font URL must be at most 500 characters.");
        RuleFor(x => x.FaviconUrl).MaximumLength(500).WithMessage("Favicon URL must be at most 500 characters.");
        RuleFor(x => x.CustomCss).MaximumLength(10000).WithMessage("Custom CSS must be at most 10000 characters.");
    }
}

public sealed class UpdateThemeConfigHandler(
    ITenantSettingsRepository tenantSettingsRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<UpdateThemeConfigCommand, Result>
{
    public async Task<Result> Handle(UpdateThemeConfigCommand command, CancellationToken cancellationToken)
    {
        var settings = await tenantSettingsRepository.GetByTenantIdAsync(executionContext.TenantId!, cancellationToken);
        if (settings is null)
            return Result.NotFound($"Tenant settings not found for tenant '{executionContext.TenantId}'.");

        var theme = new ThemeConfig(
            command.PrimaryColor,
            command.SecondaryColor,
            command.AccentColor,
            command.FontFamily,
            command.FontUrl,
            command.FaviconUrl,
            command.CustomCss
        );

        settings.UpdateTheme(theme);
        tenantSettingsRepository.Update(settings);

        events.CollectEvent(new ThemeConfigUpdated(settings.Id));

        return Result.Success();
    }
}
