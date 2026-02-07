using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PlatformPlatform.Fundraiser.Database;

namespace PlatformPlatform.Fundraiser.Database.Migrations;

[DbContext(typeof(FundraiserDbContext))]
[Migration("20260208180000_AddUsageMetrics")]
public sealed class AddUsageMetrics : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "UsageMetrics",
            columns: table => new
            {
                Id = table.Column<string>("varchar(32)", nullable: false),
                TenantId = table.Column<long>("bigint", nullable: false),
                ResourceType = table.Column<string>("nvarchar(64)", maxLength: 64, nullable: false),
                CurrentCount = table.Column<int>("int", nullable: false),
                LastUpdatedAt = table.Column<DateTimeOffset>("datetimeoffset", nullable: false),
                CreatedAt = table.Column<DateTimeOffset>("datetimeoffset", nullable: false),
                ModifiedAt = table.Column<DateTimeOffset>("datetimeoffset", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_UsageMetrics", x => x.Id);
            }
        );

        migrationBuilder.CreateIndex(
            name: "IX_UsageMetrics_TenantId_ResourceType",
            table: "UsageMetrics",
            columns: new[] { "TenantId", "ResourceType" },
            unique: true
        );
    }
}
