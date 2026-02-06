using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Blogs.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Blogs.Commands;

[PublicAPI]
public sealed record CreateBlogPostCommand : ICommand, IRequest<Result<BlogPostId>>
{
    public required BlogCategoryId CategoryId { get; init; }

    public required string Title { get; init; }

    public required string Slug { get; init; }

    public required string Content { get; init; }

    public string? Summary { get; init; }

    public string? FeaturedImageUrl { get; init; }

    public string? MetaTitle { get; init; }

    public string? MetaDescription { get; init; }
}

public sealed class CreateBlogPostValidator : AbstractValidator<CreateBlogPostCommand>
{
    public CreateBlogPostValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200).Matches("^[a-z0-9-]+$").WithMessage("Slug must contain only lowercase letters, numbers, and hyphens.");
        RuleFor(x => x.Content).NotEmpty();
        RuleFor(x => x.Summary).MaximumLength(2000);
        RuleFor(x => x.MetaTitle).MaximumLength(200);
        RuleFor(x => x.MetaDescription).MaximumLength(500);
    }
}

public sealed class CreateBlogPostHandler(
    IBlogPostRepository blogPostRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<CreateBlogPostCommand, Result<BlogPostId>>
{
    public async Task<Result<BlogPostId>> Handle(CreateBlogPostCommand command, CancellationToken cancellationToken)
    {
        var existingPost = await blogPostRepository.GetBySlugAsync(command.Slug, cancellationToken);
        if (existingPost is not null)
        {
            return Result<BlogPostId>.Conflict($"A blog post with slug '{command.Slug}' already exists.");
        }

        var post = BlogPost.Create(executionContext.TenantId!, command.CategoryId, command.Title, command.Slug, command.Content);

        post.Update(command.Title, command.Slug, command.Content, command.Summary,
            command.FeaturedImageUrl, command.MetaTitle, command.MetaDescription);

        await blogPostRepository.AddAsync(post, cancellationToken);

        events.CollectEvent(new BlogPostCreated(post.Id));
        return post.Id;
    }
}
