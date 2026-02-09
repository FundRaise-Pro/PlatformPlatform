using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PlatformPlatform.Fundraiser.Database;

namespace PlatformPlatform.Fundraiser.Database.Migrations;

[DbContext(typeof(FundraiserDbContext))]
[Migration("20260208230000_AddMissingFundraiserTables")]
public sealed class AddMissingFundraiserTables : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            IF OBJECT_ID(N'[BlogCategories]', N'U') IS NULL
            BEGIN
                CREATE TABLE [BlogCategories]
                (
                    [Id] [varchar](32) NOT NULL,
                    [TenantId] [bigint] NOT NULL,
                    [Title] [nvarchar](100) NOT NULL,
                    [Slug] [nvarchar](100) NOT NULL,
                    [Description] [nvarchar](500) NULL,
                    [MetaTitle] [nvarchar](200) NULL,
                    [MetaDescription] [nvarchar](500) NULL,
                    [ShowInNavigation] [bit] NOT NULL,
                    [DisplayOrder] [int] NOT NULL,
                    [CreatedAt] [datetimeoffset] NOT NULL,
                    [ModifiedAt] [datetimeoffset] NULL,
                    CONSTRAINT [PK_BlogCategories] PRIMARY KEY ([Id])
                );
            END;

            IF OBJECT_ID(N'[BlogPosts]', N'U') IS NULL
            BEGIN
                CREATE TABLE [BlogPosts]
                (
                    [Id] [varchar](32) NOT NULL,
                    [TenantId] [bigint] NOT NULL,
                    [CategoryId] [varchar](32) NOT NULL,
                    [Title] [nvarchar](200) NOT NULL,
                    [Slug] [nvarchar](200) NOT NULL,
                    [Content] [nvarchar](max) NOT NULL,
                    [Summary] [nvarchar](2000) NULL,
                    [Status] [nvarchar](50) NOT NULL,
                    [FeaturedImageUrl] [nvarchar](500) NULL,
                    [MetaTitle] [nvarchar](200) NULL,
                    [MetaDescription] [nvarchar](500) NULL,
                    [PublishedAt] [datetime2] NULL,
                    [CreatedAt] [datetimeoffset] NOT NULL,
                    [ModifiedAt] [datetimeoffset] NULL,
                    CONSTRAINT [PK_BlogPosts] PRIMARY KEY ([Id])
                );
            END;

            IF OBJECT_ID(N'[BlogPostTags]', N'U') IS NULL
            BEGIN
                CREATE TABLE [BlogPostTags]
                (
                    [BlogPostId] [varchar](32) NOT NULL,
                    [Id] [int] IDENTITY(1,1) NOT NULL,
                    [Tag] [nvarchar](50) NOT NULL,
                    CONSTRAINT [PK_BlogPostTags] PRIMARY KEY ([BlogPostId], [Id]),
                    CONSTRAINT [FK_BlogPostTags_BlogPosts_BlogPostId] FOREIGN KEY ([BlogPostId]) REFERENCES [BlogPosts]([Id]) ON DELETE CASCADE
                );
            END;

            IF OBJECT_ID(N'[FormVersions]', N'U') IS NULL
            BEGIN
                CREATE TABLE [FormVersions]
                (
                    [Id] [varchar](32) NOT NULL,
                    [TenantId] [bigint] NOT NULL,
                    [VersionNumber] [nvarchar](20) NOT NULL,
                    [Name] [nvarchar](100) NOT NULL,
                    [Description] [nvarchar](2000) NULL,
                    [IsActive] [bit] NOT NULL,
                    [ConfigurationJson] [nvarchar](max) NULL,
                    [CreatedAt] [datetimeoffset] NOT NULL,
                    [ModifiedAt] [datetimeoffset] NULL,
                    CONSTRAINT [PK_FormVersions] PRIMARY KEY ([Id])
                );
            END;

            IF OBJECT_ID(N'[FormSections]', N'U') IS NULL
            BEGIN
                CREATE TABLE [FormSections]
                (
                    [FormVersionId] [varchar](32) NOT NULL,
                    [Id] [uniqueidentifier] NOT NULL,
                    [Name] [nvarchar](50) NOT NULL,
                    [Title] [nvarchar](100) NOT NULL,
                    [Description] [nvarchar](500) NULL,
                    [DisplayOrder] [int] NOT NULL,
                    [IsActive] [bit] NOT NULL,
                    [Icon] [nvarchar](50) NULL,
                    CONSTRAINT [PK_FormSections] PRIMARY KEY ([FormVersionId], [Id]),
                    CONSTRAINT [FK_FormSections_FormVersions_FormVersionId] FOREIGN KEY ([FormVersionId]) REFERENCES [FormVersions]([Id]) ON DELETE CASCADE
                );
            END;

            IF OBJECT_ID(N'[FormFields]', N'U') IS NULL
            BEGIN
                CREATE TABLE [FormFields]
                (
                    [FormVersionId] [varchar](32) NOT NULL,
                    [FormSectionId] [uniqueidentifier] NOT NULL,
                    [Id] [uniqueidentifier] NOT NULL,
                    [Name] [nvarchar](100) NOT NULL,
                    [Label] [nvarchar](200) NOT NULL,
                    [FieldType] [nvarchar](max) NOT NULL,
                    [DefaultValue] [nvarchar](2000) NOT NULL,
                    [DisplayOrder] [int] NOT NULL,
                    [IsRequired] [bit] NOT NULL,
                    [Placeholder] [nvarchar](200) NULL,
                    [ValidationRules] [nvarchar](max) NULL,
                    [Options] [nvarchar](max) NULL,
                    [MinValue] [decimal](18,2) NULL,
                    [MaxValue] [decimal](18,2) NULL,
                    [MinLength] [int] NULL,
                    [MaxLength] [int] NULL,
                    CONSTRAINT [PK_FormFields] PRIMARY KEY ([FormVersionId], [FormSectionId], [Id]),
                    CONSTRAINT [FK_FormFields_FormSections_FormVersionId_FormSectionId]
                        FOREIGN KEY ([FormVersionId], [FormSectionId]) REFERENCES [FormSections]([FormVersionId], [Id]) ON DELETE CASCADE
                );
            END;

            IF OBJECT_ID(N'[FormFlags]', N'U') IS NULL
            BEGIN
                CREATE TABLE [FormFlags]
                (
                    [FormVersionId] [varchar](32) NOT NULL,
                    [FormSectionId] [uniqueidentifier] NOT NULL,
                    [Id] [uniqueidentifier] NOT NULL,
                    [Name] [nvarchar](100) NOT NULL,
                    [Question] [nvarchar](500) NOT NULL,
                    [DisplayOrder] [int] NOT NULL,
                    [IsRequired] [bit] NOT NULL,
                    [HelpText] [nvarchar](500) NULL,
                    CONSTRAINT [PK_FormFlags] PRIMARY KEY ([FormVersionId], [FormSectionId], [Id]),
                    CONSTRAINT [FK_FormFlags_FormSections_FormVersionId_FormSectionId]
                        FOREIGN KEY ([FormVersionId], [FormSectionId]) REFERENCES [FormSections]([FormVersionId], [Id]) ON DELETE CASCADE
                );
            END;

            IF OBJECT_ID(N'[FormSelectControls]', N'U') IS NULL
            BEGIN
                CREATE TABLE [FormSelectControls]
                (
                    [FormVersionId] [varchar](32) NOT NULL,
                    [FormSectionId] [uniqueidentifier] NOT NULL,
                    [Id] [uniqueidentifier] NOT NULL,
                    [Name] [nvarchar](100) NOT NULL,
                    [Label] [nvarchar](200) NOT NULL,
                    [Options] [nvarchar](max) NULL,
                    [DisplayOrder] [int] NOT NULL,
                    [IsRequired] [bit] NOT NULL,
                    [Placeholder] [nvarchar](200) NULL,
                    CONSTRAINT [PK_FormSelectControls] PRIMARY KEY ([FormVersionId], [FormSectionId], [Id]),
                    CONSTRAINT [FK_FormSelectControls_FormSections_FormVersionId_FormSectionId]
                        FOREIGN KEY ([FormVersionId], [FormSectionId]) REFERENCES [FormSections]([FormVersionId], [Id]) ON DELETE CASCADE
                );
            END;

            IF OBJECT_ID(N'[FormTemplates]', N'U') IS NULL
            BEGIN
                CREATE TABLE [FormTemplates]
                (
                    [Id] [varchar](32) NOT NULL,
                    [CreatedAt] [datetimeoffset] NOT NULL,
                    [ModifiedAt] [datetimeoffset] NULL,
                    [Name] [nvarchar](max) NOT NULL,
                    [Description] [nvarchar](max) NULL,
                    [Category] [nvarchar](max) NOT NULL,
                    [IsSystemTemplate] [bit] NOT NULL,
                    [IsPublished] [bit] NOT NULL,
                    [CloneCount] [int] NOT NULL,
                    [PreviewImageUrl] [nvarchar](max) NULL,
                    [Sections] [nvarchar](max) NOT NULL,
                    CONSTRAINT [PK_FormTemplates] PRIMARY KEY ([Id])
                );
            END;

            IF OBJECT_ID(N'[FormTemplate]', N'U') IS NOT NULL AND OBJECT_ID(N'[FormTemplates]', N'U') IS NOT NULL
               AND NOT EXISTS (SELECT 1 FROM [FormTemplates])
            BEGIN
                INSERT INTO [FormTemplates] ([Id], [CreatedAt], [ModifiedAt], [Name], [Description], [Category], [IsSystemTemplate], [IsPublished], [CloneCount], [PreviewImageUrl], [Sections])
                SELECT
                    [Id], [CreatedAt], [ModifiedAt], [Name], [Description], [Category], [IsSystemTemplate], [IsPublished], [CloneCount], [PreviewImageUrl], [Sections]
                FROM [FormTemplate];
            END;

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_BlogPosts_TenantId_Slug' AND object_id = OBJECT_ID(N'[BlogPosts]'))
            BEGIN
                CREATE UNIQUE INDEX [IX_BlogPosts_TenantId_Slug] ON [BlogPosts] ([TenantId], [Slug]);
            END;

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_FormTemplates_IsPublished' AND object_id = OBJECT_ID(N'[FormTemplates]'))
            BEGIN
                CREATE INDEX [IX_FormTemplates_IsPublished] ON [FormTemplates] ([IsPublished]);
            END;

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_FormTemplates_Category' AND object_id = OBJECT_ID(N'[FormTemplates]'))
            BEGIN
                CREATE INDEX [IX_FormTemplates_Category] ON [FormTemplates] ([Category]);
            END;
            """
        );
    }
}
