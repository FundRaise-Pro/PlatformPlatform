using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Stories.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Stories.Commands;

[PublicAPI]
public sealed record PublishStoryCommand(StoryId Id) : ICommand, IRequest<Result>;

public sealed class PublishStoryHandler(
    IStoryRepository storyRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<PublishStoryCommand, Result>
{
    public async Task<Result> Handle(PublishStoryCommand command, CancellationToken cancellationToken)
    {
        var story = await storyRepository.GetByIdAsync(command.Id, cancellationToken);
        if (story is null) return Result.NotFound($"Story with id '{command.Id}' not found.");

        story.Publish();
        storyRepository.Update(story);
        events.CollectEvent(new StoryPublished(story.Id));
        return Result.Success();
    }
}

[PublicAPI]
public sealed record SubmitStoryForScreeningCommand(StoryId Id) : ICommand, IRequest<Result>;

public sealed class SubmitStoryForScreeningHandler(
    IStoryRepository storyRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<SubmitStoryForScreeningCommand, Result>
{
    public async Task<Result> Handle(SubmitStoryForScreeningCommand command, CancellationToken cancellationToken)
    {
        var story = await storyRepository.GetByIdAsync(command.Id, cancellationToken);
        if (story is null) return Result.NotFound($"Story with id '{command.Id}' not found.");

        story.SubmitForScreening();
        storyRepository.Update(story);
        events.CollectEvent(new StorySubmittedForScreening(story.Id));
        return Result.Success();
    }
}

[PublicAPI]
public sealed record ApproveStoryCommand(StoryId Id) : ICommand, IRequest<Result>;

public sealed class ApproveStoryHandler(
    IStoryRepository storyRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<ApproveStoryCommand, Result>
{
    public async Task<Result> Handle(ApproveStoryCommand command, CancellationToken cancellationToken)
    {
        var story = await storyRepository.GetByIdAsync(command.Id, cancellationToken);
        if (story is null) return Result.NotFound($"Story with id '{command.Id}' not found.");

        story.Approve();
        storyRepository.Update(story);
        events.CollectEvent(new StoryApproved(story.Id));
        return Result.Success();
    }
}

[PublicAPI]
public sealed record CompleteFundraisingCommand(StoryId Id) : ICommand, IRequest<Result>;

public sealed class CompleteFundraisingHandler(
    IStoryRepository storyRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<CompleteFundraisingCommand, Result>
{
    public async Task<Result> Handle(CompleteFundraisingCommand command, CancellationToken cancellationToken)
    {
        var story = await storyRepository.GetByIdAsync(command.Id, cancellationToken);
        if (story is null) return Result.NotFound($"Story with id '{command.Id}' not found.");

        story.CompleteFundraising();
        storyRepository.Update(story);
        events.CollectEvent(new StoryFundraisingCompleted(story.Id));
        return Result.Success();
    }
}

[PublicAPI]
public sealed record MarkFulfilmentInProgressCommand(StoryId Id) : ICommand, IRequest<Result>;

public sealed class MarkFulfilmentInProgressHandler(
    IStoryRepository storyRepository
) : IRequestHandler<MarkFulfilmentInProgressCommand, Result>
{
    public async Task<Result> Handle(MarkFulfilmentInProgressCommand command, CancellationToken cancellationToken)
    {
        var story = await storyRepository.GetByIdAsync(command.Id, cancellationToken);
        if (story is null) return Result.NotFound($"Story with id '{command.Id}' not found.");

        story.MarkFulfilmentInProgress();
        storyRepository.Update(story);
        return Result.Success();
    }
}

[PublicAPI]
public sealed record MarkFulfilledCommand(StoryId Id) : ICommand, IRequest<Result>;

public sealed class MarkFulfilledHandler(
    IStoryRepository storyRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<MarkFulfilledCommand, Result>
{
    public async Task<Result> Handle(MarkFulfilledCommand command, CancellationToken cancellationToken)
    {
        var story = await storyRepository.GetByIdAsync(command.Id, cancellationToken);
        if (story is null) return Result.NotFound($"Story with id '{command.Id}' not found.");

        story.MarkFulfilled();
        storyRepository.Update(story);
        events.CollectEvent(new StoryFulfilled(story.Id));
        return Result.Success();
    }
}

[PublicAPI]
public sealed record AddStoryUpdateCommand : ICommand, IRequest<Result>
{
    public required StoryId Id { get; init; }
    public required string Title { get; init; }
    public required string Content { get; init; }
}

public sealed class AddStoryUpdateValidator : AbstractValidator<AddStoryUpdateCommand>
{
    public AddStoryUpdateValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Content).NotEmpty();
    }
}

public sealed class AddStoryUpdateHandler(
    IStoryRepository storyRepository
) : IRequestHandler<AddStoryUpdateCommand, Result>
{
    public async Task<Result> Handle(AddStoryUpdateCommand command, CancellationToken cancellationToken)
    {
        var story = await storyRepository.GetByIdAsync(command.Id, cancellationToken);
        if (story is null) return Result.NotFound($"Story with id '{command.Id}' not found.");

        story.AddUpdate(command.Title, command.Content);
        storyRepository.Update(story);
        return Result.Success();
    }
}
