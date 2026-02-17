using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PlatformPlatform.Fundraiser.Database;

namespace PlatformPlatform.Fundraiser.Database.Migrations;

[DbContext(typeof(FundraiserDbContext))]
[Migration("20260218120000_AddCertificatesTables")]
public sealed class AddCertificatesTables : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            -- DonorProfile: add SARS identity columns
            IF OBJECT_ID('dbo.DonorProfile', 'U') IS NOT NULL
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.DonorProfile') AND name = 'FirstName')
                    ALTER TABLE [dbo].[DonorProfile] ADD [FirstName] NVARCHAR(150) NULL;

                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.DonorProfile') AND name = 'LastName')
                    ALTER TABLE [dbo].[DonorProfile] ADD [LastName] NVARCHAR(150) NULL;

                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.DonorProfile') AND name = 'Email')
                    ALTER TABLE [dbo].[DonorProfile] ADD [Email] NVARCHAR(320) NULL;

                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.DonorProfile') AND name = 'PhoneNumber')
                    ALTER TABLE [dbo].[DonorProfile] ADD [PhoneNumber] NVARCHAR(30) NULL;
            END

            -- CertificateTemplates table
            IF OBJECT_ID('dbo.CertificateTemplate', 'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[CertificateTemplate] (
                    [Id] NVARCHAR(450) NOT NULL,
                    [TenantId] BIGINT NOT NULL,
                    [Name] NVARCHAR(200) NOT NULL,
                    [Description] NVARCHAR(2000) NULL,
                    [OrganisationName] NVARCHAR(300) NULL,
                    [PboNumber] NVARCHAR(50) NULL,
                    [OrganisationAddress] NVARCHAR(500) NULL,
                    [RegistrationNumber] NVARCHAR(100) NULL,
                    [LogoUrl] NVARCHAR(500) NULL,
                    [SignatoryName] NVARCHAR(200) NULL,
                    [SignatoryTitle] NVARCHAR(200) NULL,
                    [IsDefault] BIT NOT NULL DEFAULT 0,
                    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
                    [ModifiedAt] DATETIMEOFFSET NULL,
                    CONSTRAINT [PK_CertificateTemplate] PRIMARY KEY ([Id])
                );

                CREATE INDEX [IX_CertificateTemplate_TenantId_IsDefault] ON [dbo].[CertificateTemplate] ([TenantId], [IsDefault]);
            END

            -- CertificateIssuanceBatch table
            IF OBJECT_ID('dbo.CertificateIssuanceBatch', 'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[CertificateIssuanceBatch] (
                    [Id] NVARCHAR(450) NOT NULL,
                    [TenantId] BIGINT NOT NULL,
                    [TaxYear] INT NOT NULL,
                    [TemplateId] NVARCHAR(450) NOT NULL,
                    [Status] NVARCHAR(50) NOT NULL,
                    [TotalCertificates] INT NOT NULL DEFAULT 0,
                    [GeneratedBy] NVARCHAR(200) NULL,
                    [CompletedAt] DATETIME2 NULL,
                    [ErrorMessage] NVARCHAR(2000) NULL,
                    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
                    [ModifiedAt] DATETIMEOFFSET NULL,
                    CONSTRAINT [PK_CertificateIssuanceBatch] PRIMARY KEY ([Id])
                );

                CREATE INDEX [IX_CertificateIssuanceBatch_TenantId_TaxYear] ON [dbo].[CertificateIssuanceBatch] ([TenantId], [TaxYear]);
            END

            -- TaxCertificate table
            IF OBJECT_ID('dbo.TaxCertificate', 'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[TaxCertificate] (
                    [Id] NVARCHAR(450) NOT NULL,
                    [TenantId] BIGINT NOT NULL,
                    [BatchId] NVARCHAR(450) NOT NULL,
                    [DonorProfileId] NVARCHAR(450) NOT NULL,
                    [TaxYear] INT NOT NULL,
                    [ReceiptNumber] BIGINT NOT NULL,
                    [TotalDonated] DECIMAL(18,2) NOT NULL,
                    [DonorName] NVARCHAR(300) NOT NULL,
                    [Status] NVARCHAR(50) NOT NULL,
                    [CertificateUrl] NVARCHAR(500) NULL,
                    [ErrorMessage] NVARCHAR(2000) NULL,
                    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
                    [ModifiedAt] DATETIMEOFFSET NULL,
                    CONSTRAINT [PK_TaxCertificate] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_TaxCertificate_CertificateIssuanceBatch] FOREIGN KEY ([BatchId]) REFERENCES [dbo].[CertificateIssuanceBatch]([Id]) ON DELETE CASCADE
                );

                CREATE INDEX [IX_TaxCertificate_TenantId_TaxYear_DonorProfileId] ON [dbo].[TaxCertificate] ([TenantId], [TaxYear], [DonorProfileId]);
                CREATE UNIQUE INDEX [IX_TaxCertificate_TenantId_TaxYear_ReceiptNumber] ON [dbo].[TaxCertificate] ([TenantId], [TaxYear], [ReceiptNumber]);
            END
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF OBJECT_ID('dbo.TaxCertificate', 'U') IS NOT NULL
                DROP TABLE [dbo].[TaxCertificate];

            IF OBJECT_ID('dbo.CertificateIssuanceBatch', 'U') IS NOT NULL
                DROP TABLE [dbo].[CertificateIssuanceBatch];

            IF OBJECT_ID('dbo.CertificateTemplate', 'U') IS NOT NULL
                DROP TABLE [dbo].[CertificateTemplate];

            IF OBJECT_ID('dbo.DonorProfile', 'U') IS NOT NULL
            BEGIN
                IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.DonorProfile') AND name = 'PhoneNumber')
                    ALTER TABLE [dbo].[DonorProfile] DROP COLUMN [PhoneNumber];

                IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.DonorProfile') AND name = 'Email')
                    ALTER TABLE [dbo].[DonorProfile] DROP COLUMN [Email];

                IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.DonorProfile') AND name = 'LastName')
                    ALTER TABLE [dbo].[DonorProfile] DROP COLUMN [LastName];

                IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.DonorProfile') AND name = 'FirstName')
                    ALTER TABLE [dbo].[DonorProfile] DROP COLUMN [FirstName];
            END
            """);
    }
}
