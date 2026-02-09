using System.CommandLine;
using Microsoft.Data.SqlClient;
using Spectre.Console;

namespace PlatformPlatform.DeveloperCli.Commands;

/// <summary>
///     Verifies data isolation and integrity after GOS-Dev data migration.
///     Checks that all migrated data belongs to the specified tenant,
///     verifies FK integrity, and confirms no cross-tenant data leakage.
///     Usage: pp verify-migration --tenant-id 12345 --target "Server=localhost,9002;..."
/// </summary>
public class VerifyMigrationCommand : Command
{
    public VerifyMigrationCommand() : base("verify-migration", "Verifies data isolation and integrity after migration")
    {
        var tenantIdOption = new Option<long>("--tenant-id") { Description = "The PlatformPlatform TenantId to verify", Required = true };
        var targetOption = new Option<string>("--target") { Description = "SQL Server connection string for fundraiser DB", Required = true };

        Options.Add(tenantIdOption);
        Options.Add(targetOption);

        SetAction(parseResult => Execute(
            parseResult.GetValue(tenantIdOption),
            parseResult.GetValue(targetOption)!
        ));
    }

    private static void Execute(long tenantId, string target)
    {
        AnsiConsole.MarkupLine("[bold cyan]Post-Migration Verification[/]");
        AnsiConsole.MarkupLine($"  Tenant ID: [yellow]{tenantId}[/]");
        AnsiConsole.WriteLine();

        using var conn = new SqlConnection(target);
        conn.Open();

        var passed = 0;
        var failed = 0;
        var warnings = 0;

        // ========================================
        // 1. Tenant Isolation — all rows must belong to the specified tenant
        // ========================================
        AnsiConsole.MarkupLine("[bold]1. Tenant Isolation Checks[/]");

        string[] tenantScopedTables =
        [
            "Branches", "Campaigns", "BlogCategories", "BlogPosts", "FundraisingEvents",
            "QRCodes", "DonorProfiles", "Transactions", "Donations", "PaymentSubscriptions",
            "EndUsers", "TenantUsers", "FundraisingApplications", "FormVersions", "TenantSettings"
        ];

        foreach (var table in tenantScopedTables)
        {
            var exists = TableExists(conn, table);
            if (!exists)
            {
                AnsiConsole.MarkupLine($"  [yellow]⚠[/] Table [{table}] does not exist — skipped");
                warnings++;
                continue;
            }

            var totalCount = ExecuteScalar<int>(conn, $"SELECT COUNT(*) FROM [{table}]");
            var tenantCount = ExecuteScalar<int>(conn, $"SELECT COUNT(*) FROM [{table}] WHERE [TenantId] = @TenantId", ("@TenantId", tenantId));
            var otherCount = totalCount - tenantCount;

            if (otherCount > 0)
            {
                AnsiConsole.MarkupLine($"  [red]✗[/] [{table}]: {otherCount} rows belong to OTHER tenants (total: {totalCount}, tenant: {tenantCount})");
                failed++;
            }
            else if (tenantCount == 0)
            {
                AnsiConsole.MarkupLine($"  [yellow]⚠[/] [{table}]: empty (0 rows)");
                warnings++;
            }
            else
            {
                AnsiConsole.MarkupLine($"  [green]✓[/] [{table}]: {tenantCount} rows — all belong to tenant {tenantId}");
                passed++;
            }
        }

        // ========================================
        // 2. Row Counts Summary
        // ========================================
        AnsiConsole.WriteLine();
        AnsiConsole.MarkupLine("[bold]2. Row Count Summary[/]");

        var countTable = new Table()
            .AddColumn("Table")
            .AddColumn(new TableColumn("Rows").RightAligned());

        string[] allTables =
        [
            "Branches", "BranchServices",
            "Campaigns", "CampaignImages", "CampaignTags",
            "BlogCategories", "BlogPosts", "BlogPostTags",
            "FundraisingEvents",
            "QRCodes", "QRCodeHits",
            "DonorProfiles", "Transactions", "PaymentProcessingLogs",
            "Donations", "PaymentSubscriptions",
            "EndUsers", "TenantUsers", "RoleAssignments",
            "FundraisingApplications", "ApplicationFieldData", "ApplicationReviews", "ApplicationDocuments",
            "FormVersions", "FormSections", "FormFields", "FormFlags", "FormSelectControls",
            "TenantSettings", "UsageMetrics", "FormTemplates"
        ];

        foreach (var table in allTables)
        {
            if (!TableExists(conn, table))
            {
                countTable.AddRow($"[dim]{table}[/]", "[dim]N/A[/]");
                continue;
            }

            var count = ExecuteScalar<int>(conn, $"SELECT COUNT(*) FROM [{table}]");
            countTable.AddRow(table, count.ToString());
        }

        AnsiConsole.Write(countTable);

        // ========================================
        // 3. FK Integrity Checks
        // ========================================
        AnsiConsole.WriteLine();
        AnsiConsole.MarkupLine("[bold]3. Foreign Key Integrity[/]");

        // Check that owned entities reference valid parent records
        (string child, string childFk, string parent)[] fkChecks =
        [
            ("BranchServices", "BranchId", "Branches"),
            ("CampaignImages", "CampaignId", "Campaigns"),
            ("CampaignTags", "CampaignId", "Campaigns"),
            ("BlogPosts", "CategoryId", "BlogCategories"),
            ("BlogPostTags", "BlogPostId", "BlogPosts"),
            ("PaymentProcessingLogs", "TransactionId", "Transactions"),
            ("QRCodeHits", "QRCodeId", "QRCodes"),
            ("RoleAssignments", "TenantUserId", "TenantUsers"),
            ("ApplicationFieldData", "FundraisingApplicationId", "FundraisingApplications"),
            ("ApplicationReviews", "FundraisingApplicationId", "FundraisingApplications"),
            ("ApplicationDocuments", "FundraisingApplicationId", "FundraisingApplications")
        ];

        foreach (var (child, childFk, parent) in fkChecks)
        {
            if (!TableExists(conn, child) || !TableExists(conn, parent)) continue;

            var orphanCount = ExecuteScalar<int>(conn,
                $"SELECT COUNT(*) FROM [{child}] c WHERE NOT EXISTS (SELECT 1 FROM [{parent}] p WHERE p.[Id] = c.[{childFk}])");

            if (orphanCount > 0)
            {
                AnsiConsole.MarkupLine($"  [red]✗[/] [{child}].{childFk} → [{parent}]: {orphanCount} orphan rows");
                failed++;
            }
            else
            {
                AnsiConsole.MarkupLine($"  [green]✓[/] [{child}].{childFk} → [{parent}]: OK");
                passed++;
            }
        }

        // ========================================
        // 4. Unique Constraint Checks
        // ========================================
        AnsiConsole.WriteLine();
        AnsiConsole.MarkupLine("[bold]4. Unique Constraint Checks[/]");

        if (TableExists(conn, "TenantUsers"))
        {
            var dupTenantUsers = ExecuteScalar<int>(conn, """
                SELECT COUNT(*) FROM (
                    SELECT [TenantId], [UserId], COUNT(*) AS cnt
                    FROM [TenantUsers]
                    GROUP BY [TenantId], [UserId]
                    HAVING COUNT(*) > 1
                ) dupes
                """);
            CheckResult("TenantUsers(TenantId, UserId) unique", dupTenantUsers == 0, ref passed, ref failed);
        }

        if (TableExists(conn, "EndUsers"))
        {
            var dupEmails = ExecuteScalar<int>(conn, """
                SELECT COUNT(*) FROM (
                    SELECT [TenantId], [Email], COUNT(*) AS cnt
                    FROM [EndUsers]
                    WHERE [Email] IS NOT NULL
                    GROUP BY [TenantId], [Email]
                    HAVING COUNT(*) > 1
                ) dupes
                """);
            CheckResult("EndUsers(TenantId, Email) unique", dupEmails == 0, ref passed, ref failed);
        }

        if (TableExists(conn, "BlogPosts"))
        {
            var dupSlugs = ExecuteScalar<int>(conn, """
                SELECT COUNT(*) FROM (
                    SELECT [TenantId], [Slug], COUNT(*) AS cnt
                    FROM [BlogPosts]
                    GROUP BY [TenantId], [Slug]
                    HAVING COUNT(*) > 1
                ) dupes
                """);
            CheckResult("BlogPosts(TenantId, Slug) unique", dupSlugs == 0, ref passed, ref failed);
        }

        // ========================================
        // Summary
        // ========================================
        AnsiConsole.WriteLine();
        var rule = new Rule("[bold]Verification Summary[/]");
        AnsiConsole.Write(rule);

        AnsiConsole.MarkupLine($"  [green]Passed:   {passed}[/]");
        if (warnings > 0) AnsiConsole.MarkupLine($"  [yellow]Warnings: {warnings}[/]");
        if (failed > 0) AnsiConsole.MarkupLine($"  [red]Failed:   {failed}[/]");

        if (failed == 0)
            AnsiConsole.MarkupLine("\n[bold green]All verification checks passed![/]");
        else
            AnsiConsole.MarkupLine($"\n[bold red]{failed} verification checks failed — review data before cutover.[/]");
    }

    private static bool TableExists(SqlConnection conn, string tableName)
    {
        using var cmd = new SqlCommand(
            "SELECT CASE WHEN OBJECT_ID(@TableName, N'U') IS NOT NULL THEN 1 ELSE 0 END",
            conn);
        cmd.Parameters.AddWithValue("@TableName", tableName);
        return (int)cmd.ExecuteScalar()! == 1;
    }

    private static T ExecuteScalar<T>(SqlConnection conn, string sql, params (string name, object value)[] parameters)
    {
        using var cmd = new SqlCommand(sql, conn);
        foreach (var (name, value) in parameters)
        {
            cmd.Parameters.AddWithValue(name, value);
        }
        return (T)cmd.ExecuteScalar()!;
    }

    private static void CheckResult(string description, bool passed, ref int passCount, ref int failCount)
    {
        if (passed)
        {
            AnsiConsole.MarkupLine($"  [green]✓[/] {description}");
            passCount++;
        }
        else
        {
            AnsiConsole.MarkupLine($"  [red]✗[/] {description} — DUPLICATES FOUND");
            failCount++;
        }
    }
}
