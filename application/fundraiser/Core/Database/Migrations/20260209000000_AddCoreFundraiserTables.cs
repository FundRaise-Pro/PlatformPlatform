using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PlatformPlatform.Fundraiser.Database;

namespace PlatformPlatform.Fundraiser.Database.Migrations;

[DbContext(typeof(FundraiserDbContext))]
[Migration("20260209000000_AddCoreFundraiserTables")]
public sealed class AddCoreFundraiserTables : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            -- ================================================================
            -- Phase 9 Step 0: Create all missing core fundraiser tables
            -- 11 aggregate-root tables + 9 owned-entity tables + indexes
            -- ================================================================

            -- 1. Branches (no FK dependencies)
            IF OBJECT_ID(N'[Branches]', N'U') IS NULL
            BEGIN
                CREATE TABLE [Branches]
                (
                    [Id]            [varchar](32)       NOT NULL,
                    [TenantId]      [bigint]            NOT NULL,
                    [Name]          [nvarchar](200)     NOT NULL,
                    [AddressLine1]  [nvarchar](300)     NOT NULL,
                    [AddressLine2]  [nvarchar](300)     NULL,
                    [Area]          [nvarchar](100)     NULL,
                    [Suburb]        [nvarchar](100)     NULL,
                    [City]          [nvarchar](100)     NOT NULL,
                    [State]         [nvarchar](100)     NOT NULL,
                    [PostalCode]    [nvarchar](20)      NOT NULL,
                    [Country]       [nvarchar](100)     NULL,
                    [Latitude]      [float]             NULL,
                    [Longitude]     [float]             NULL,
                    [GoogleMapsUrl] [nvarchar](500)     NULL,
                    [AppleMapsUrl]  [nvarchar](500)     NULL,
                    [PhoneNumber]   [nvarchar](30)      NULL,
                    [CreatedAt]     [datetimeoffset]     NOT NULL,
                    [ModifiedAt]    [datetimeoffset]     NULL,
                    CONSTRAINT [PK_Branches] PRIMARY KEY ([Id])
                );
            END;

            -- 1a. BranchServices (owned by Branch)
            IF OBJECT_ID(N'[BranchServices]', N'U') IS NULL
            BEGIN
                CREATE TABLE [BranchServices]
                (
                    [BranchId]      [varchar](32)       NOT NULL,
                    [Id]            [int] IDENTITY(1,1) NOT NULL,
                    [Description]   [nvarchar](500)     NULL,
                    CONSTRAINT [PK_BranchServices] PRIMARY KEY ([BranchId], [Id]),
                    CONSTRAINT [FK_BranchServices_Branches_BranchId]
                        FOREIGN KEY ([BranchId]) REFERENCES [Branches]([Id]) ON DELETE CASCADE
                );
            END;

            -- 2. Campaigns
            IF OBJECT_ID(N'[Campaigns]', N'U') IS NULL
            BEGIN
                CREATE TABLE [Campaigns]
                (
                    [Id]                [varchar](32)       NOT NULL,
                    [TenantId]          [bigint]            NOT NULL,
                    [Title]             [nvarchar](200)     NOT NULL,
                    [Content]           [nvarchar](max)     NOT NULL,
                    [Summary]           [nvarchar](2000)    NULL,
                    [FeaturedImageUrl]  [nvarchar](500)     NULL,
                    [ExternalFundingUrl][nvarchar](500)     NULL,
                    [Status]            [nvarchar](50)      NOT NULL,
                    [IsPrivate]         [bit]               NOT NULL,
                    [PublishedAt]       [datetime2]         NULL,
                    [ScreeningDate]     [datetime2]         NULL,
                    [CreatedAt]         [datetimeoffset]     NOT NULL,
                    [ModifiedAt]        [datetimeoffset]     NULL,
                    CONSTRAINT [PK_Campaigns] PRIMARY KEY ([Id])
                );
            END;

            -- 2a. CampaignImages (owned by Campaign)
            IF OBJECT_ID(N'[CampaignImages]', N'U') IS NULL
            BEGIN
                CREATE TABLE [CampaignImages]
                (
                    [CampaignId]    [varchar](32)           NOT NULL,
                    [Id]            [uniqueidentifier]      NOT NULL,
                    [BlobUrl]       [nvarchar](1000)        NOT NULL,
                    [BlobName]      [nvarchar](500)         NOT NULL,
                    [MimeType]      [nvarchar](100)         NOT NULL,
                    [FileSizeBytes] [bigint]                NOT NULL,
                    [UploadedAt]    [datetime2]             NOT NULL,
                    CONSTRAINT [PK_CampaignImages] PRIMARY KEY ([CampaignId], [Id]),
                    CONSTRAINT [FK_CampaignImages_Campaigns_CampaignId]
                        FOREIGN KEY ([CampaignId]) REFERENCES [Campaigns]([Id]) ON DELETE CASCADE
                );
            END;

            -- 2b. CampaignTags (owned by Campaign)
            IF OBJECT_ID(N'[CampaignTags]', N'U') IS NULL
            BEGIN
                CREATE TABLE [CampaignTags]
                (
                    [CampaignId]    [varchar](32)       NOT NULL,
                    [Id]            [int] IDENTITY(1,1) NOT NULL,
                    [Tag]           [nvarchar](50)      NOT NULL,
                    CONSTRAINT [PK_CampaignTags] PRIMARY KEY ([CampaignId], [Id]),
                    CONSTRAINT [FK_CampaignTags_Campaigns_CampaignId]
                        FOREIGN KEY ([CampaignId]) REFERENCES [Campaigns]([Id]) ON DELETE CASCADE
                );
            END;

            -- 3. DonorProfiles
            IF OBJECT_ID(N'[DonorProfiles]', N'U') IS NULL
            BEGIN
                CREATE TABLE [DonorProfiles]
                (
                    [Id]                        [varchar](32)       NOT NULL,
                    [TenantId]                  [bigint]            NOT NULL,
                    [TaxIdNumber]               [nvarchar](50)      NULL,
                    [CompanyRegistration]       [nvarchar](100)     NULL,
                    [CompanyName]               [nvarchar](200)     NULL,
                    [IsCompany]                 [bit]               NOT NULL,
                    [StreetAddress]             [nvarchar](300)     NULL,
                    [Suburb]                    [nvarchar](100)     NULL,
                    [City]                      [nvarchar](100)     NULL,
                    [Province]                  [nvarchar](100)     NULL,
                    [PostalCode]                [nvarchar](20)      NULL,
                    [Country]                   [nvarchar](100)     NOT NULL DEFAULT N'South Africa',
                    [PreferEmailCommunication]  [bit]               NOT NULL DEFAULT 1,
                    [PreferSmsCommunication]    [bit]               NOT NULL DEFAULT 0,
                    [CreatedAt]                 [datetimeoffset]     NOT NULL,
                    [ModifiedAt]                [datetimeoffset]     NULL,
                    CONSTRAINT [PK_DonorProfiles] PRIMARY KEY ([Id])
                );
            END;

            -- 4. Transactions
            IF OBJECT_ID(N'[Transactions]', N'U') IS NULL
            BEGIN
                CREATE TABLE [Transactions]
                (
                    [Id]                [varchar](32)       NOT NULL,
                    [TenantId]          [bigint]            NOT NULL,
                    [Name]              [nvarchar](200)     NOT NULL,
                    [Description]       [nvarchar](1000)    NULL,
                    [GatewayPaymentId]  [nvarchar](200)     NULL,
                    [PayeeName]         [nvarchar](200)     NULL,
                    [PayeeEmail]        [nvarchar](200)     NULL,
                    [Status]            [nvarchar](50)      NOT NULL,
                    [Type]              [nvarchar](50)      NOT NULL,
                    [PaymentProvider]   [nvarchar](50)      NOT NULL,
                    [PaymentMethod]     [nvarchar](50)      NULL,
                    [Amount]            [decimal](18,2)     NOT NULL,
                    [AmountFee]         [decimal](18,2)     NULL,
                    [AmountNet]         [decimal](18,2)     NULL,
                    [CompletedAt]       [datetime2]         NULL,
                    [CreatedAt]         [datetimeoffset]     NOT NULL,
                    [ModifiedAt]        [datetimeoffset]     NULL,
                    CONSTRAINT [PK_Transactions] PRIMARY KEY ([Id])
                );
            END;

            -- 4a. PaymentProcessingLogs (owned by Transaction)
            IF OBJECT_ID(N'[PaymentProcessingLogs]', N'U') IS NULL
            BEGIN
                CREATE TABLE [PaymentProcessingLogs]
                (
                    [TransactionId]  [varchar](32)       NOT NULL,
                    [Id]             [uniqueidentifier]   NOT NULL,
                    [PreviousStatus] [nvarchar](50)       NULL,
                    [NewStatus]      [nvarchar](50)       NULL,
                    [CreatedAt]      [datetime2]          NOT NULL,
                    CONSTRAINT [PK_PaymentProcessingLogs] PRIMARY KEY ([TransactionId], [Id]),
                    CONSTRAINT [FK_PaymentProcessingLogs_Transactions_TransactionId]
                        FOREIGN KEY ([TransactionId]) REFERENCES [Transactions]([Id]) ON DELETE CASCADE
                );
            END;

            -- 5. Donations
            IF OBJECT_ID(N'[Donations]', N'U') IS NULL
            BEGIN
                CREATE TABLE [Donations]
                (
                    [Id]              [varchar](32)       NOT NULL,
                    [TenantId]        [bigint]            NOT NULL,
                    [TransactionId]   [varchar](32)       NOT NULL,
                    [DonorProfileId]  [varchar](32)       NULL,
                    [IsRecurring]     [bit]               NOT NULL,
                    [Message]         [nvarchar](1000)    NULL,
                    [IsAnonymous]     [bit]               NOT NULL,
                    [DonatedAt]       [datetime2]         NULL,
                    [CreatedAt]       [datetimeoffset]     NOT NULL,
                    [ModifiedAt]      [datetimeoffset]     NULL,
                    CONSTRAINT [PK_Donations] PRIMARY KEY ([Id])
                );
            END;

            -- 6. PaymentSubscriptions
            IF OBJECT_ID(N'[PaymentSubscriptions]', N'U') IS NULL
            BEGIN
                CREATE TABLE [PaymentSubscriptions]
                (
                    [Id]              [varchar](32)       NOT NULL,
                    [TenantId]        [bigint]            NOT NULL,
                    [DonorProfileId]  [varchar](32)       NULL,
                    [GatewayToken]    [nvarchar](500)     NULL,
                    [InitialAmount]   [decimal](18,2)     NOT NULL,
                    [RecurringAmount] [decimal](18,2)     NOT NULL,
                    [Currency]        [nvarchar](10)      NOT NULL DEFAULT N'ZAR',
                    [BillingDate]     [int]               NOT NULL,
                    [Frequency]       [int]               NOT NULL DEFAULT 1,
                    [Cycles]          [int]               NULL,
                    [NextRunDate]     [datetime2]         NULL,
                    [Status]          [nvarchar](50)      NOT NULL,
                    [ItemName]        [nvarchar](200)     NOT NULL,
                    [ItemDescription] [nvarchar](1000)    NULL,
                    [CancelledAt]     [datetime2]         NULL,
                    [CompletedAt]     [datetime2]         NULL,
                    [CreatedAt]       [datetimeoffset]     NOT NULL,
                    [ModifiedAt]      [datetimeoffset]     NULL,
                    CONSTRAINT [PK_PaymentSubscriptions] PRIMARY KEY ([Id])
                );
            END;

            -- 7. EndUsers
            IF OBJECT_ID(N'[EndUsers]', N'U') IS NULL
            BEGIN
                CREATE TABLE [EndUsers]
                (
                    [Id]                      [varchar](32)       NOT NULL,
                    [TenantId]                [bigint]            NOT NULL,
                    [Email]                   [nvarchar](254)     NULL,
                    [PhoneNumber]             [nvarchar](20)      NULL,
                    [FirstName]               [nvarchar](100)     NULL,
                    [LastName]                [nvarchar](100)     NULL,
                    [ExternalId]              [nvarchar](256)     NULL,
                    [SocialProvider]          [nvarchar](50)      NULL,
                    [Type]                    [nvarchar](20)      NOT NULL,
                    [IsVerified]              [bit]               NOT NULL,
                    [IsAnonymous]             [bit]               NOT NULL,
                    [VerificationCodeHash]    [nvarchar](256)     NULL,
                    [VerificationAttempts]    [int]               NOT NULL DEFAULT 0,
                    [VerificationCodeExpiry]  [datetimeoffset]    NULL,
                    [LastActiveAt]            [datetimeoffset]    NULL,
                    [DonorProfileId]          [nvarchar](50)      NULL,
                    [CreatedAt]               [datetimeoffset]     NOT NULL,
                    [ModifiedAt]              [datetimeoffset]     NULL,
                    CONSTRAINT [PK_EndUsers] PRIMARY KEY ([Id])
                );
            END;

            -- 8. TenantUsers
            IF OBJECT_ID(N'[TenantUsers]', N'U') IS NULL
            BEGIN
                CREATE TABLE [TenantUsers]
                (
                    [Id]              [varchar](32)       NOT NULL,
                    [TenantId]        [bigint]            NOT NULL,
                    [UserId]          [varchar](32)       NOT NULL,
                    [DisplayName]     [nvarchar](200)     NULL,
                    [IsActive]        [bit]               NOT NULL DEFAULT 1,
                    [PrimaryBranchId] [nvarchar](50)      NULL,
                    [CreatedAt]       [datetimeoffset]     NOT NULL,
                    [ModifiedAt]      [datetimeoffset]     NULL,
                    CONSTRAINT [PK_TenantUsers] PRIMARY KEY ([Id])
                );
            END;

            -- 8a. RoleAssignments (owned by TenantUser — HasKey(r => r.Id))
            IF OBJECT_ID(N'[RoleAssignments]', N'U') IS NULL
            BEGIN
                CREATE TABLE [RoleAssignments]
                (
                    [Id]              [int] IDENTITY(1,1) NOT NULL,
                    [TenantUserId]    [varchar](32)       NOT NULL,
                    [Role]            [nvarchar](50)      NOT NULL,
                    [ScopedBranchId]  [nvarchar](50)      NULL,
                    [AssignedAt]      [datetimeoffset]     NOT NULL,
                    CONSTRAINT [PK_RoleAssignments] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_RoleAssignments_TenantUsers_TenantUserId]
                        FOREIGN KEY ([TenantUserId]) REFERENCES [TenantUsers]([Id]) ON DELETE CASCADE
                );
            END;

            -- 9. FundraisingApplications
            IF OBJECT_ID(N'[FundraisingApplications]', N'U') IS NULL
            BEGIN
                CREATE TABLE [FundraisingApplications]
                (
                    [Id]                      [varchar](32)       NOT NULL,
                    [TenantId]                [bigint]            NOT NULL,
                    [CampaignId]              [varchar](32)       NOT NULL,
                    [FormVersionId]           [varchar](32)       NULL,
                    [Status]                  [nvarchar](50)      NOT NULL,
                    [IsMutable]               [bit]               NOT NULL DEFAULT 1,
                    [Priority]                [int]               NOT NULL DEFAULT 0,
                    [InternalNotes]           [nvarchar](500)     NULL,
                    [ReviewNotes]             [nvarchar](2000)    NULL,
                    [SubmittedAt]             [datetime2]         NULL,
                    [ReviewedAt]              [datetime2]         NULL,
                    [CurrentReviewStage]      [nvarchar](50)      NULL,
                    [ReviewsCompletedCount]   [int]               NOT NULL DEFAULT 0,
                    [ReviewsPendingCount]     [int]               NOT NULL DEFAULT 0,
                    [RequiresEscalation]      [bit]               NOT NULL DEFAULT 0,
                    [CreatedAt]               [datetimeoffset]     NOT NULL,
                    [ModifiedAt]              [datetimeoffset]     NULL,
                    CONSTRAINT [PK_FundraisingApplications] PRIMARY KEY ([Id])
                );
            END;

            -- 9a. ApplicationFieldData (owned by FundraisingApplication)
            IF OBJECT_ID(N'[ApplicationFieldData]', N'U') IS NULL
            BEGIN
                CREATE TABLE [ApplicationFieldData]
                (
                    [FundraisingApplicationId] [varchar](32)       NOT NULL,
                    [Id]                       [uniqueidentifier]  NOT NULL,
                    [FieldName]                [nvarchar](100)     NOT NULL,
                    [FieldValue]               [nvarchar](2000)    NULL,
                    [FieldType]                [nvarchar](50)      NULL,
                    [UpdatedAt]                [datetime2]         NOT NULL,
                    CONSTRAINT [PK_ApplicationFieldData] PRIMARY KEY ([FundraisingApplicationId], [Id]),
                    CONSTRAINT [FK_ApplicationFieldData_FundraisingApplications]
                        FOREIGN KEY ([FundraisingApplicationId]) REFERENCES [FundraisingApplications]([Id]) ON DELETE CASCADE
                );
            END;

            -- 9b. ApplicationReviews (owned by FundraisingApplication)
            IF OBJECT_ID(N'[ApplicationReviews]', N'U') IS NULL
            BEGIN
                CREATE TABLE [ApplicationReviews]
                (
                    [FundraisingApplicationId] [varchar](32)       NOT NULL,
                    [Id]                       [uniqueidentifier]  NOT NULL,
                    [Stage]                    [nvarchar](50)      NOT NULL,
                    [ReviewType]               [nvarchar](50)      NOT NULL,
                    [Decision]                 [nvarchar](50)      NOT NULL,
                    [Notes]                    [nvarchar](2000)    NOT NULL,
                    [InternalNotes]            [nvarchar](500)     NULL,
                    [PriorityScore]            [int]               NOT NULL DEFAULT 0,
                    [ConfidenceLevel]          [int]               NOT NULL DEFAULT 5,
                    [IsEscalated]              [bit]               NOT NULL DEFAULT 0,
                    [ReviewedAt]               [datetime2]         NOT NULL,
                    [TimeSpentSeconds]         [int]               NULL,
                    CONSTRAINT [PK_ApplicationReviews] PRIMARY KEY ([FundraisingApplicationId], [Id]),
                    CONSTRAINT [FK_ApplicationReviews_FundraisingApplications]
                        FOREIGN KEY ([FundraisingApplicationId]) REFERENCES [FundraisingApplications]([Id]) ON DELETE CASCADE
                );
            END;

            -- 9c. ApplicationDocuments (owned by FundraisingApplication)
            IF OBJECT_ID(N'[ApplicationDocuments]', N'U') IS NULL
            BEGIN
                CREATE TABLE [ApplicationDocuments]
                (
                    [FundraisingApplicationId] [varchar](32)       NOT NULL,
                    [Id]                       [uniqueidentifier]  NOT NULL,
                    [FileName]                 [nvarchar](255)     NOT NULL,
                    [BlobUrl]                  [nvarchar](1000)    NOT NULL,
                    [BlobName]                 [nvarchar](500)     NOT NULL,
                    [MimeType]                 [nvarchar](100)     NOT NULL,
                    [FileSizeBytes]            [bigint]            NOT NULL,
                    [UploadedAt]               [datetime2]         NOT NULL,
                    CONSTRAINT [PK_ApplicationDocuments] PRIMARY KEY ([FundraisingApplicationId], [Id]),
                    CONSTRAINT [FK_ApplicationDocuments_FundraisingApplications]
                        FOREIGN KEY ([FundraisingApplicationId]) REFERENCES [FundraisingApplications]([Id]) ON DELETE CASCADE
                );
            END;

            -- 10. FundraisingEvents
            IF OBJECT_ID(N'[FundraisingEvents]', N'U') IS NULL
            BEGIN
                CREATE TABLE [FundraisingEvents]
                (
                    [Id]            [varchar](32)       NOT NULL,
                    [TenantId]      [bigint]            NOT NULL,
                    [Name]          [nvarchar](200)     NOT NULL,
                    [Description]   [nvarchar](max)     NOT NULL,
                    [EventDate]     [datetime2]         NOT NULL,
                    [Location]      [nvarchar](300)     NULL,
                    [TargetAmount]  [decimal](18,2)     NOT NULL,
                    [RaisedAmount]  [decimal](18,2)     NOT NULL DEFAULT 0,
                    [Status]        [nvarchar](50)      NOT NULL,
                    [ImageUrl]      [nvarchar](500)     NULL,
                    [CreatedAt]     [datetimeoffset]     NOT NULL,
                    [ModifiedAt]    [datetimeoffset]     NULL,
                    CONSTRAINT [PK_FundraisingEvents] PRIMARY KEY ([Id])
                );
            END;

            -- 11. QRCodes
            IF OBJECT_ID(N'[QRCodes]', N'U') IS NULL
            BEGIN
                CREATE TABLE [QRCodes]
                (
                    [Id]              [varchar](32)       NOT NULL,
                    [TenantId]        [bigint]            NOT NULL,
                    [Name]            [nvarchar](200)     NOT NULL,
                    [RedirectUrl]     [nvarchar](1000)    NOT NULL,
                    [IsActive]        [bit]               NOT NULL DEFAULT 1,
                    [QRCodeType]      [nvarchar](50)      NOT NULL,
                    [HitCount]        [int]               NOT NULL DEFAULT 0,
                    [QRCodeImageUrl]  [nvarchar](1000)    NULL,
                    [CreatedAt]       [datetimeoffset]     NOT NULL,
                    [ModifiedAt]      [datetimeoffset]     NULL,
                    CONSTRAINT [PK_QRCodes] PRIMARY KEY ([Id])
                );
            END;

            -- 11a. QRCodeHits (owned by QRCode)
            IF OBJECT_ID(N'[QRCodeHits]', N'U') IS NULL
            BEGIN
                CREATE TABLE [QRCodeHits]
                (
                    [QRCodeId]   [varchar](32)       NOT NULL,
                    [Id]         [uniqueidentifier]   NOT NULL,
                    [HitAt]      [datetime2]          NOT NULL,
                    [UserAgent]  [nvarchar](500)      NULL,
                    [Referrer]   [nvarchar](500)      NULL,
                    [IpAddress]  [nvarchar](45)       NULL,
                    CONSTRAINT [PK_QRCodeHits] PRIMARY KEY ([QRCodeId], [Id]),
                    CONSTRAINT [FK_QRCodeHits_QRCodes_QRCodeId]
                        FOREIGN KEY ([QRCodeId]) REFERENCES [QRCodes]([Id]) ON DELETE CASCADE
                );
            END;

            -- ================================================================
            -- Indexes
            -- ================================================================

            -- EndUsers: unique email per tenant (filtered)
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_EndUsers_TenantId_Email' AND object_id = OBJECT_ID(N'[EndUsers]'))
            BEGIN
                CREATE UNIQUE INDEX [IX_EndUsers_TenantId_Email]
                    ON [EndUsers] ([TenantId], [Email])
                    WHERE [Email] IS NOT NULL;
            END;

            -- EndUsers: phone lookup per tenant (filtered)
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_EndUsers_TenantId_PhoneNumber' AND object_id = OBJECT_ID(N'[EndUsers]'))
            BEGIN
                CREATE INDEX [IX_EndUsers_TenantId_PhoneNumber]
                    ON [EndUsers] ([TenantId], [PhoneNumber])
                    WHERE [PhoneNumber] IS NOT NULL;
            END;

            -- EndUsers: unique social login per tenant (filtered)
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_EndUsers_TenantId_SocialProvider_ExternalId' AND object_id = OBJECT_ID(N'[EndUsers]'))
            BEGIN
                CREATE UNIQUE INDEX [IX_EndUsers_TenantId_SocialProvider_ExternalId]
                    ON [EndUsers] ([TenantId], [SocialProvider], [ExternalId])
                    WHERE [ExternalId] IS NOT NULL;
            END;

            -- TenantUsers: unique user-per-tenant
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_TenantUsers_TenantId_UserId' AND object_id = OBJECT_ID(N'[TenantUsers]'))
            BEGIN
                CREATE UNIQUE INDEX [IX_TenantUsers_TenantId_UserId]
                    ON [TenantUsers] ([TenantId], [UserId]);
            END;
            """
        );
    }
}
