using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Donations.Commands;

[PublicAPI]
public sealed record CreateSubscriptionCommand : ICommand, IRequest<Result<SubscriptionId>>
{
    public required decimal RecurringAmount { get; init; }

    public required string ItemName { get; init; }

    public int BillingDate { get; init; } = 1;

    public int Frequency { get; init; } = 1;

    public int? Cycles { get; init; }
}

public sealed class CreateSubscriptionValidator : AbstractValidator<CreateSubscriptionCommand>
{
    public CreateSubscriptionValidator()
    {
        RuleFor(x => x.RecurringAmount).GreaterThan(0);
        RuleFor(x => x.ItemName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.BillingDate).InclusiveBetween(1, 28);
        RuleFor(x => x.Frequency).Must(f => f is 1 or 3 or 6).WithMessage("Frequency must be 1 (Monthly), 3 (Quarterly), or 6 (Biannually).");
    }
}

public sealed class CreateSubscriptionHandler(
    IPaymentSubscriptionRepository subscriptionRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<CreateSubscriptionCommand, Result<SubscriptionId>>
{
    public async Task<Result<SubscriptionId>> Handle(CreateSubscriptionCommand command, CancellationToken cancellationToken)
    {
        var subscription = PaymentSubscription.Create(
            executionContext.TenantId!, command.RecurringAmount, command.ItemName,
            command.BillingDate, command.Frequency, command.Cycles
        );

        await subscriptionRepository.AddAsync(subscription, cancellationToken);

        events.CollectEvent(new SubscriptionCreated(subscription.Id, command.RecurringAmount));
        return subscription.Id;
    }
}
