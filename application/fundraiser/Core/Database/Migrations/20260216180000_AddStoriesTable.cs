using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PlatformPlatform.Fundraiser.Database;

namespace PlatformPlatform.Fundraiser.Database.Migrations;

[DbContext(typeof(FundraiserDbContext))]
[Migration("20260216180000_AddStoriesTable")]
public sealed class AddStoriesTable : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF OBJECT_ID('dbo.Stories', 'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[Stories] (
                    [Id]                 NVARCHAR(450)   NOT NULL,
                    [TenantId]           BIGINT          NOT NULL,
                    [Title]              NVARCHAR(200)   NOT NULL,
                    [Slug]               NVARCHAR(200)   NOT NULL,
                    [Content]            NVARCHAR(MAX)   NOT NULL,
                    [Summary]            NVARCHAR(2000)  NULL,
                    [FeaturedImageUrl]   NVARCHAR(500)   NULL,
                    [GoalAmount]         DECIMAL(18,2)   NOT NULL DEFAULT 0,
                    [CampaignId]         NVARCHAR(450)   NULL,
                    [FundraisingStatus]  NVARCHAR(50)    NOT NULL DEFAULT 'Draft',
                    [FulfilmentStatus]   NVARCHAR(50)    NOT NULL DEFAULT 'Pending',
                    [IsPrivate]          BIT             NOT NULL DEFAULT 0,
                    [PublishedAt]        DATETIME2       NULL,
                    [ScreeningDate]      DATETIME2       NULL,
                    [CreatedAt]          DATETIMEOFFSET   NOT NULL,
                    [ModifiedAt]         DATETIMEOFFSET   NULL,
                    CONSTRAINT [PK_Stories] PRIMARY KEY ([Id])
                );
            END

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Stories_TenantId_Slug')
                CREATE INDEX [IX_Stories_TenantId_Slug] ON [dbo].[Stories] ([TenantId], [Slug]);

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Stories_TenantId_CampaignId')
                CREATE INDEX [IX_Stories_TenantId_CampaignId] ON [dbo].[Stories] ([TenantId], [CampaignId]);

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Stories_TenantId_FundraisingStatus')
                CREATE INDEX [IX_Stories_TenantId_FundraisingStatus] ON [dbo].[Stories] ([TenantId], [FundraisingStatus]);

            IF OBJECT_ID('dbo.StoryImage', 'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[StoryImage] (
                    [Id]              UNIQUEIDENTIFIER NOT NULL,
                    [StoryId]         NVARCHAR(450)    NOT NULL,
                    [BlobUrl]         NVARCHAR(1000)   NOT NULL,
                    [BlobName]        NVARCHAR(500)    NOT NULL,
                    [MimeType]        NVARCHAR(100)    NOT NULL,
                    [FileSizeBytes]   BIGINT           NOT NULL,
                    [UploadedAt]      DATETIME2        NOT NULL,
                    CONSTRAINT [PK_StoryImage] PRIMARY KEY ([StoryId], [Id]),
                    CONSTRAINT [FK_StoryImage_Stories_StoryId] FOREIGN KEY ([StoryId]) REFERENCES [dbo].[Stories] ([Id]) ON DELETE CASCADE
                );
            END

            IF OBJECT_ID('dbo.StoryUpdate', 'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[StoryUpdate] (
                    [Id]          UNIQUEIDENTIFIER NOT NULL,
                    [StoryId]     NVARCHAR(450)    NOT NULL,
                    [Title]       NVARCHAR(200)    NOT NULL,
                    [Content]     NVARCHAR(MAX)    NOT NULL,
                    [CreatedAt]   DATETIME2        NOT NULL,
                    CONSTRAINT [PK_StoryUpdate] PRIMARY KEY ([StoryId], [Id]),
                    CONSTRAINT [FK_StoryUpdate_Stories_StoryId] FOREIGN KEY ([StoryId]) REFERENCES [dbo].[Stories] ([Id]) ON DELETE CASCADE
                );
            END
        """);
    }
}
