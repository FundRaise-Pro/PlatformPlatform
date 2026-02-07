using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PlatformPlatform.AccountManagement.Database;

namespace PlatformPlatform.AccountManagement.Database.Migrations;

[DbContext(typeof(AccountManagementDbContext))]
[Migration("20260208000000_AddSubscriptions")]
public sealed class AddSubscriptions : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Subscriptions",
            columns: table => new
            {
                Id = table.Column<string>("varchar(32)", nullable: false),
                TenantId = table.Column<long>("bigint", nullable: false),
                StripeCustomerId = table.Column<string>("nvarchar(255)", maxLength: 255, nullable: true),
                StripeSubscriptionId = table.Column<string>("nvarchar(255)", maxLength: 255, nullable: true),
                Plan = table.Column<string>("nvarchar(32)", maxLength: 32, nullable: false),
                Status = table.Column<string>("nvarchar(32)", maxLength: 32, nullable: false),
                CurrentPeriodStart = table.Column<DateTimeOffset>("datetimeoffset", nullable: true),
                CurrentPeriodEnd = table.Column<DateTimeOffset>("datetimeoffset", nullable: true),
                CancelledAt = table.Column<DateTimeOffset>("datetimeoffset", nullable: true),
                TrialEnd = table.Column<DateTimeOffset>("datetimeoffset", nullable: true),
                CreatedAt = table.Column<DateTimeOffset>("datetimeoffset", nullable: false),
                ModifiedAt = table.Column<DateTimeOffset>("datetimeoffset", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Subscriptions", x => x.Id);
            }
        );

        migrationBuilder.CreateIndex(
            name: "IX_Subscriptions_TenantId",
            table: "Subscriptions",
            column: "TenantId",
            unique: true
        );

        migrationBuilder.CreateIndex(
            name: "IX_Subscriptions_StripeCustomerId",
            table: "Subscriptions",
            column: "StripeCustomerId"
        );

        migrationBuilder.CreateIndex(
            name: "IX_Subscriptions_StripeSubscriptionId",
            table: "Subscriptions",
            column: "StripeSubscriptionId"
        );
    }
}
