1using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace PlatformPlatform.AccountManagement.Database.Migrations;

[DbContext(typeof(AccountManagementDbContext))]
[Migration("20260209000000_AddTenantNpoFields")]
public sealed class AddTenantNpoFields : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Widen Name from nvarchar(30) to nvarchar(200)
        migrationBuilder.AlterColumn<string>(
            name: "Name",
            table: "Tenants",
            type: "nvarchar(200)",
            maxLength: 200,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "nvarchar(30)",
            oldMaxLength: 30);

        // Add Slug column — initially nullable so we can backfill
        migrationBuilder.AddColumn<string>(
            name: "Slug",
            table: "Tenants",
            type: "nvarchar(63)",
            maxLength: 63,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "OrgType",
            table: "Tenants",
            type: "varchar(20)",
            nullable: false,
            defaultValue: "Other");

        migrationBuilder.AddColumn<string>(
            name: "RegistrationNumber",
            table: "Tenants",
            type: "nvarchar(50)",
            maxLength: 50,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "Description",
            table: "Tenants",
            type: "nvarchar(500)",
            maxLength: 500,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "Country",
            table: "Tenants",
            type: "nvarchar(3)",
            maxLength: 3,
            nullable: true);

        // Backfill slugs for existing tenants:
        // Derive from Name (lowercase, replace spaces with hyphens, strip non-alphanumeric),
        // falling back to 'tenant-{Id}' for empty names.
        // Append '-{Id}' suffix to guarantee uniqueness across all rows.
        migrationBuilder.Sql("""
            UPDATE Tenants
            SET Slug = CASE
                WHEN LTRIM(RTRIM(Name)) = '' THEN CONCAT('tenant-', CAST(Id AS NVARCHAR(20)))
                ELSE CONCAT(
                    LEFT(
                        LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                            LTRIM(RTRIM(Name)),
                            ' ', '-'), '.', ''), '''', ''), ',', ''), '&', '')),
                        40),
                    '-', CAST(Id AS NVARCHAR(20)))
            END
            WHERE Slug IS NULL;
            """);

        // Now make Slug NOT NULL and add unique index
        migrationBuilder.AlterColumn<string>(
            name: "Slug",
            table: "Tenants",
            type: "nvarchar(63)",
            maxLength: 63,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "nvarchar(63)",
            oldMaxLength: 63,
            oldNullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Tenants_Slug",
            table: "Tenants",
            column: "Slug",
            unique: true);
    }
}
