using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Blogs.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Blogs.Commands;

[PublicAPI]
public sealed record UpdateBlogPostCommand : ICommand, IRequest<Result>
{
    public required BlogPostId Id { get; init; }

    public required string Title { get; init; }

    public required string Slug { get; init; }

    public required string Content { get; init; }

    public string? Summary { get; init; }

    public string? FeaturedImageUrl { get; init; }

    public string? MetaTitle { get; init; }

    public string? MetaDescription { get; init; }
}

public sealed class UpdateBlogPostValidator : AbstractValidator<UpdateBlogPostCommand>
{
    public UpdateBlogPostValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200).Matches("^[a-z0-9-]+$");
        RuleFor(x => x.Content).NotEmpty();
        RuleFor(x => x.Summary).MaximumLength(2000);
    }
}

public sealed class UpdateBlogPostHandler(
    IBlogPostRepository blogPostRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<UpdateBlogPostCommand, Result>
{
    public async Task<Result> Handle(UpdateBlogPostCommand command, CancellationToken cancellationToken)
    {
        var post = await blogPostRepository.GetByIdAsync(command.Id, cancellationToken);
        if (post is null) return Result.NotFound($"Blog post with id '{command.Id}' not found.");

        post.Update(command.Title, command.Slug, command.Content, command.Summary,
            command.FeaturedImageUrl, command.MetaTitle, command.MetaDescription);

        blogPostRepository.Update(post);

        events.CollectEvent(new BlogPostUpdated(post.Id));
        return Result.Success();
    }
}
