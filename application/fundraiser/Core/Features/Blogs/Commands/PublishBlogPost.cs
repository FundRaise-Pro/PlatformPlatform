using PlatformPlatform.Fundraiser.Features.Blogs.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Blogs.Commands;

[PublicAPI]
public sealed record PublishBlogPostCommand(BlogPostId Id) : ICommand, IRequest<Result>;

public sealed class PublishBlogPostHandler(
    IBlogPostRepository blogPostRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<PublishBlogPostCommand, Result>
{
    public async Task<Result> Handle(PublishBlogPostCommand command, CancellationToken cancellationToken)
    {
        var post = await blogPostRepository.GetByIdAsync(command.Id, cancellationToken);
        if (post is null) return Result.NotFound($"Blog post with id '{command.Id}' not found.");

        if (post.Status == BlogPostStatus.Published)
        {
            return Result.BadRequest("Blog post is already published.");
        }

        post.Publish();
        blogPostRepository.Update(post);

        events.CollectEvent(new BlogPostPublished(post.Id));
        return Result.Success();
    }
}
