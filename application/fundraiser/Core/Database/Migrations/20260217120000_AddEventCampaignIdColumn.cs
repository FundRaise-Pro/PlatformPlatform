using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PlatformPlatform.Fundraiser.Database;

namespace PlatformPlatform.Fundraiser.Database.Migrations;

[DbContext(typeof(FundraiserDbContext))]
[Migration("20260217120000_AddEventCampaignIdColumn")]
public sealed class AddEventCampaignIdColumn : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.FundraisingEvents') AND name = 'CampaignId')
                ALTER TABLE [dbo].[FundraisingEvents] ADD [CampaignId] NVARCHAR(450) NULL;

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_FundraisingEvents_TenantId_CampaignId')
                CREATE INDEX [IX_FundraisingEvents_TenantId_CampaignId] ON [dbo].[FundraisingEvents] ([TenantId], [CampaignId]);
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_FundraisingEvents_TenantId_CampaignId')
                DROP INDEX [IX_FundraisingEvents_TenantId_CampaignId] ON [dbo].[FundraisingEvents];

            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.FundraisingEvents') AND name = 'CampaignId')
                ALTER TABLE [dbo].[FundraisingEvents] DROP COLUMN [CampaignId];
            """);
    }
}
