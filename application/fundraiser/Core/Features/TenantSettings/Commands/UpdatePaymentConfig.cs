using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.TenantSettings.Commands;

[PublicAPI]
public sealed record UpdatePaymentConfigCommand(
    PaymentProvider Provider,
    string? ApiKey,
    string? ApiSecret,
    string? MerchantId,
    string? WebhookSecret,
    bool IsTestMode,
    string Currency
) : ICommand, IRequest<Result>;

public sealed class UpdatePaymentConfigValidator : AbstractValidator<UpdatePaymentConfigCommand>
{
    public UpdatePaymentConfigValidator()
    {
        RuleFor(x => x.ApiKey).MaximumLength(500).WithMessage("API key must be at most 500 characters.");
        RuleFor(x => x.ApiSecret).MaximumLength(500).WithMessage("API secret must be at most 500 characters.");
        RuleFor(x => x.MerchantId).MaximumLength(200).WithMessage("Merchant ID must be at most 200 characters.");
        RuleFor(x => x.WebhookSecret).MaximumLength(500).WithMessage("Webhook secret must be at most 500 characters.");
        RuleFor(x => x.Currency).NotEmpty().Length(3, 3).WithMessage("Currency must be a valid 3-letter ISO currency code.");
    }
}

public sealed class UpdatePaymentConfigHandler(
    ITenantSettingsRepository tenantSettingsRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<UpdatePaymentConfigCommand, Result>
{
    public async Task<Result> Handle(UpdatePaymentConfigCommand command, CancellationToken cancellationToken)
    {
        var settings = await tenantSettingsRepository.GetByTenantIdAsync(executionContext.TenantId!, cancellationToken);
        if (settings is null)
            return Result.NotFound($"Tenant settings not found for tenant '{executionContext.TenantId}'.");

        var payment = new PaymentConfig(
            command.Provider,
            command.ApiKey,
            command.ApiSecret,
            command.MerchantId,
            command.WebhookSecret,
            command.IsTestMode,
            command.Currency
        );

        settings.UpdatePayment(payment);
        tenantSettingsRepository.Update(settings);

        events.CollectEvent(new PaymentConfigUpdated(settings.Id, command.Provider));
        return Result.Success();
    }
}
