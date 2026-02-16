using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PlatformPlatform.Fundraiser.Database;

namespace PlatformPlatform.Fundraiser.Database.Migrations;

[DbContext(typeof(FundraiserDbContext))]
[Migration("20260216120000_AddPaymentSpineAndReceiptSequences")]
public sealed class AddPaymentSpineAndReceiptSequences : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            -- Add TargetType, TargetId, MerchantReference columns to Transactions
            IF OBJECT_ID(N'[Transactions]', N'U') IS NOT NULL
               AND COL_LENGTH(N'[Transactions]', N'TargetType') IS NULL
            BEGIN
                ALTER TABLE [Transactions]
                ADD [TargetType] [nvarchar](50) NOT NULL CONSTRAINT [DF_Transactions_TargetType] DEFAULT N'Campaign',
                    [TargetId] [nvarchar](26) NOT NULL CONSTRAINT [DF_Transactions_TargetId] DEFAULT N'',
                    [MerchantReference] [nvarchar](100) NOT NULL CONSTRAINT [DF_Transactions_MerchantReference] DEFAULT N'';
            END;

            -- Unique filtered index on (TenantId, GatewayPaymentId) where GatewayPaymentId IS NOT NULL
            IF NOT EXISTS (
                SELECT 1 FROM sys.indexes
                WHERE name = N'IX_Transactions_TenantId_GatewayPaymentId'
                  AND object_id = OBJECT_ID(N'[Transactions]')
            )
            BEGIN
                CREATE UNIQUE INDEX [IX_Transactions_TenantId_GatewayPaymentId]
                ON [Transactions] ([TenantId], [GatewayPaymentId])
                WHERE [GatewayPaymentId] IS NOT NULL;
            END;

            -- Unique index on (TenantId, MerchantReference)
            IF NOT EXISTS (
                SELECT 1 FROM sys.indexes
                WHERE name = N'IX_Transactions_TenantId_MerchantReference'
                  AND object_id = OBJECT_ID(N'[Transactions]')
            )
            BEGIN
                CREATE UNIQUE INDEX [IX_Transactions_TenantId_MerchantReference]
                ON [Transactions] ([TenantId], [MerchantReference]);
            END;

            -- Composite index on (TenantId, TargetType, TargetId, Status) for raised amount aggregation
            IF NOT EXISTS (
                SELECT 1 FROM sys.indexes
                WHERE name = N'IX_Transactions_TenantId_TargetType_TargetId_Status'
                  AND object_id = OBJECT_ID(N'[Transactions]')
            )
            BEGIN
                CREATE INDEX [IX_Transactions_TenantId_TargetType_TargetId_Status]
                ON [Transactions] ([TenantId], [TargetType], [TargetId], [Status]);
            END;

            -- Remove RaisedAmount column from FundraisingEvents (now computed via query)
            IF OBJECT_ID(N'[FundraisingEvents]', N'U') IS NOT NULL
               AND COL_LENGTH(N'[FundraisingEvents]', N'RaisedAmount') IS NOT NULL
            BEGIN
                                DECLARE @RaisedAmountDefaultConstraint NVARCHAR(128);
                                SELECT @RaisedAmountDefaultConstraint = dc.[name]
                                FROM sys.default_constraints dc
                                INNER JOIN sys.columns c ON c.default_object_id = dc.object_id
                                WHERE dc.parent_object_id = OBJECT_ID(N'[FundraisingEvents]')
                                    AND c.[name] = N'RaisedAmount';

                                IF @RaisedAmountDefaultConstraint IS NOT NULL
                                        EXEC(N'ALTER TABLE [FundraisingEvents] DROP CONSTRAINT [' + @RaisedAmountDefaultConstraint + ']');

                ALTER TABLE [FundraisingEvents] DROP COLUMN [RaisedAmount];
            END;

            -- Create ReceiptNumberSequences table
            IF OBJECT_ID(N'[ReceiptNumberSequences]', N'U') IS NULL
            BEGIN
                CREATE TABLE [ReceiptNumberSequences] (
                    [TenantId] [bigint] NOT NULL,
                    [TaxYear] [int] NOT NULL,
                    [CurrentValue] [bigint] NOT NULL DEFAULT 0,
                    CONSTRAINT [PK_ReceiptNumberSequences] PRIMARY KEY ([TenantId], [TaxYear])
                );
            END;
            """
        );
    }
}
