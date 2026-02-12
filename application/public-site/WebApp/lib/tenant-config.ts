/**
 * TypeScript types mirroring the PublicTenantSettingsResponse from the fundraiser API.
 * Consumed by server actions and the TenantProvider context.
 */

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string | null;
  fontUrl: string | null;
  faviconUrl: string | null;
  customCss: string | null;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface BrandConfig {
  organizationName: string | null;
  tagline: string | null;
  socialLinks: SocialLink[] | null;
  termsUrl: string | null;
  privacyUrl: string | null;
}

export interface ContentConfig {
  applicationLabel: string;
  causeType: string;
  beneficiaryLabel: string;
  donationLabel: string;
  campaignLabel: string;
  branchLabel: string;
}

export interface TenantSettings {
  theme: ThemeConfig;
  brand: BrandConfig;
  content: ContentConfig;
  featureFlags: Record<string, boolean>;
}

/** Default tenant settings used as fallback when the API is unavailable. */
export const DEFAULT_TENANT_SETTINGS: TenantSettings = {
  theme: {
    primaryColor: "#10b981",
    secondaryColor: "#064e3b",
    accentColor: "#f59e0b",
    fontFamily: null,
    fontUrl: null,
    faviconUrl: null,
    customCss: null
  },
  brand: {
    organizationName: null,
    tagline: null,
    socialLinks: null,
    termsUrl: null,
    privacyUrl: null
  },
  content: {
    applicationLabel: "Application",
    causeType: "Cause",
    beneficiaryLabel: "Beneficiary",
    donationLabel: "Donation",
    campaignLabel: "Campaign",
    branchLabel: "Branch"
  },
  featureFlags: {}
};
