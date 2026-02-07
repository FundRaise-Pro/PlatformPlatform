using FluentValidation;
using JetBrains.Annotations;
using PlatformPlatform.AccountManagement.Features.Subscriptions.Domain;
using PlatformPlatform.AccountManagement.Integrations.Stripe;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.AccountManagement.Features.Subscriptions.Commands;

[PublicAPI]
public sealed record CreateCheckoutSessionCommand : ICommand, IRequest<Result<CheckoutSessionResponse>>
{
    public required SubscriptionPlan Plan { get; init; }

    public required string SuccessUrl { get; init; }

    public required string CancelUrl { get; init; }
}

[PublicAPI]
public sealed record CheckoutSessionResponse(string SessionId, string Url);

public sealed class CreateCheckoutSessionValidator : AbstractValidator<CreateCheckoutSessionCommand>
{
    public CreateCheckoutSessionValidator()
    {
        RuleFor(x => x.Plan).Must(p => p != SubscriptionPlan.Free).WithMessage("Cannot create a checkout session for the free plan.");
        RuleFor(x => x.SuccessUrl).NotEmpty().WithMessage("Success URL is required.");
        RuleFor(x => x.CancelUrl).NotEmpty().WithMessage("Cancel URL is required.");
    }
}

public sealed class CreateCheckoutSessionHandler(
    ISubscriptionRepository subscriptionRepository,
    StripeClient stripeClient,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<CreateCheckoutSessionCommand, Result<CheckoutSessionResponse>>
{
    public async Task<Result<CheckoutSessionResponse>> Handle(CreateCheckoutSessionCommand command, CancellationToken cancellationToken)
    {
        var tenantId = executionContext.TenantId;
        if (tenantId is null) return Result<CheckoutSessionResponse>.Forbidden("No tenant context.");

        var subscription = await subscriptionRepository.GetByTenantIdAsync(tenantId, cancellationToken);

        if (subscription is null)
        {
            return Result<CheckoutSessionResponse>.BadRequest("No subscription found for tenant.");
        }

        if (subscription.StripeCustomerId is null)
        {
            return Result<CheckoutSessionResponse>.BadRequest("Stripe customer has not been provisioned yet.");
        }

        var result = await stripeClient.CreateCheckoutSessionAsync(
            subscription.StripeCustomerId, command.Plan, command.SuccessUrl, command.CancelUrl, cancellationToken
        );

        if (result is null)
        {
            return Result<CheckoutSessionResponse>.BadRequest("Failed to create Stripe checkout session.");
        }

        events.CollectEvent(new CheckoutSessionCreated(subscription.TenantId, command.Plan));

        return new CheckoutSessionResponse(result.SessionId, result.Url);
    }
}
