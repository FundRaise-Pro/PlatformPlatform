using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PlatformPlatform.Fundraiser.Database;

namespace PlatformPlatform.Fundraiser.Database.Migrations;

[DbContext(typeof(FundraiserDbContext))]
[Migration("20260217180000_AddTransactionChannelColumn")]
public sealed class AddTransactionChannelColumn : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            IF OBJECT_ID(N'[Transactions]', N'U') IS NOT NULL
               AND COL_LENGTH(N'[Transactions]', N'Channel') IS NULL
            BEGIN
                ALTER TABLE [Transactions]
                ADD [Channel] [nvarchar](50) NOT NULL CONSTRAINT [DF_Transactions_Channel] DEFAULT N'Web';
            END;
            """
        );
    }
}
