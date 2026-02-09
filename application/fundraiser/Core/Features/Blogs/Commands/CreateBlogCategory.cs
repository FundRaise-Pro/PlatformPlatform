using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Blogs.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Blogs.Commands;

[PublicAPI]
public sealed record CreateBlogCategoryCommand : ICommand, IRequest<Result<BlogCategoryId>>
{
    public required string Title { get; init; }

    public required string Slug { get; init; }

    public string? Description { get; init; }
}

public sealed class CreateBlogCategoryValidator : AbstractValidator<CreateBlogCategoryCommand>
{
    public CreateBlogCategoryValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(100).Matches("^[a-z0-9-]+$").WithMessage("Slug must contain only lowercase letters, numbers, and hyphens.");
    }
}

public sealed class CreateBlogCategoryHandler(
    IBlogCategoryRepository blogCategoryRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<CreateBlogCategoryCommand, Result<BlogCategoryId>>
{
    public async Task<Result<BlogCategoryId>> Handle(CreateBlogCategoryCommand command, CancellationToken cancellationToken)
    {
        var category = BlogCategory.Create(executionContext.TenantId!, command.Title, command.Slug, command.Description);
        await blogCategoryRepository.AddAsync(category, cancellationToken);

        events.CollectEvent(new BlogCategoryCreated(category.Id));
        return category.Id;
    }
}
