using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PlatformPlatform.Fundraiser.Database;

namespace PlatformPlatform.Fundraiser.Database.Migrations;

[DbContext(typeof(FundraiserDbContext))]
[Migration("20260212194000_AddCampaignSlugColumn")]
public sealed class AddCampaignSlugColumn : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            IF OBJECT_ID(N'[Campaigns]', N'U') IS NOT NULL
               AND COL_LENGTH(N'[Campaigns]', N'Slug') IS NULL
            BEGIN
                ALTER TABLE [Campaigns]
                ADD [Slug] [nvarchar](200) NOT NULL CONSTRAINT [DF_Campaigns_Slug] DEFAULT N'';
            END;

            IF OBJECT_ID(N'[Campaigns]', N'U') IS NOT NULL
               AND NOT EXISTS (
                   SELECT 1
                   FROM sys.indexes
                   WHERE name = N'IX_Campaigns_TenantId_Slug'
                     AND object_id = OBJECT_ID(N'[Campaigns]')
               )
            BEGIN
                CREATE INDEX [IX_Campaigns_TenantId_Slug] ON [Campaigns] ([TenantId], [Slug]);
            END;
            """
        );
    }
}
