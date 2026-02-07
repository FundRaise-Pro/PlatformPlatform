using PlatformPlatform.Fundraiser.Features.Applications.Domain;
using PlatformPlatform.Fundraiser.Features.Blogs.Domain;
using PlatformPlatform.Fundraiser.Features.Branches.Domain;
using PlatformPlatform.Fundraiser.Features.Campaigns.Domain;
using PlatformPlatform.Fundraiser.Features.Donations.Domain;
using PlatformPlatform.Fundraiser.Features.EndUsers.Domain;
using PlatformPlatform.Fundraiser.Features.Events.Domain;
using PlatformPlatform.Fundraiser.Features.Forms.Domain;
using PlatformPlatform.Fundraiser.Features.QRCodes.Domain;
using PlatformPlatform.Fundraiser.Features.TenantSettings.Domain;
using PlatformPlatform.Fundraiser.Features.Users.Domain;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features;

/// This file contains all the telemetry events that are collected by the Fundraiser SCS. Telemetry events are
/// important to understand how the application is being used and collect valuable information for the business.
/// Quality is important, and keeping all the telemetry events in one place makes it easier to maintain high quality.
/// Naming should be in past tense and properties use snake_case.
/// 
// --- Campaigns ---
public sealed class CampaignCreated(CampaignId campaignId)
    : TelemetryEvent(("campaign_id", campaignId));

public sealed class CampaignUpdated(CampaignId campaignId)
    : TelemetryEvent(("campaign_id", campaignId));

public sealed class CampaignPublished(CampaignId campaignId)
    : TelemetryEvent(("campaign_id", campaignId));

public sealed class CampaignDeleted(CampaignId campaignId)
    : TelemetryEvent(("campaign_id", campaignId));

// --- Blogs ---
public sealed class BlogCategoryCreated(BlogCategoryId categoryId)
    : TelemetryEvent(("category_id", categoryId));

public sealed class BlogPostCreated(BlogPostId postId)
    : TelemetryEvent(("post_id", postId));

public sealed class BlogPostUpdated(BlogPostId postId)
    : TelemetryEvent(("post_id", postId));

public sealed class BlogPostPublished(BlogPostId postId)
    : TelemetryEvent(("post_id", postId));

// --- Events ---
public sealed class FundraisingEventCreated(FundraisingEventId eventId)
    : TelemetryEvent(("event_id", eventId));

public sealed class FundraisingEventUpdated(FundraisingEventId eventId)
    : TelemetryEvent(("event_id", eventId));

// --- Forms ---
public sealed class FormTemplateCloned(FormTemplateId templateId, FormVersionId formVersionId)
    : TelemetryEvent(("template_id", templateId), ("form_version_id", formVersionId));

public sealed class FormTemplateCreated(FormTemplateId templateId, string category)
    : TelemetryEvent(("template_id", templateId), ("category", category));

public sealed class FormTemplatePublished(FormTemplateId templateId)
    : TelemetryEvent(("template_id", templateId));

public sealed class FormVersionCreated(FormVersionId formVersionId)
    : TelemetryEvent(("form_version_id", formVersionId));

public sealed class FormVersionActivated(FormVersionId formVersionId)
    : TelemetryEvent(("form_version_id", formVersionId));

// --- Applications ---
public sealed class ApplicationCreated(FundraisingApplicationId applicationId)
    : TelemetryEvent(("application_id", applicationId));

public sealed class ApplicationSubmitted(FundraisingApplicationId applicationId)
    : TelemetryEvent(("application_id", applicationId));

public sealed class ApplicationFieldDataSet(FundraisingApplicationId applicationId, string fieldName)
    : TelemetryEvent(("application_id", applicationId), ("field_name", fieldName));

public sealed class ApplicationReviewed(FundraisingApplicationId applicationId, ReviewDecision decision)
    : TelemetryEvent(("application_id", applicationId), ("decision", decision));

// --- Transactions ---
public sealed class TransactionCreated(TransactionId transactionId, TransactionType type, decimal amount)
    : TelemetryEvent(("transaction_id", transactionId), ("type", type), ("amount", amount));

public sealed class TransactionSucceeded(TransactionId transactionId, decimal amount)
    : TelemetryEvent(("transaction_id", transactionId), ("amount", amount));

