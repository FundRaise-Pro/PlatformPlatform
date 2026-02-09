using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PlatformPlatform.Fundraiser.Database;

namespace PlatformPlatform.Fundraiser.Database.Migrations;

[DbContext(typeof(FundraiserDbContext))]
[Migration("20260207120000_AddTenantSettings")]
public sealed class AddTenantSettings : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            "TenantSettings",
            table => new
            {
                TenantId = table.Column<long>("bigint", nullable: false),
                Id = table.Column<string>("varchar(32)", nullable: false),
                CreatedAt = table.Column<DateTimeOffset>("datetimeoffset", nullable: false),
                ModifiedAt = table.Column<DateTimeOffset>("datetimeoffset", nullable: true),
                Theme = table.Column<string>("nvarchar(max)", nullable: false),
                Brand = table.Column<string>("nvarchar(max)", nullable: false),
                Domain = table.Column<string>("nvarchar(max)", nullable: false),
                Content = table.Column<string>("nvarchar(max)", nullable: false),
                FeatureFlags = table.Column<string>("nvarchar(max)", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_TenantSettings", x => x.Id);
            }
        );

        migrationBuilder.CreateIndex("IX_TenantSettings_TenantId", "TenantSettings", "TenantId", unique: true);
    }
}
