using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PlatformPlatform.Fundraiser.Database;

namespace PlatformPlatform.Fundraiser.Database.Migrations;

[DbContext(typeof(FundraiserDbContext))]
[Migration("20260212203000_AddFundraisingEventSlugColumn")]
public sealed class AddFundraisingEventSlugColumn : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            IF OBJECT_ID(N'[FundraisingEvents]', N'U') IS NOT NULL
               AND COL_LENGTH(N'[FundraisingEvents]', N'Slug') IS NULL
            BEGIN
                ALTER TABLE [FundraisingEvents]
                ADD [Slug] [nvarchar](200) NOT NULL CONSTRAINT [DF_FundraisingEvents_Slug] DEFAULT N'';
            END;

            IF OBJECT_ID(N'[FundraisingEvents]', N'U') IS NOT NULL
               AND NOT EXISTS (
                   SELECT 1
                   FROM sys.indexes
                   WHERE name = N'IX_FundraisingEvents_TenantId_Slug'
                     AND object_id = OBJECT_ID(N'[FundraisingEvents]')
               )
            BEGIN
                CREATE INDEX [IX_FundraisingEvents_TenantId_Slug] ON [FundraisingEvents] ([TenantId], [Slug]);
            END;
            """
        );
    }
}
