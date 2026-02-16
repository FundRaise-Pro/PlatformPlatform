using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PlatformPlatform.Fundraiser.Database;

namespace PlatformPlatform.Fundraiser.Database.Migrations;

[DbContext(typeof(FundraiserDbContext))]
[Migration("20260218133000_AddStoryTableNameCompatibility")]
public sealed class AddStoryTableNameCompatibility : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            -- Compatibility for StoryImage table naming (singular/plural)
            IF OBJECT_ID('dbo.StoryImage', 'U') IS NOT NULL
               AND OBJECT_ID('dbo.StoryImages', 'U') IS NULL
               AND OBJECT_ID('dbo.StoryImages', 'SN') IS NULL
            BEGIN
                EXEC('CREATE SYNONYM [dbo].[StoryImages] FOR [dbo].[StoryImage]');
            END

            IF OBJECT_ID('dbo.StoryImages', 'U') IS NOT NULL
               AND OBJECT_ID('dbo.StoryImage', 'U') IS NULL
               AND OBJECT_ID('dbo.StoryImage', 'SN') IS NULL
            BEGIN
                EXEC('CREATE SYNONYM [dbo].[StoryImage] FOR [dbo].[StoryImages]');
            END

            -- Compatibility for StoryUpdate table naming (singular/plural)
            IF OBJECT_ID('dbo.StoryUpdate', 'U') IS NOT NULL
               AND OBJECT_ID('dbo.StoryUpdates', 'U') IS NULL
               AND OBJECT_ID('dbo.StoryUpdates', 'SN') IS NULL
            BEGIN
                EXEC('CREATE SYNONYM [dbo].[StoryUpdates] FOR [dbo].[StoryUpdate]');
            END

            IF OBJECT_ID('dbo.StoryUpdates', 'U') IS NOT NULL
               AND OBJECT_ID('dbo.StoryUpdate', 'U') IS NULL
               AND OBJECT_ID('dbo.StoryUpdate', 'SN') IS NULL
            BEGIN
                EXEC('CREATE SYNONYM [dbo].[StoryUpdate] FOR [dbo].[StoryUpdates]');
            END
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF OBJECT_ID('dbo.StoryImages', 'SN') IS NOT NULL
                DROP SYNONYM [dbo].[StoryImages];

            IF OBJECT_ID('dbo.StoryImage', 'SN') IS NOT NULL
                DROP SYNONYM [dbo].[StoryImage];

            IF OBJECT_ID('dbo.StoryUpdates', 'SN') IS NOT NULL
                DROP SYNONYM [dbo].[StoryUpdates];

            IF OBJECT_ID('dbo.StoryUpdate', 'SN') IS NOT NULL
                DROP SYNONYM [dbo].[StoryUpdate];
            """);
    }
}