// --- Donations ---
public sealed class DonationRecorded(DonationId donationId, bool isRecurring)
    : TelemetryEvent(("donation_id", donationId), ("is_recurring", isRecurring));

// --- Subscriptions ---
public sealed class SubscriptionCreated(SubscriptionId subscriptionId, decimal recurringAmount)
    : TelemetryEvent(("subscription_id", subscriptionId), ("recurring_amount", recurringAmount));

public sealed class SubscriptionCancelled(SubscriptionId subscriptionId)
    : TelemetryEvent(("subscription_id", subscriptionId));

// --- Branches ---
public sealed class BranchCreated(BranchId branchId)
    : TelemetryEvent(("branch_id", branchId));

public sealed class BranchUpdated(BranchId branchId)
    : TelemetryEvent(("branch_id", branchId));

public sealed class BranchGeolocationSet(BranchId branchId)
    : TelemetryEvent(("branch_id", branchId));

// --- QR Codes ---
public sealed class QRCodeCreated(QRCodeId qrCodeId, QRCodeType qrCodeType)
    : TelemetryEvent(("qr_code_id", qrCodeId), ("qr_code_type", qrCodeType));

public sealed class QRCodeHitRecorded(QRCodeId qrCodeId, int hitCount)
    : TelemetryEvent(("qr_code_id", qrCodeId), ("hit_count", hitCount));

public sealed class QRCodeDeactivated(QRCodeId qrCodeId)
    : TelemetryEvent(("qr_code_id", qrCodeId));

// --- Tenant Users (Role System) ---
public sealed class TenantUserCreated(TenantUserId tenantUserId)
    : TelemetryEvent(("tenant_user_id", tenantUserId));

public sealed class FundraiserRoleAssigned(TenantUserId tenantUserId, FundraiserRole role)
    : TelemetryEvent(("tenant_user_id", tenantUserId), ("role", role));

public sealed class FundraiserRoleRevoked(TenantUserId tenantUserId, FundraiserRole role)
    : TelemetryEvent(("tenant_user_id", tenantUserId), ("role", role));

public sealed class TenantUserBranchAssigned(TenantUserId tenantUserId)
    : TelemetryEvent(("tenant_user_id", tenantUserId));

// --- End Users ---
public sealed class EndUserRegistered(EndUserId endUserId, EndUserType type)
    : TelemetryEvent(("end_user_id", endUserId), ("type", type));

public sealed class EndUserUpdated(EndUserId endUserId)
    : TelemetryEvent(("end_user_id", endUserId));

public sealed class EndUserVerificationStarted(EndUserId endUserId)
    : TelemetryEvent(("end_user_id", endUserId));

public sealed class EndUserVerified(EndUserId endUserId, EndUserType type)
    : TelemetryEvent(("end_user_id", endUserId), ("type", type));

// --- Tenant Settings ---
public sealed class BrandConfigUpdated(TenantSettingsId tenantSettingsId)
    : TelemetryEvent(("tenant_settings_id", tenantSettingsId));

public sealed class ContentConfigUpdated(TenantSettingsId tenantSettingsId)
    : TelemetryEvent(("tenant_settings_id", tenantSettingsId));

public sealed class DomainConfigUpdated(TenantSettingsId tenantSettingsId, string? subdomain)
    : TelemetryEvent(("tenant_settings_id", tenantSettingsId), ("subdomain", subdomain ?? string.Empty));

public sealed class FeatureFlagsUpdated(TenantSettingsId tenantSettingsId, int flagCount)
    : TelemetryEvent(("tenant_settings_id", tenantSettingsId), ("flag_count", flagCount));

public sealed class PaymentConfigUpdated(TenantSettingsId tenantSettingsId, PaymentProvider provider)
    : TelemetryEvent(("tenant_settings_id", tenantSettingsId), ("provider", provider));

public sealed class TenantSettingsInitialized(TenantSettingsId tenantSettingsId)
    : TelemetryEvent(("tenant_settings_id", tenantSettingsId));

public sealed class ThemeConfigUpdated(TenantSettingsId tenantSettingsId)
    : TelemetryEvent(("tenant_settings_id", tenantSettingsId));
