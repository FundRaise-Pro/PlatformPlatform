using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PlatformPlatform.Fundraiser.Database;

namespace PlatformPlatform.Fundraiser.Database.Migrations;

[DbContext(typeof(FundraiserDbContext))]
[Migration("20260208120000_AddPhase5PaymentAndFormTemplates")]
public sealed class AddPhase5PaymentAndFormTemplates : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Add PaymentConfig JSON column to TenantSettings
        migrationBuilder.AddColumn<string>(
            "Payment",
            "TenantSettings",
            "nvarchar(max)",
            nullable: false,
            defaultValue: "{\"Provider\":0,\"ApiKey\":null,\"ApiSecret\":null,\"MerchantId\":null,\"WebhookSecret\":null,\"IsTestMode\":true,\"Currency\":\"ZAR\"}"
        );

        // Create FormTemplates table for the template marketplace
        migrationBuilder.CreateTable(
            "FormTemplate",
            table => new
            {
                Id = table.Column<string>("varchar(32)", nullable: false),
                CreatedAt = table.Column<DateTimeOffset>("datetimeoffset", nullable: false),
                ModifiedAt = table.Column<DateTimeOffset>("datetimeoffset", nullable: true),
                Name = table.Column<string>("nvarchar(200)", nullable: false),
                Description = table.Column<string>("nvarchar(1000)", nullable: true),
                Category = table.Column<string>("nvarchar(100)", nullable: false),
                IsSystemTemplate = table.Column<bool>("bit", nullable: false, defaultValue: true),
                IsPublished = table.Column<bool>("bit", nullable: false, defaultValue: false),
                CloneCount = table.Column<int>("int", nullable: false, defaultValue: 0),
                PreviewImageUrl = table.Column<string>("nvarchar(500)", nullable: true),
                Sections = table.Column<string>("nvarchar(max)", nullable: false, defaultValue: "[]")
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_FormTemplate", x => x.Id);
            }
        );

        migrationBuilder.CreateIndex("IX_FormTemplate_Category", "FormTemplate", "Category");
        migrationBuilder.CreateIndex("IX_FormTemplate_IsPublished", "FormTemplate", "IsPublished");
    }
}
