using PlatformPlatform.Fundraiser.Features.Stories.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Stories.Commands;

[PublicAPI]
public sealed record DeleteStoryCommand(StoryId Id) : ICommand, IRequest<Result>;

public sealed class DeleteStoryHandler(
    IStoryRepository storyRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<DeleteStoryCommand, Result>
{
    public async Task<Result> Handle(DeleteStoryCommand command, CancellationToken cancellationToken)
    {
        var story = await storyRepository.GetByIdAsync(command.Id, cancellationToken);
        if (story is null) return Result.NotFound($"Story with id '{command.Id}' not found.");

        storyRepository.Remove(story);
        events.CollectEvent(new StoryDeleted(story.Id));
        return Result.Success();
    }
}
