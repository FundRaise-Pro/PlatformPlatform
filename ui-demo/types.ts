
export type AppViewId = "dashboard" | "editor" | "crm" | "public";

export type CrmTabId = "donors" | "partners";

export type PublicPageId = "landing" | "stories" | "events" | "blog" | "partners";

export interface DonationTier {
  id: string;
  amount: number;
  label: string;
  description: string;
}

export interface Donation {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  tierId?: string;
  channel: "direct" | "qrCode" | "social" | "partner";
  certificateGenerated: boolean;
}

export interface PartnerTier {
  id: string;
  name: string;
  minCommitment: number;
  benefits: string[];
  color: string;
}

export interface Partner {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  logo: string;
  tierId: string;
  status: "prospective" | "active" | "on-hold";
  totalContributed: number;
  joinedDate: string;
  lastContributionDate?: string;
}

export interface PartnerMention {
  id: string;
  partnerId: string;
  quote: string;
  context: string;
  highlighted: boolean;
}

export interface Terminology {
  donation: string;
  donor: string;
  campaign: string;
  goal: string;
}

export interface BeneficiaryStory {
  id: string;
  name: string;
  bio: string;
  goal: number;
  raised: number;
  image: string;
}

export interface FundraiserEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  linkedCampaignId: string;
  image?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  image?: string;
}

export interface Application {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  date: string;
  description: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
}

export interface NarrativeSection {
  id: string;
  title: string;
  description: string;
  image: string;
  ctaLabel: string;
}

export interface PageCustomization {
  navigationLabel: string;
  heading: string;
  subheading: string;
  heroImage: string;
  isVisible: boolean;
  sections: NarrativeSection[];
}

export interface FundraiserConfig {
  id: string;
  tenantName: string;
  title: string;
  subtitle: string;
  story: string;
  goal: number;
  raised: number;
  primaryColor: string;
  heroImage: string;
  tiers: DonationTier[];
  active: boolean;
  donations: Donation[];
  partners: Partner[];
  partnerTiers: PartnerTier[];
  partnerMentions: PartnerMention[];
  terminology: Terminology;
  beneficiaryStories: BeneficiaryStory[];
  events: FundraiserEvent[];
  blogPosts: BlogPost[];
  applications: Application[];
  branches: Branch[];
  pageCustomizations: Record<PublicPageId, PageCustomization>;
  subscriptionPlan: "Starter" | "Pro" | "Enterprise";
}

export interface AnalyticsData {
  date: string;
  donations: number;
  visits: number;
}
