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
public sealed record ChangePlanCommand : ICommand, IRequest<Result>
{
    public required SubscriptionPlan NewPlan { get; init; }
}

public sealed class ChangePlanValidator : AbstractValidator<ChangePlanCommand>
{
    public ChangePlanValidator()
    {
        RuleFor(x => x.NewPlan).IsInEnum().WithMessage("Invalid subscription plan.");
    }
}

public sealed class ChangePlanHandler(
    ISubscriptionRepository subscriptionRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<ChangePlanCommand, Result>
{
    public async Task<Result> Handle(ChangePlanCommand command, CancellationToken cancellationToken)
    {
        var tenantId = executionContext.TenantId;
        if (tenantId is null) return Result.Forbidden("No tenant context.");

        var subscription = await subscriptionRepository.GetByTenantIdAsync(tenantId, cancellationToken);

        if (subscription is null)
        {
            return Result.BadRequest("No subscription found for tenant.");
        }

        var oldPlan = subscription.Plan;
        if (oldPlan == command.NewPlan)
        {
            return Result.BadRequest($"Tenant is already on the '{command.NewPlan}' plan.");
        }

        subscription.UpdatePlan(command.NewPlan);
        subscriptionRepository.Update(subscription);

        events.CollectEvent(new SubscriptionPlanChanged(subscription.TenantId, oldPlan, command.NewPlan));

        return Result.Success();
    }
}
