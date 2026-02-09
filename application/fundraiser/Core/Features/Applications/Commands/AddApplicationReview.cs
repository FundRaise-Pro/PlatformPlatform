using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Applications.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Applications.Commands;

[PublicAPI]
public sealed record AddApplicationReviewCommand : ICommand, IRequest<Result>
{
    public required FundraisingApplicationId Id { get; init; }

    public required ReviewStage Stage { get; init; }

    public required string ReviewType { get; init; }

    public required ReviewDecision Decision { get; init; }

    public required string Notes { get; init; }

    public int PriorityScore { get; init; } = 5;
}

public sealed class AddApplicationReviewValidator : AbstractValidator<AddApplicationReviewCommand>
{
    public AddApplicationReviewValidator()
    {
        RuleFor(x => x.ReviewType).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Notes).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.PriorityScore).InclusiveBetween(0, 10);
    }
}

public sealed class AddApplicationReviewHandler(
    IFundraisingApplicationRepository applicationRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<AddApplicationReviewCommand, Result>
{
    public async Task<Result> Handle(AddApplicationReviewCommand command, CancellationToken cancellationToken)
    {
        var application = await applicationRepository.GetByIdAsync(command.Id, cancellationToken);
        if (application is null) return Result.NotFound($"Application with id '{command.Id}' not found.");

        application.AddReview(command.Stage, command.ReviewType, command.Decision, command.Notes, command.PriorityScore);
        applicationRepository.Update(application);

        events.CollectEvent(new ApplicationReviewed(application.Id, command.Decision));
        return Result.Success();
    }
}
