using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlatformPlatform.Fundraiser.Features.Blogs.Domain;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.EntityFramework;

namespace PlatformPlatform.Fundraiser.Features.Blogs.Domain;

public sealed class BlogCategoryConfiguration : IEntityTypeConfiguration<BlogCategory>
{
    public void Configure(EntityTypeBuilder<BlogCategory> builder)
    {
        builder.MapStronglyTypedUuid<BlogCategory, BlogCategoryId>(c => c.Id);
        builder.MapStronglyTypedLongId<BlogCategory, TenantId>(c => c.TenantId);

        builder.Property(c => c.Title).HasMaxLength(100).IsRequired();
        builder.Property(c => c.Slug).HasMaxLength(100).IsRequired();
        builder.Property(c => c.Description).HasMaxLength(500);
        builder.Property(c => c.MetaTitle).HasMaxLength(200);
        builder.Property(c => c.MetaDescription).HasMaxLength(500);
    }
}

public sealed class BlogPostConfiguration : IEntityTypeConfiguration<BlogPost>
{
    public void Configure(EntityTypeBuilder<BlogPost> builder)
    {
        builder.MapStronglyTypedUuid<BlogPost, BlogPostId>(p => p.Id);
        builder.MapStronglyTypedLongId<BlogPost, TenantId>(p => p.TenantId);
        builder.MapStronglyTypedUuid<BlogPost, BlogCategoryId>(p => p.CategoryId);

        builder.Property(p => p.Title).HasMaxLength(200).IsRequired();
        builder.Property(p => p.Slug).HasMaxLength(200).IsRequired();
        builder.Property(p => p.Content).IsRequired();
        builder.Property(p => p.Summary).HasMaxLength(2000);
        builder.Property(p => p.FeaturedImageUrl).HasMaxLength(500);
        builder.Property(p => p.MetaTitle).HasMaxLength(200);
        builder.Property(p => p.MetaDescription).HasMaxLength(500);
        builder.Property(p => p.Status).HasMaxLength(50);

        builder.HasIndex(p => new { p.TenantId, p.Slug }).IsUnique();

        builder.OwnsMany(p => p.Tags, b =>
        {
            b.WithOwner().HasForeignKey("BlogPostId");
            b.Property(t => t.Tag).HasMaxLength(50).IsRequired();
        });
    }
}
