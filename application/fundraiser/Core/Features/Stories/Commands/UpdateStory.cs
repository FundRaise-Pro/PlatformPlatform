using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Stories.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Stories.Commands;

[PublicAPI]
public sealed record UpdateStoryCommand : ICommand, IRequest<Result>
{
    public required StoryId Id { get; init; }
    public required string Title { get; init; }
    public required string Content { get; init; }
    public string? Summary { get; init; }
    public decimal GoalAmount { get; init; }
}

public sealed class UpdateStoryValidator : AbstractValidator<UpdateStoryCommand>
{
    public UpdateStoryValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Content).NotEmpty();
        RuleFor(x => x.Summary).MaximumLength(2000);
        RuleFor(x => x.GoalAmount).GreaterThanOrEqualTo(0);
    }
}

public sealed class UpdateStoryHandler(
    IStoryRepository storyRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<UpdateStoryCommand, Result>
{
    public async Task<Result> Handle(UpdateStoryCommand command, CancellationToken cancellationToken)
    {
        var story = await storyRepository.GetByIdAsync(command.Id, cancellationToken);
        if (story is null) return Result.NotFound($"Story with id '{command.Id}' not found.");

        story.UpdateContent(command.Title, command.Content, command.Summary);
        story.SetGoalAmount(command.GoalAmount);

        storyRepository.Update(story);
        events.CollectEvent(new StoryUpdated(story.Id));
        return Result.Success();
    }
}
