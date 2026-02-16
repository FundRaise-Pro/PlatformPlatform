using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.Fundraiser.Features.Stories.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Stories.Commands;

[PublicAPI]
public sealed record CreateStoryCommand : ICommand, IRequest<Result<StoryId>>
{
    public required string Title { get; init; }
    public required string Content { get; init; }
    public string? Summary { get; init; }
    public decimal GoalAmount { get; init; }
    public string? CampaignId { get; init; }
}

public sealed class CreateStoryValidator : AbstractValidator<CreateStoryCommand>
{
    public CreateStoryValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Content).NotEmpty();
        RuleFor(x => x.Summary).MaximumLength(2000);
        RuleFor(x => x.GoalAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CampaignId)
            .Must(id => string.IsNullOrWhiteSpace(id) || CampaignId.TryParse(id, out _))
            .WithMessage("Campaign ID is invalid.");
    }
}

public sealed class CreateStoryHandler(
    IStoryRepository storyRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<CreateStoryCommand, Result<StoryId>>
{
    public async Task<Result<StoryId>> Handle(CreateStoryCommand command, CancellationToken cancellationToken)
    {
        var tenantId = executionContext.TenantId!;
        CampaignId? campaignId = null;
        if (!string.IsNullOrWhiteSpace(command.CampaignId) && !CampaignId.TryParse(command.CampaignId, out campaignId))
        {
            return Result<StoryId>.BadRequest("Campaign ID is invalid.");
        }

        var story = Story.Create(tenantId, command.Title, command.Content, command.GoalAmount, campaignId);

        if (command.Summary is not null)
            story.UpdateContent(command.Title, command.Content, command.Summary);

        await storyRepository.AddAsync(story, cancellationToken);
        events.CollectEvent(new StoryCreated(story.Id));
        return story.Id;
    }
}
