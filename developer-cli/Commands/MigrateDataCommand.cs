using System.CommandLine;
using System.Data;
using Microsoft.Data.SqlClient;
using Npgsql;
using NUlid;
using Spectre.Console;

namespace PlatformPlatform.DeveloperCli.Commands;

/// <summary>
///     Migrates GOS-Dev (Gift of Sight) data from PostgreSQL to the PlatformPlatform fundraiser SQL Server database.
///     Usage: pp migrate-data --tenant-id 12345 --source "Host=localhost;Port=5432;..." --target "Server=localhost,9002;..."
/// </summary>
public class MigrateDataCommand : Command
{
    public MigrateDataCommand() : base("migrate-data", "Migrates GOS-Dev data from PostgreSQL into a PlatformPlatform fundraiser tenant")
    {
        var tenantIdOption = new Option<long>("--tenant-id") { Description = "The target PlatformPlatform TenantId (Snowflake long)", Required = true };
        var sourceOption = new Option<string>("--source") { Description = "PostgreSQL connection string for the GOS-Dev goh-core database", Required = true };
        var targetOption = new Option<string>("--target") { Description = "SQL Server connection string for the PlatformPlatform fundraiser database", Required = true };
        var targetAmOption = new Option<string?>("--target-am") { Description = "SQL Server connection string for account-management database (for user migration)" };
        var dryRunOption = new Option<bool>("--dry-run") { Description = "Preview migration without writing data" };

        Options.Add(tenantIdOption);
        Options.Add(sourceOption);
        Options.Add(targetOption);
        Options.Add(targetAmOption);
        Options.Add(dryRunOption);

        SetAction(parseResult => Execute(
            parseResult.GetValue(tenantIdOption),
            parseResult.GetValue(sourceOption)!,
            parseResult.GetValue(targetOption)!,
            parseResult.GetValue(targetAmOption),
            parseResult.GetValue(dryRunOption)
        ));
    }

    private static void Execute(long tenantId, string source, string target, string? targetAm, bool dryRun)
    {
        AnsiConsole.MarkupLine($"[bold cyan]GOS-Dev → PlatformPlatform Data Migration[/]");
        AnsiConsole.MarkupLine($"  Tenant ID:  [yellow]{tenantId}[/]");
        AnsiConsole.MarkupLine($"  Source:     [dim]{MaskPassword(source)}[/]");
        AnsiConsole.MarkupLine($"  Target:     [dim]{MaskPassword(target)}[/]");
        if (dryRun) AnsiConsole.MarkupLine("[yellow]  DRY RUN — no data will be written[/]");
        AnsiConsole.WriteLine();

        // ID mapping dictionaries: source Guid → target ULID string
        var userIdMap = new Dictionary<Guid, string>();       // GOS UserId → PP EndUserId or TenantUserId
        var branchIdMap = new Dictionary<Guid, string>();
        var campaignIdMap = new Dictionary<Guid, string>();    // Story.Id → Campaign.Id
        var transactionIdMap = new Dictionary<Guid, string>();
        var donorProfileIdMap = new Dictionary<Guid, string>();
        var blogCategoryIdMap = new Dictionary<int, string>(); // BlogType.Id (int) → BlogCategory.Id (ULID)
        var blogPostIdMap = new Dictionary<Guid, string>();
        var eventIdMap = new Dictionary<Guid, string>();
        var qrCodeIdMap = new Dictionary<Guid, string>();
        var formVersionIdMap = new Dictionary<Guid, string>();
        var formSectionIdMap = new Dictionary<Guid, Guid>();   // FormSection remains Guid (owned entity)
        var applicationIdMap = new Dictionary<Guid, string>();
        var subscriptionIdMap = new Dictionary<Guid, string>();

        using var srcConn = new NpgsqlConnection(source);
        using var tgtConn = new SqlConnection(target);

        srcConn.Open();
        tgtConn.Open();

        var now = DateTimeOffset.UtcNow;

        AnsiConsole.Status().Start("Migrating data...", ctx =>
        {
            // ========================================
            // 1. Branches
            // ========================================
            ctx.Status("Migrating Branches...");
            using (var cmd = new NpgsqlCommand("""
                SELECT "Id", "Name", "AddressLine1", "AddressLine2", "Suburb", "City", "Province",
                       "PostalCode", "Country", "Latitude", "Longitude", "PhoneNumber", "CreatedAt"
                FROM "Branches"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcId = reader.GetGuid(0);
                    var newId = NewUlid();
                    branchIdMap[srcId] = newId;

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            IF NOT EXISTS (SELECT 1 FROM [Branches] WHERE [Id] = @Id)
                            INSERT INTO [Branches] ([Id],[TenantId],[Name],[AddressLine1],[AddressLine2],[Suburb],[City],[State],[PostalCode],[Country],[Latitude],[Longitude],[PhoneNumber],[CreatedAt])
                            VALUES (@Id,@TenantId,@Name,@Addr1,@Addr2,@Suburb,@City,@State,@PostalCode,@Country,@Lat,@Lng,@Phone,@CreatedAt)
                            """,
                            ("@Id", newId),
                            ("@TenantId", tenantId),
                            ("@Name", reader.GetString(1)),
                            ("@Addr1", reader.GetString(2)),
                            ("@Addr2", GetNullableString(reader, 3)),
                            ("@Suburb", GetNullableString(reader, 4)),
                            ("@City", reader.GetString(5)),
                            ("@State", reader.IsDBNull(6) ? "N/A" : reader.GetString(6)),
                            ("@PostalCode", reader.IsDBNull(7) ? "" : reader.GetString(7)),
                            ("@Country", GetNullableString(reader, 8)),
                            ("@Lat", reader.IsDBNull(9) ? DBNull.Value : reader.GetDouble(9)),
                            ("@Lng", reader.IsDBNull(10) ? DBNull.Value : reader.GetDouble(10)),
                            ("@Phone", GetNullableString(reader, 11)),
                            ("@CreatedAt", reader.GetDateTime(12)
                        ));
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] Branches: [bold]{branchIdMap.Count}[/] records");

            // 1a. BranchServices
            var branchServiceCount = 0;
            using (var cmd = new NpgsqlCommand("""
                SELECT "BranchId", "Description"
                FROM "BranchServices"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcBranchId = reader.GetGuid(0);
                    if (!branchIdMap.TryGetValue(srcBranchId, out var tgtBranchId)) continue;
                    branchServiceCount++;

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            INSERT INTO [BranchServices] ([BranchId],[Description])
                            VALUES (@BranchId,@Description)
                            """,
                            ("@BranchId", tgtBranchId),
                            ("@Description", GetNullableString(reader, 1))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] BranchServices: [bold]{branchServiceCount}[/] records");

            // ========================================
            // 2. Campaigns (from Stories)
            // ========================================
            ctx.Status("Migrating Campaigns...");
            using (var cmd = new NpgsqlCommand("""
                SELECT "Id", "Title", "Content", "summary", "FeaturedImageUrl", "Status",
                       "IsPrivate", "PublishedAt", "ScreeningDate", "CreatedAt"
                FROM "Stories"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcId = reader.GetGuid(0);
                    var newId = NewUlid();
                    campaignIdMap[srcId] = newId;

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            IF NOT EXISTS (SELECT 1 FROM [Campaigns] WHERE [Id] = @Id)
                            INSERT INTO [Campaigns] ([Id],[TenantId],[Title],[Content],[Summary],[FeaturedImageUrl],[Status],[IsPrivate],[PublishedAt],[ScreeningDate],[CreatedAt])
                            VALUES (@Id,@TenantId,@Title,@Content,@Summary,@FeaturedImgUrl,@Status,@IsPrivate,@PublishedAt,@ScreeningDate,@CreatedAt)
                            """,
                            ("@Id", newId),
                            ("@TenantId", tenantId),
                            ("@Title", reader.IsDBNull(1) ? "Untitled Campaign" : reader.GetString(1)),
                            ("@Content", reader.IsDBNull(2) ? "" : reader.GetString(2)),
                            ("@Summary", GetNullableString(reader, 3)),
                            ("@FeaturedImgUrl", GetNullableString(reader, 4)),
                            ("@Status", MapCampaignStatus(reader.IsDBNull(5) ? null : reader.GetString(5))),
                            ("@IsPrivate", reader.IsDBNull(6) ? false : reader.GetBoolean(6)),
                            ("@PublishedAt", reader.IsDBNull(7) ? DBNull.Value : reader.GetDateTime(7)),
                            ("@ScreeningDate", reader.IsDBNull(8) ? DBNull.Value : reader.GetDateTime(8)),
                            ("@CreatedAt", reader.GetDateTime(9))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] Campaigns (from Stories): [bold]{campaignIdMap.Count}[/] records");

            // 2a. CampaignTags (from StorySymptoms)
            var tagCount = 0;
            using (var cmd = new NpgsqlCommand("""
                SELECT "StoryId", "Name"
                FROM "StorySymptoms"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcStoryId = reader.GetGuid(0);
                    if (!campaignIdMap.TryGetValue(srcStoryId, out var tgtCampaignId)) continue;
                    tagCount++;

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            INSERT INTO [CampaignTags] ([CampaignId],[Tag])
                            VALUES (@CampaignId,@Tag)
                            """,
                            ("@CampaignId", tgtCampaignId),
                            ("@Tag", reader.GetString(1))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] CampaignTags (from StorySymptoms): [bold]{tagCount}[/] records");

            // 2b. CampaignImages (from StoryImages — binary extraction)
            // Note: StoryImages store inline byte[] — this step creates placeholder records.
            // Actual blob upload handled in Step 5 (binary extraction).
            var imageCount = 0;
            using (var cmd = new NpgsqlCommand("""
                SELECT "Id", "StoryId", "ContentType", "CreatedAt"
                FROM "StoryImages"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcStoryId = reader.GetGuid(1);
                    if (!campaignIdMap.TryGetValue(srcStoryId, out var tgtCampaignId)) continue;
                    imageCount++;

                    if (!dryRun)
                    {
                        var imageId = Guid.NewGuid();
                        var srcImageId = reader.GetGuid(0);
                        ExecuteInsert(tgtConn, """
                            INSERT INTO [CampaignImages] ([CampaignId],[Id],[BlobUrl],[BlobName],[MimeType],[FileSizeBytes],[UploadedAt])
                            VALUES (@CampaignId,@Id,@BlobUrl,@BlobName,@MimeType,0,@UploadedAt)
                            """,
                            ("@CampaignId", tgtCampaignId),
                            ("@Id", imageId),
                            ("@BlobUrl", $"pending-migration/{srcImageId}"),
                            ("@BlobName", $"campaign-images/{srcImageId}"),
                            ("@MimeType", reader.IsDBNull(2) ? "image/jpeg" : reader.GetString(2)),
                            ("@UploadedAt", reader.IsDBNull(3) ? DateTime.UtcNow : reader.GetDateTime(3))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] CampaignImages (placeholders): [bold]{imageCount}[/] records");

            // ========================================
            // 3. BlogCategories (from BlogTypes)
            // ========================================
            ctx.Status("Migrating Blog data...");
            using (var cmd = new NpgsqlCommand("""
                SELECT "Id", "Name"
                FROM "BlogTypes"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcId = reader.GetInt32(0);
                    var newId = NewUlid();
                    blogCategoryIdMap[srcId] = newId;

                    if (!dryRun)
                    {
                        var name = reader.GetString(1);
                        ExecuteInsert(tgtConn, """
                            IF NOT EXISTS (SELECT 1 FROM [BlogCategories] WHERE [Id] = @Id)
                            INSERT INTO [BlogCategories] ([Id],[TenantId],[Title],[Slug],[ShowInNavigation],[DisplayOrder],[CreatedAt])
                            VALUES (@Id,@TenantId,@Title,@Slug,1,@Order,@CreatedAt)
                            """,
                            ("@Id", newId),
                            ("@TenantId", tenantId),
                            ("@Title", name),
                            ("@Slug", Slugify(name)),
                            ("@Order", srcId),
                            ("@CreatedAt", now)
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] BlogCategories (from BlogTypes): [bold]{blogCategoryIdMap.Count}[/] records");

            // 3a. BlogPosts (from Blogs)
            using (var cmd = new NpgsqlCommand("""
                SELECT "Id", "BlogTypeId", "Title", "Content", "Summary", "FeaturedImageUrl",
                       "Status", "PublishedAt", "CreatedAt", "Slug"
                FROM "Blogs"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcId = reader.GetGuid(0);
                    var newId = NewUlid();
                    blogPostIdMap[srcId] = newId;

                    var srcBlogTypeId = reader.GetInt32(1);
                    var tgtCategoryId = blogCategoryIdMap.GetValueOrDefault(srcBlogTypeId) ?? blogCategoryIdMap.Values.FirstOrDefault() ?? NewUlid();

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            IF NOT EXISTS (SELECT 1 FROM [BlogPosts] WHERE [Id] = @Id)
                            INSERT INTO [BlogPosts] ([Id],[TenantId],[CategoryId],[Title],[Slug],[Content],[Summary],[FeaturedImageUrl],[Status],[PublishedAt],[CreatedAt])
                            VALUES (@Id,@TenantId,@CategoryId,@Title,@Slug,@Content,@Summary,@FeaturedImgUrl,@Status,@PublishedAt,@CreatedAt)
                            """,
                            ("@Id", newId),
                            ("@TenantId", tenantId),
                            ("@CategoryId", tgtCategoryId),
                            ("@Title", reader.IsDBNull(2) ? "Untitled" : reader.GetString(2)),
                            ("@Slug", reader.IsDBNull(9) ? Slugify(reader.IsDBNull(2) ? "untitled" : reader.GetString(2)) : reader.GetString(9)),
                            ("@Content", reader.IsDBNull(3) ? "" : reader.GetString(3)),
                            ("@Summary", GetNullableString(reader, 4)),
                            ("@FeaturedImgUrl", GetNullableString(reader, 5)),
                            ("@Status", MapBlogStatus(reader.IsDBNull(6) ? null : reader.GetString(6))),
                            ("@PublishedAt", reader.IsDBNull(7) ? DBNull.Value : reader.GetDateTime(7)),
                            ("@CreatedAt", reader.GetDateTime(8))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] BlogPosts (from Blogs): [bold]{blogPostIdMap.Count}[/] records");

            // 3b. BlogPostTags (from BlogTags)
            var blogTagCount = 0;
            using (var cmd = new NpgsqlCommand("""
                SELECT "BlogId", "Tag"
                FROM "BlogTags"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcBlogId = reader.GetGuid(0);
                    if (!blogPostIdMap.TryGetValue(srcBlogId, out var tgtPostId)) continue;
                    blogTagCount++;

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            INSERT INTO [BlogPostTags] ([BlogPostId],[Tag])
                            VALUES (@BlogPostId,@Tag)
                            """,
                            ("@BlogPostId", tgtPostId),
                            ("@Tag", reader.GetString(1))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] BlogPostTags (from BlogTags): [bold]{blogTagCount}[/] records");

            // ========================================
            // 4. FundraisingEvents (from NPOEvents)
            // ========================================
            ctx.Status("Migrating Events...");
            using (var cmd = new NpgsqlCommand("""
                SELECT "Id", "Name", "Description", "EventDate", "Location",
                       "TargetAmount", "RaisedAmount", "Status", "ImageUrl", "CreatedAt"
                FROM "NPOEvents"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcId = reader.GetGuid(0);
                    var newId = NewUlid();
                    eventIdMap[srcId] = newId;

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            IF NOT EXISTS (SELECT 1 FROM [FundraisingEvents] WHERE [Id] = @Id)
                            INSERT INTO [FundraisingEvents] ([Id],[TenantId],[Name],[Description],[EventDate],[Location],[TargetAmount],[RaisedAmount],[Status],[ImageUrl],[CreatedAt])
                            VALUES (@Id,@TenantId,@Name,@Desc,@EventDate,@Location,@TargetAmt,@RaisedAmt,@Status,@ImgUrl,@CreatedAt)
                            """,
                            ("@Id", newId),
                            ("@TenantId", tenantId),
                            ("@Name", reader.GetString(1)),
                            ("@Desc", reader.IsDBNull(2) ? "" : reader.GetString(2)),
                            ("@EventDate", reader.GetDateTime(3)),
                            ("@Location", GetNullableString(reader, 4)),
                            ("@TargetAmt", reader.IsDBNull(5) ? 0m : reader.GetDecimal(5)),
                            ("@RaisedAmt", reader.IsDBNull(6) ? 0m : reader.GetDecimal(6)),
                            ("@Status", MapEventStatus(reader.IsDBNull(7) ? null : reader.GetString(7))),
                            ("@ImgUrl", GetNullableString(reader, 8)),
                            ("@CreatedAt", reader.GetDateTime(9))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] FundraisingEvents: [bold]{eventIdMap.Count}[/] records");

            // ========================================
            // 5. QRCodes + QRCodeHits
            // ========================================
            ctx.Status("Migrating QR Codes...");
            using (var cmd = new NpgsqlCommand("""
                SELECT "Id", "Name", "RedirectUrl", "IsActive", "QRCodeType", "HitCount", "CreatedAt"
                FROM "QRCodes"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcId = reader.GetGuid(0);
                    var newId = NewUlid();
                    qrCodeIdMap[srcId] = newId;

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            IF NOT EXISTS (SELECT 1 FROM [QRCodes] WHERE [Id] = @Id)
                            INSERT INTO [QRCodes] ([Id],[TenantId],[Name],[RedirectUrl],[IsActive],[QRCodeType],[HitCount],[CreatedAt])
                            VALUES (@Id,@TenantId,@Name,@RedirectUrl,@IsActive,@QRCodeType,@HitCount,@CreatedAt)
                            """,
                            ("@Id", newId),
                            ("@TenantId", tenantId),
                            ("@Name", reader.GetString(1)),
                            ("@RedirectUrl", reader.GetString(2)),
                            ("@IsActive", reader.IsDBNull(3) ? true : reader.GetBoolean(3)),
                            ("@QRCodeType", reader.IsDBNull(4) ? "General" : reader.GetString(4)),
                            ("@HitCount", reader.IsDBNull(5) ? 0 : reader.GetInt32(5)),
                            ("@CreatedAt", reader.GetDateTime(6))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] QRCodes: [bold]{qrCodeIdMap.Count}[/] records");

            // QRCodeHits (from QRCodeAnalytics)
            var qrHitCount = 0;
            using (var cmd = new NpgsqlCommand("""
                SELECT "QRCodeId", "ScannedAt", "UserAgent", "Referrer", "IpAddress"
                FROM "QRCodeAnalytics"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcQrId = reader.GetGuid(0);
                    if (!qrCodeIdMap.TryGetValue(srcQrId, out var tgtQrId)) continue;
                    qrHitCount++;

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            INSERT INTO [QRCodeHits] ([QRCodeId],[Id],[HitAt],[UserAgent],[Referrer],[IpAddress])
                            VALUES (@QRCodeId,@Id,@HitAt,@UserAgent,@Referrer,@IpAddress)
                            """,
                            ("@QRCodeId", tgtQrId),
                            ("@Id", Guid.NewGuid()),
                            ("@HitAt", reader.GetDateTime(1)),
                            ("@UserAgent", GetNullableString(reader, 2)),
                            ("@Referrer", GetNullableString(reader, 3)),
                            ("@IpAddress", GetNullableString(reader, 4))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] QRCodeHits: [bold]{qrHitCount}[/] records");

            // ========================================
            // 6. DonorProfiles
            // ========================================
            ctx.Status("Migrating Donor data...");
            using (var cmd = new NpgsqlCommand("""
                SELECT "Id", "TaxIdNumber", "CompanyRegistration", "CompanyName", "IsCompany",
                       "StreetAddress", "Suburb", "City", "Province", "PostalCode", "Country",
                       "PreferEmailCommunication", "PreferSmsCommunication", "CreatedAt"
                FROM "DonorProfiles"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcId = reader.GetGuid(0);
                    var newId = NewUlid();
                    donorProfileIdMap[srcId] = newId;

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            IF NOT EXISTS (SELECT 1 FROM [DonorProfiles] WHERE [Id] = @Id)
                            INSERT INTO [DonorProfiles] ([Id],[TenantId],[TaxIdNumber],[CompanyRegistration],[CompanyName],[IsCompany],
                                [StreetAddress],[Suburb],[City],[Province],[PostalCode],[Country],[PreferEmailCommunication],[PreferSmsCommunication],[CreatedAt])
                            VALUES (@Id,@TenantId,@TaxId,@CompReg,@CompName,@IsComp,@Street,@Suburb,@City,@Province,@Postal,@Country,@EmailPref,@SmsPref,@CreatedAt)
                            """,
                            ("@Id", newId),
                            ("@TenantId", tenantId),
                            ("@TaxId", GetNullableString(reader, 1)),
                            ("@CompReg", GetNullableString(reader, 2)),
                            ("@CompName", GetNullableString(reader, 3)),
                            ("@IsComp", reader.IsDBNull(4) ? false : reader.GetBoolean(4)),
                            ("@Street", GetNullableString(reader, 5)),
                            ("@Suburb", GetNullableString(reader, 6)),
                            ("@City", GetNullableString(reader, 7)),
                            ("@Province", GetNullableString(reader, 8)),
                            ("@Postal", GetNullableString(reader, 9)),
                            ("@Country", reader.IsDBNull(10) ? "South Africa" : reader.GetString(10)),
                            ("@EmailPref", reader.IsDBNull(11) ? true : reader.GetBoolean(11)),
                            ("@SmsPref", reader.IsDBNull(12) ? false : reader.GetBoolean(12)),
                            ("@CreatedAt", reader.GetDateTime(13))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] DonorProfiles: [bold]{donorProfileIdMap.Count}[/] records");

            // ========================================
            // 7. Transactions
            // ========================================
            ctx.Status("Migrating Transactions...");
            using (var cmd = new NpgsqlCommand("""
                SELECT "Id", "Name", "Description", "GatewayPaymentId", "PayeeName", "PayeeEmail",
                       "Status", "Type", "PaymentProvider", "PaymentMethod",
                       "Amount", "AmountFee", "AmountNet", "CompletedAt", "CreatedAt"
                FROM "Transactions"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcId = reader.GetGuid(0);
                    var newId = NewUlid();
                    transactionIdMap[srcId] = newId;

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            IF NOT EXISTS (SELECT 1 FROM [Transactions] WHERE [Id] = @Id)
                            INSERT INTO [Transactions] ([Id],[TenantId],[Name],[Description],[GatewayPaymentId],[PayeeName],[PayeeEmail],
                                [Status],[Type],[PaymentProvider],[PaymentMethod],[Amount],[AmountFee],[AmountNet],[CompletedAt],[CreatedAt])
                            VALUES (@Id,@TenantId,@Name,@Desc,@GwId,@PayeeName,@PayeeEmail,@Status,@Type,@Provider,@Method,@Amount,@Fee,@Net,@CompletedAt,@CreatedAt)
                            """,
                            ("@Id", newId),
                            ("@TenantId", tenantId),
                            ("@Name", reader.IsDBNull(1) ? "Transaction" : reader.GetString(1)),
                            ("@Desc", GetNullableString(reader, 2)),
                            ("@GwId", GetNullableString(reader, 3)),
                            ("@PayeeName", GetNullableString(reader, 4)),
                            ("@PayeeEmail", GetNullableString(reader, 5)),
                            ("@Status", MapTransactionStatus(reader.IsDBNull(6) ? null : reader.GetString(6))),
                            ("@Type", reader.IsDBNull(7) ? "Donation" : reader.GetString(7)),
                            ("@Provider", reader.IsDBNull(8) ? "PayFast" : reader.GetString(8)),
                            ("@Method", GetNullableString(reader, 9)),
                            ("@Amount", reader.IsDBNull(10) ? 0m : reader.GetDecimal(10)),
                            ("@Fee", reader.IsDBNull(11) ? DBNull.Value : reader.GetDecimal(11)),
                            ("@Net", reader.IsDBNull(12) ? DBNull.Value : reader.GetDecimal(12)),
                            ("@CompletedAt", reader.IsDBNull(13) ? DBNull.Value : reader.GetDateTime(13)),
                            ("@CreatedAt", reader.GetDateTime(14))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] Transactions: [bold]{transactionIdMap.Count}[/] records");

            // ========================================
            // 8. Donations
            // ========================================
            ctx.Status("Migrating Donations...");
            var donationCount = 0;
            using (var cmd = new NpgsqlCommand("""
                SELECT "Id", "TransactionId", "DonorProfileId", "IsRecurring", "Message",
                       "IsAnonymous", "DonatedAt", "CreatedAt"
                FROM "Donations"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcTxnId = reader.GetGuid(1);
                    if (!transactionIdMap.TryGetValue(srcTxnId, out var tgtTxnId)) continue;
                    donationCount++;

                    var srcDonorId = reader.IsDBNull(2) ? (Guid?)null : reader.GetGuid(2);
                    var tgtDonorId = srcDonorId.HasValue && donorProfileIdMap.TryGetValue(srcDonorId.Value, out var did) ? did : null;

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            INSERT INTO [Donations] ([Id],[TenantId],[TransactionId],[DonorProfileId],[IsRecurring],[Message],[IsAnonymous],[DonatedAt],[CreatedAt])
                            VALUES (@Id,@TenantId,@TxnId,@DonorId,@IsRecurring,@Message,@IsAnon,@DonatedAt,@CreatedAt)
                            """,
                            ("@Id", NewUlid()),
                            ("@TenantId", tenantId),
                            ("@TxnId", tgtTxnId),
                            ("@DonorId", (object?)tgtDonorId ?? DBNull.Value),
                            ("@IsRecurring", reader.IsDBNull(3) ? false : reader.GetBoolean(3)),
                            ("@Message", GetNullableString(reader, 4)),
                            ("@IsAnon", reader.IsDBNull(5) ? false : reader.GetBoolean(5)),
                            ("@DonatedAt", reader.IsDBNull(6) ? DBNull.Value : reader.GetDateTime(6)),
                            ("@CreatedAt", reader.GetDateTime(7))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] Donations: [bold]{donationCount}[/] records");

            // ========================================
            // 9. PaymentSubscriptions (from Subscriptions)
            // ========================================
            ctx.Status("Migrating Subscriptions...");
            using (var cmd = new NpgsqlCommand("""
                SELECT "Id", "DonorProfileId", "Token", "InitialAmount", "RecurringAmount",
                       "BillingDate", "Frequency", "Cycles", "NextRunDate", "Status",
                       "ItemName", "ItemDescription", "CancelledAt", "CompletedAt", "CreatedAt"
                FROM "Subscriptions"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcId = reader.GetGuid(0);
                    var newId = NewUlid();
                    subscriptionIdMap[srcId] = newId;

                    var srcDonorId = reader.IsDBNull(1) ? (Guid?)null : reader.GetGuid(1);
                    var tgtDonorId = srcDonorId.HasValue && donorProfileIdMap.TryGetValue(srcDonorId.Value, out var did) ? did : null;

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            IF NOT EXISTS (SELECT 1 FROM [PaymentSubscriptions] WHERE [Id] = @Id)
                            INSERT INTO [PaymentSubscriptions] ([Id],[TenantId],[DonorProfileId],[GatewayToken],[InitialAmount],[RecurringAmount],
                                [BillingDate],[Frequency],[Cycles],[NextRunDate],[Status],[ItemName],[ItemDescription],[CancelledAt],[CompletedAt],[CreatedAt])
                            VALUES (@Id,@TenantId,@DonorId,@Token,@InitAmt,@RecurAmt,@BillDate,@Freq,@Cycles,@NextRun,@Status,@ItemName,@ItemDesc,@CancelledAt,@CompletedAt,@CreatedAt)
                            """,
                            ("@Id", newId),
                            ("@TenantId", tenantId),
                            ("@DonorId", (object?)tgtDonorId ?? DBNull.Value),
                            ("@Token", GetNullableString(reader, 2)),
                            ("@InitAmt", reader.IsDBNull(3) ? 0m : reader.GetDecimal(3)),
                            ("@RecurAmt", reader.IsDBNull(4) ? 0m : reader.GetDecimal(4)),
                            ("@BillDate", reader.IsDBNull(5) ? 1 : reader.GetInt32(5)),
                            ("@Freq", reader.IsDBNull(6) ? 1 : reader.GetInt32(6)),
                            ("@Cycles", reader.IsDBNull(7) ? DBNull.Value : reader.GetInt32(7)),
                            ("@NextRun", reader.IsDBNull(8) ? DBNull.Value : reader.GetDateTime(8)),
                            ("@Status", MapSubscriptionStatus(reader.IsDBNull(9) ? null : reader.GetString(9))),
                            ("@ItemName", reader.IsDBNull(10) ? "Subscription" : reader.GetString(10)),
                            ("@ItemDesc", GetNullableString(reader, 11)),
                            ("@CancelledAt", reader.IsDBNull(12) ? DBNull.Value : reader.GetDateTime(12)),
                            ("@CompletedAt", reader.IsDBNull(13) ? DBNull.Value : reader.GetDateTime(13)),
                            ("@CreatedAt", reader.GetDateTime(14))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] PaymentSubscriptions: [bold]{subscriptionIdMap.Count}[/] records");

            // ========================================
            // 10. EndUsers (donors + applicants from Users)
            // ========================================
            ctx.Status("Migrating Users...");
            var endUserCount = 0;
            var tenantUserCount = 0;

            // First, get roles for each user
            var userRoles = new Dictionary<Guid, List<string>>();
            using (var cmd = new NpgsqlCommand("""
                SELECT ur."UserId", r."Name"
                FROM "UserRoles" ur
                JOIN "Roles" r ON ur."RoleId" = r."Id"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var userId = reader.GetGuid(0);
                    var roleName = reader.GetString(1);
                    if (!userRoles.ContainsKey(userId)) userRoles[userId] = [];
                    userRoles[userId].Add(roleName);
                }
            }

            // Admin/org roles → TenantUser; donor/applicant/anonymous → EndUser
            var adminRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "NPO", "COMPANY", "ADMIN", "SUPERADMIN", "APPLICATION_MANAGER",
                "REVIEWER", "APPROVER", "BLOG_EDITOR", "PAYMENT_MANAGER", "DATA_ANALYST"
            };

            using (var cmd = new NpgsqlCommand("""
                SELECT "Id", "Email", "PhoneNumber", "FirstName", "LastName",
                       "IsActive", "CreatedAt", "UserName"
                FROM "Users"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcId = reader.GetGuid(0);
                    var email = reader.IsDBNull(1) ? null : reader.GetString(1);
                    var phone = reader.IsDBNull(2) ? null : reader.GetString(2);
                    var firstName = reader.IsDBNull(3) ? null : reader.GetString(3);
                    var lastName = reader.IsDBNull(4) ? null : reader.GetString(4);
                    var isActive = reader.IsDBNull(5) ? true : reader.GetBoolean(5);
                    var createdAt = reader.GetDateTime(6);

                    var roles = userRoles.GetValueOrDefault(srcId) ?? [];
                    var isAdmin = roles.Any(r => adminRoles.Contains(r));

                    if (isAdmin)
                    {
                        // → TenantUser (references an AM User — AM user creation handled separately)
                        var newId = NewUlid();
                        userIdMap[srcId] = newId;
                        tenantUserCount++;

                        if (!dryRun)
                        {
                            // The UserId references an account-management User that must be created separately
                            // For now, use a placeholder UserId that matches the TenantUser Id
                            ExecuteInsert(tgtConn, """
                                IF NOT EXISTS (SELECT 1 FROM [TenantUsers] WHERE [Id] = @Id)
                                INSERT INTO [TenantUsers] ([Id],[TenantId],[UserId],[DisplayName],[IsActive],[CreatedAt])
                                VALUES (@Id,@TenantId,@UserId,@DisplayName,@IsActive,@CreatedAt)
                                """,
                                ("@Id", newId),
                                ("@TenantId", tenantId),
                                ("@UserId", newId), // Placeholder — link to AM user post-migration
                                ("@DisplayName", $"{firstName ?? ""} {lastName ?? ""}".Trim()),
                                ("@IsActive", isActive),
                                ("@CreatedAt", createdAt)
                            );

                            // Create RoleAssignments
                            foreach (var role in roles.Where(r => adminRoles.Contains(r)))
                            {
                                var frRole = MapToFundraiserRole(role);
                                if (frRole != null)
                                {
                                    ExecuteInsert(tgtConn, """
                                        INSERT INTO [RoleAssignments] ([TenantUserId],[Role],[AssignedAt])
                                        VALUES (@TenantUserId,@Role,@AssignedAt)
                                        """,
                                        ("@TenantUserId", newId),
                                        ("@Role", frRole),
                                        ("@AssignedAt", now)
                                    );
                                }
                            }
                        }
                    }
                    else
                    {
                        // → EndUser (donor/applicant/anonymous)
                        var newId = NewUlid();
                        userIdMap[srcId] = newId;
                        endUserCount++;

                        var userType = roles.Any(r => r.Equals("APPLICANT", StringComparison.OrdinalIgnoreCase))
                            ? "Applicant"
                            : roles.Any(r => r.Equals("DONOR", StringComparison.OrdinalIgnoreCase))
                                ? "Donor"
                                : "Anonymous";

                        // DonorProfile linkage handled after all EndUsers are created

                        if (!dryRun)
                        {
                            ExecuteInsert(tgtConn, """
                                IF NOT EXISTS (SELECT 1 FROM [EndUsers] WHERE [Id] = @Id)
                                INSERT INTO [EndUsers] ([Id],[TenantId],[Email],[PhoneNumber],[FirstName],[LastName],[Type],[IsVerified],[IsAnonymous],[VerificationAttempts],[CreatedAt])
                                VALUES (@Id,@TenantId,@Email,@Phone,@FirstName,@LastName,@Type,1,@IsAnon,0,@CreatedAt)
                                """,
                                ("@Id", newId),
                                ("@TenantId", tenantId),
                                ("@Email", (object?)email ?? DBNull.Value),
                                ("@Phone", (object?)phone ?? DBNull.Value),
                                ("@FirstName", (object?)firstName ?? DBNull.Value),
                                ("@LastName", (object?)lastName ?? DBNull.Value),
                                ("@Type", userType),
                                ("@IsAnon", string.IsNullOrEmpty(email) && string.IsNullOrEmpty(phone)),
                                ("@CreatedAt", createdAt)
                            );
                        }
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] TenantUsers (org admins): [bold]{tenantUserCount}[/] records");
            AnsiConsole.MarkupLine($"  [green]✓[/] EndUsers (donors/applicants): [bold]{endUserCount}[/] records");

            // Link EndUsers to DonorProfiles
            var linkedDonorCount = 0;
            using (var cmd = new NpgsqlCommand("""
                SELECT "Id", "UserId"
                FROM "DonorProfiles"
                WHERE "UserId" IS NOT NULL
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcDonorId = reader.GetGuid(0);
                    var srcUserId = reader.GetGuid(1);
                    if (!donorProfileIdMap.TryGetValue(srcDonorId, out var tgtDonorId)) continue;
                    if (!userIdMap.TryGetValue(srcUserId, out var tgtUserId)) continue;

                    if (!dryRun)
                    {
                        using var updateCmd = new SqlCommand(
                            "UPDATE [EndUsers] SET [DonorProfileId] = @DonorProfileId WHERE [Id] = @Id",
                            tgtConn);
                        updateCmd.Parameters.AddWithValue("@DonorProfileId", tgtDonorId);
                        updateCmd.Parameters.AddWithValue("@Id", tgtUserId);
                        updateCmd.ExecuteNonQuery();
                        linkedDonorCount++;
                    }
                }
            }
            if (linkedDonorCount > 0)
                AnsiConsole.MarkupLine($"  [green]✓[/] Linked EndUsers to DonorProfiles: [bold]{linkedDonorCount}[/]");

            // ========================================
            // 11. FormVersions + FormSections + FormFields + FormFlags + FormSelects
            // ========================================
            ctx.Status("Migrating Forms...");
            using (var cmd = new NpgsqlCommand("""
                SELECT "Id", "VersionNumber", "Name", "Description", "IsActive", "CreatedAt"
                FROM "FormVersions"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcId = reader.GetGuid(0);
                    var newId = NewUlid();
                    formVersionIdMap[srcId] = newId;

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            IF NOT EXISTS (SELECT 1 FROM [FormVersions] WHERE [Id] = @Id)
                            INSERT INTO [FormVersions] ([Id],[TenantId],[VersionNumber],[Name],[Description],[IsActive],[CreatedAt])
                            VALUES (@Id,@TenantId,@VersionNumber,@Name,@Desc,@IsActive,@CreatedAt)
                            """,
                            ("@Id", newId),
                            ("@TenantId", tenantId),
                            ("@VersionNumber", reader.IsDBNull(1) ? "1.0" : reader.GetString(1)),
                            ("@Name", reader.GetString(2)),
                            ("@Desc", GetNullableString(reader, 3)),
                            ("@IsActive", reader.GetBoolean(4)),
                            ("@CreatedAt", reader.GetDateTime(5))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] FormVersions: [bold]{formVersionIdMap.Count}[/] records");

            // FormSections
            var sectionCount = 0;
            using (var cmd = new NpgsqlCommand("""
                SELECT "Id", "FormVersionId", "Name", "Title", "Description", "DisplayOrder", "IsActive", "Icon"
                FROM "FormSections"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcId = reader.GetGuid(0);
                    var srcFormVersionId = reader.GetGuid(1);
                    if (!formVersionIdMap.TryGetValue(srcFormVersionId, out var tgtFormVersionId)) continue;

                    var newSectionId = Guid.NewGuid();
                    formSectionIdMap[srcId] = newSectionId;
                    sectionCount++;

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            INSERT INTO [FormSections] ([FormVersionId],[Id],[Name],[Title],[Description],[DisplayOrder],[IsActive],[Icon])
                            VALUES (@FormVersionId,@Id,@Name,@Title,@Desc,@Order,@IsActive,@Icon)
                            """,
                            ("@FormVersionId", tgtFormVersionId),
                            ("@Id", newSectionId),
                            ("@Name", reader.GetString(2)),
                            ("@Title", reader.IsDBNull(3) ? reader.GetString(2) : reader.GetString(3)),
                            ("@Desc", GetNullableString(reader, 4)),
                            ("@Order", reader.GetInt32(5)),
                            ("@IsActive", reader.IsDBNull(6) ? true : reader.GetBoolean(6)),
                            ("@Icon", GetNullableString(reader, 7))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] FormSections: [bold]{sectionCount}[/] records");

            // FormFlags (from ApplicationFlags + FlagFields)
            var flagCount = 0;
            using (var cmd = new NpgsqlCommand("""
                SELECT "Id", "SectionId", "Name", "Question", "DisplayOrder", "IsRequired", "HelpText"
                FROM "FlagFields"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcSectionId = reader.GetGuid(1);
                    if (!formSectionIdMap.TryGetValue(srcSectionId, out var tgtSectionId)) continue;

                    // Find the FormVersionId for this section
                    var tgtFormVersionId = GetFormVersionIdForSection(srcSectionId, formSectionIdMap, formVersionIdMap, srcConn);
                    if (tgtFormVersionId == null) continue;
                    flagCount++;

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            INSERT INTO [FormFlags] ([FormVersionId],[FormSectionId],[Id],[Name],[Question],[DisplayOrder],[IsRequired],[HelpText])
                            VALUES (@FormVersionId,@SectionId,@Id,@Name,@Question,@Order,@IsRequired,@HelpText)
                            """,
                            ("@FormVersionId", tgtFormVersionId),
                            ("@SectionId", tgtSectionId),
                            ("@Id", Guid.NewGuid()),
                            ("@Name", reader.GetString(2)),
                            ("@Question", reader.IsDBNull(3) ? reader.GetString(2) : reader.GetString(3)),
                            ("@Order", reader.IsDBNull(4) ? 0 : reader.GetInt32(4)),
                            ("@IsRequired", reader.IsDBNull(5) ? false : reader.GetBoolean(5)),
                            ("@HelpText", GetNullableString(reader, 6))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] FormFlags: [bold]{flagCount}[/] records");

            // FormSelectControls (from FormSectionSelects)
            var selectCount = 0;
            using (var cmd = new NpgsqlCommand("""
                SELECT "Id", "SectionId", "Name", "Label", "Options", "DisplayOrder", "IsRequired", "Placeholder"
                FROM "FormSectionSelects"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcSectionId = reader.GetGuid(1);
                    if (!formSectionIdMap.TryGetValue(srcSectionId, out var tgtSectionId)) continue;

                    var tgtFormVersionId = GetFormVersionIdForSection(srcSectionId, formSectionIdMap, formVersionIdMap, srcConn);
                    if (tgtFormVersionId == null) continue;
                    selectCount++;

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            INSERT INTO [FormSelectControls] ([FormVersionId],[FormSectionId],[Id],[Name],[Label],[Options],[DisplayOrder],[IsRequired],[Placeholder])
                            VALUES (@FormVersionId,@SectionId,@Id,@Name,@Label,@Options,@Order,@IsRequired,@Placeholder)
                            """,
                            ("@FormVersionId", tgtFormVersionId),
                            ("@SectionId", tgtSectionId),
                            ("@Id", Guid.NewGuid()),
                            ("@Name", reader.GetString(2)),
                            ("@Label", reader.IsDBNull(3) ? reader.GetString(2) : reader.GetString(3)),
                            ("@Options", GetNullableString(reader, 4)),
                            ("@Order", reader.IsDBNull(5) ? 0 : reader.GetInt32(5)),
                            ("@IsRequired", reader.IsDBNull(6) ? false : reader.GetBoolean(6)),
                            ("@Placeholder", GetNullableString(reader, 7))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] FormSelectControls: [bold]{selectCount}[/] records");

            // ========================================
            // 12. FundraisingApplications + FieldData + Documents
            // ========================================
            ctx.Status("Migrating Applications...");
            using (var cmd = new NpgsqlCommand("""
                SELECT "Id", "StoryId", "FormVersionId", "Status", "Priority",
                       "InternalNotes", "SubmittedAt", "ReviewedAt", "CreatedAt"
                FROM "Applications"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcId = reader.GetGuid(0);
                    var newId = NewUlid();
                    applicationIdMap[srcId] = newId;

                    var srcStoryId = reader.IsDBNull(1) ? (Guid?)null : reader.GetGuid(1);
                    var tgtCampaignId = srcStoryId.HasValue && campaignIdMap.TryGetValue(srcStoryId.Value, out var cid) ? cid : campaignIdMap.Values.FirstOrDefault();

                    var srcFormVersionId = reader.IsDBNull(2) ? (Guid?)null : reader.GetGuid(2);
                    var tgtFormVersionId = srcFormVersionId.HasValue && formVersionIdMap.TryGetValue(srcFormVersionId.Value, out var fvid) ? fvid : null;

                    if (!dryRun && tgtCampaignId != null)
                    {
                        ExecuteInsert(tgtConn, """
                            IF NOT EXISTS (SELECT 1 FROM [FundraisingApplications] WHERE [Id] = @Id)
                            INSERT INTO [FundraisingApplications] ([Id],[TenantId],[CampaignId],[FormVersionId],[Status],[Priority],[InternalNotes],[SubmittedAt],[ReviewedAt],[CreatedAt])
                            VALUES (@Id,@TenantId,@CampaignId,@FormVersionId,@Status,@Priority,@Notes,@SubmittedAt,@ReviewedAt,@CreatedAt)
                            """,
                            ("@Id", newId),
                            ("@TenantId", tenantId),
                            ("@CampaignId", tgtCampaignId),
                            ("@FormVersionId", (object?)tgtFormVersionId ?? DBNull.Value),
                            ("@Status", MapApplicationStatus(reader.IsDBNull(3) ? null : reader.GetString(3))),
                            ("@Priority", reader.IsDBNull(4) ? 0 : reader.GetInt32(4)),
                            ("@Notes", GetNullableString(reader, 5)),
                            ("@SubmittedAt", reader.IsDBNull(6) ? DBNull.Value : reader.GetDateTime(6)),
                            ("@ReviewedAt", reader.IsDBNull(7) ? DBNull.Value : reader.GetDateTime(7)),
                            ("@CreatedAt", reader.GetDateTime(8))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] FundraisingApplications: [bold]{applicationIdMap.Count}[/] records");

            // ApplicationFieldData (from UserApplicationFieldData)
            var fieldDataCount = 0;
            using (var cmd = new NpgsqlCommand("""
                SELECT "ApplicationId", "FieldName", "FieldValue", "FieldType", "UpdatedAt"
                FROM "UserApplicationFieldData"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcAppId = reader.GetGuid(0);
                    if (!applicationIdMap.TryGetValue(srcAppId, out var tgtAppId)) continue;
                    fieldDataCount++;

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            INSERT INTO [ApplicationFieldData] ([FundraisingApplicationId],[Id],[FieldName],[FieldValue],[FieldType],[UpdatedAt])
                            VALUES (@AppId,@Id,@FieldName,@FieldValue,@FieldType,@UpdatedAt)
                            """,
                            ("@AppId", tgtAppId),
                            ("@Id", Guid.NewGuid()),
                            ("@FieldName", reader.GetString(1)),
                            ("@FieldValue", GetNullableString(reader, 2)),
                            ("@FieldType", GetNullableString(reader, 3)),
                            ("@UpdatedAt", reader.IsDBNull(4) ? DateTime.UtcNow : reader.GetDateTime(4))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] ApplicationFieldData: [bold]{fieldDataCount}[/] records");

            // ApplicationDocuments (from UserDocuments)
            var docCount = 0;
            using (var cmd = new NpgsqlCommand("""
                SELECT "ApplicationId", "FileName", "BlobUrl", "BlobName", "ContentType", "FileSize", "UploadedAt"
                FROM "UserDocuments"
                """, srcConn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    var srcAppId = reader.IsDBNull(0) ? (Guid?)null : reader.GetGuid(0);
                    if (!srcAppId.HasValue || !applicationIdMap.TryGetValue(srcAppId.Value, out var tgtAppId)) continue;
                    docCount++;

                    if (!dryRun)
                    {
                        ExecuteInsert(tgtConn, """
                            INSERT INTO [ApplicationDocuments] ([FundraisingApplicationId],[Id],[FileName],[BlobUrl],[BlobName],[MimeType],[FileSizeBytes],[UploadedAt])
                            VALUES (@AppId,@Id,@FileName,@BlobUrl,@BlobName,@MimeType,@FileSize,@UploadedAt)
                            """,
                            ("@AppId", tgtAppId),
                            ("@Id", Guid.NewGuid()),
                            ("@FileName", reader.IsDBNull(1) ? "document" : reader.GetString(1)),
                            ("@BlobUrl", reader.IsDBNull(2) ? "" : reader.GetString(2)),
                            ("@BlobName", reader.IsDBNull(3) ? "" : reader.GetString(3)),
                            ("@MimeType", reader.IsDBNull(4) ? "application/octet-stream" : reader.GetString(4)),
                            ("@FileSize", reader.IsDBNull(5) ? 0L : reader.GetInt64(5)),
                            ("@UploadedAt", reader.IsDBNull(6) ? DateTime.UtcNow : reader.GetDateTime(6))
                        );
                    }
                }
            }
            AnsiConsole.MarkupLine($"  [green]✓[/] ApplicationDocuments: [bold]{docCount}[/] records");
        });

        // Summary
        AnsiConsole.WriteLine();
        var summaryTable = new Table()
            .AddColumn("Entity")
            .AddColumn("Count");

        summaryTable.AddRow("Branches", branchIdMap.Count.ToString());
        summaryTable.AddRow("Campaigns", campaignIdMap.Count.ToString());
        summaryTable.AddRow("BlogCategories", blogCategoryIdMap.Count.ToString());
        summaryTable.AddRow("BlogPosts", blogPostIdMap.Count.ToString());
        summaryTable.AddRow("FundraisingEvents", eventIdMap.Count.ToString());
        summaryTable.AddRow("QRCodes", qrCodeIdMap.Count.ToString());
        summaryTable.AddRow("DonorProfiles", donorProfileIdMap.Count.ToString());
        summaryTable.AddRow("Transactions", transactionIdMap.Count.ToString());
        summaryTable.AddRow("PaymentSubscriptions", subscriptionIdMap.Count.ToString());
        summaryTable.AddRow("TenantUsers", $"{userIdMap.Count(kvp => true)}");
        summaryTable.AddRow("FormVersions", formVersionIdMap.Count.ToString());
        summaryTable.AddRow("FundraisingApplications", applicationIdMap.Count.ToString());

        AnsiConsole.Write(summaryTable);

        if (dryRun)
            AnsiConsole.MarkupLine("\n[yellow]DRY RUN complete — no data was written.[/]");
        else
            AnsiConsole.MarkupLine("\n[bold green]Migration complete![/]");
    }

    // ========================================
    // Helpers
    // ========================================

    private static string NewUlid() => Ulid.NewUlid().ToString();

    private static object GetNullableString(NpgsqlDataReader reader, int ordinal)
        => reader.IsDBNull(ordinal) ? DBNull.Value : reader.GetString(ordinal);

    private static object GetNullableString(SqlDataReader reader, int ordinal)
        => reader.IsDBNull(ordinal) ? DBNull.Value : reader.GetString(ordinal);

    private static void ExecuteInsert(SqlConnection conn, string sql, params (string name, object value)[] parameters)
    {
        using var cmd = new SqlCommand(sql, conn);
        cmd.CommandTimeout = 30;
        foreach (var (name, value) in parameters)
        {
            cmd.Parameters.AddWithValue(name, value ?? DBNull.Value);
        }
        cmd.ExecuteNonQuery();
    }

    private static string? GetFormVersionIdForSection(
        Guid srcSectionId,
        Dictionary<Guid, Guid> sectionMap,
        Dictionary<Guid, string> formVersionMap,
        NpgsqlConnection srcConn)
    {
        using var cmd = new NpgsqlCommand("""
            SELECT "FormVersionId" FROM "FormSections" WHERE "Id" = @Id
            """, srcConn);
        cmd.Parameters.AddWithValue("@Id", srcSectionId);
        var result = cmd.ExecuteScalar();
        if (result is Guid fvId && formVersionMap.TryGetValue(fvId, out var tgtFvId))
            return tgtFvId;
        return null;
    }

    private static string Slugify(string text)
    {
        return text.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("_", "-")
            .Replace(".", "-")
            .Replace("&", "and");
    }

    private static string MaskPassword(string connectionString)
    {
        // Simple password masking for display
        var parts = connectionString.Split(';');
        return string.Join(';', parts.Select(p =>
            p.TrimStart().StartsWith("Password", StringComparison.OrdinalIgnoreCase)
                ? "Password=***"
                : p));
    }

    // Status mapping helpers
    private static string MapCampaignStatus(string? status) => status?.ToUpperInvariant() switch
    {
        "ACTIVE" or "PUBLISHED" => "Active",
        "DRAFT" => "Draft",
        "COMPLETED" or "CLOSED" => "Completed",
        "ARCHIVED" => "Archived",
        "PENDING" => "PendingReview",
        _ => "Draft"
    };

    private static string MapBlogStatus(string? status) => status?.ToUpperInvariant() switch
    {
        "PUBLISHED" or "ACTIVE" => "Published",
        "DRAFT" => "Draft",
        "ARCHIVED" => "Archived",
        _ => "Draft"
    };

    private static string MapTransactionStatus(string? status) => status?.ToUpperInvariant() switch
    {
        "COMPLETED" or "COMPLETE" or "SUCCESS" => "Completed",
        "PENDING" => "Pending",
        "FAILED" or "FAILURE" => "Failed",
        "CANCELLED" or "CANCELED" => "Cancelled",
        "REFUNDED" => "Refunded",
        _ => "Pending"
    };

    private static string MapSubscriptionStatus(string? status) => status?.ToUpperInvariant() switch
    {
        "ACTIVE" => "Active",
        "PAUSED" or "SUSPENDED" => "Paused",
        "CANCELLED" or "CANCELED" => "Cancelled",
        "COMPLETED" => "Completed",
        _ => "Active"
    };

    private static string MapEventStatus(string? status) => status?.ToUpperInvariant() switch
    {
        "ACTIVE" or "UPCOMING" => "Upcoming",
        "ONGOING" or "IN_PROGRESS" => "InProgress",
        "COMPLETED" or "PAST" => "Completed",
        "CANCELLED" or "CANCELED" => "Cancelled",
        _ => "Upcoming"
    };

    private static string MapApplicationStatus(string? status) => status?.ToUpperInvariant() switch
    {
        "SUBMITTED" => "Submitted",
        "UNDER_REVIEW" or "IN_REVIEW" => "UnderReview",
        "APPROVED" => "Approved",
        "REJECTED" or "DECLINED" => "Rejected",
        "PENDING" or "DRAFT" => "Draft",
        "WAITLISTED" => "Waitlisted",
        _ => "Draft"
    };

    private static string? MapToFundraiserRole(string gosRole) => gosRole.ToUpperInvariant() switch
    {
        "NPO" or "COMPANY" or "ADMIN" or "SUPERADMIN" => "Admin",
        "APPLICATION_MANAGER" => "ApplicationManager",
        "REVIEWER" => "Reviewer",
        "APPROVER" => "Approver",
        "BLOG_EDITOR" => "BlogEditor",
        "PAYMENT_MANAGER" => "PaymentManager",
        "DATA_ANALYST" => "DataAnalyst",
        _ => null
    };
}
