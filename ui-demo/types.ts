
export type AppViewId = "dashboard" | "editor" | "crm" | "public";

export type CrmTabId = "donors" | "partners";

export type PublicPageId = "landing" | "fundraisers" | "events" | "blog" | "partners" | "apply";
export type ApplyPathId = "volunteer" | "help" | "sponsor";
export type CampaignPreset = "general" | "fundraiser-based" | "hybrid";
export type CampaignLifecycleStatus = "active" | "completed" | "archived" | "planned";

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
  campaignId?: string;
  fundraiserId?: string;
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

export interface Volunteer {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  skills: string;
  status: "available" | "assigned" | "inactive";
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

export interface EventTimetableEntry {
  id: string;
  time: string;
  label: string;
  speaker?: string;
}

export type EventStatus = "upcoming" | "live" | "completed" | "cancelled";
export type EventCategory = "gala" | "workshop" | "hackathon" | "webinar" | "community" | "fundraiser" | "other";
export type EventRsvpSource = "site" | "whatsapp";
export type EventRsvpStatus = "confirmed" | "waitlisted" | "cancelled";

export interface EventRsvp {
  id: string;
  attendeeName: string;
  email?: string;
  phone?: string;
  source: EventRsvpSource;
  status: EventRsvpStatus;
  timestamp: string;
}

export interface FundraiserEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  venue: string;
  address?: string;
  mapUrl?: string;
  description?: string;
  campaignId: string;
  fundraiserId?: string;
  volunteerIds?: string[];
  image?: string;
  capacity?: number;
  rsvpCount?: number;
  timetable?: EventTimetableEntry[];
  qrCodeUrl?: string;
  partnerIds?: string[];
  status?: EventStatus;
  category?: EventCategory;
  contactEmail?: string;
  contactPhone?: string;
  rsvps?: EventRsvp[];
}

export type SocialMediaPlatform = "twitter" | "facebook" | "instagram";

export interface SocialMediaMetrics {
  platform: SocialMediaPlatform;
  followers: number;
  followersGrowth: number;
  postsCount: number;
  engagementRate: number;
  impressions: number;
  impressionsGrowth: number;
}

export interface SocialMediaPost {
  id: string;
  platform: SocialMediaPlatform;
  content: string;
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  url?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  campaignId?: string;
  fundraiserId?: string;
  image?: string;
  channels?: ("whatsapp" | "instagram" | "facebook" | "twitter")[];
  channelStatus?: Partial<Record<"whatsapp" | "instagram" | "facebook" | "twitter", "draft" | "scheduled" | "live">>;
  whatsappAudience?: string;
}

export interface Application {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  date: string;
  description: string;
}

export type ApplicationFieldType = "text" | "email" | "phone" | "textarea" | "select";

export interface ApplicationFormField {
  id: string;
  label: string;
  type: ApplicationFieldType;
  placeholder: string;
  required: boolean;
  options?: string[];
}

export interface ApplicationFormSubmission {
  id: string;
  submittedAt: string;
  campaignId: string;
  status: "new" | "reviewing" | "approved" | "declined";
  values: Record<string, string>;
  reviewNotes?: string;
  convertedFundraiserId?: string;
  linkedPartnerId?: string;
}

export interface ApplicationFormCategory {
  id: ApplyPathId;
  title: string;
  description: string;
  submitLabel: string;
  fields: ApplicationFormField[];
  submissions: ApplicationFormSubmission[];
}

export interface FundraiserOfficialDocument {
  legalName: string;
  nationalId: string;
  contactPhone: string;
  contactEmail: string;
  physicalAddress: string;
  requestedAmount: number;
  approvalNotes: string;
}

export interface FundraiserRecord {
  id: string;
  campaignId: string;
  slug: string;
  title: string;
  summary: string;
  story: string;
  goal: number;
  raised: number;
  heroImage: string;
  status: "draft" | "active" | "closed";
  sourceSubmissionId?: string;
  officialDocument?: FundraiserOfficialDocument;
}

export type AllocationRiskBand = "low" | "medium" | "high" | "critical";
export type AllocationTargetType = "fundraiser" | "campaign-ops";
export type AllocationApproverRole =
  | "campaign-admin"
  | "finance-officer"
  | "board-member"
  | "full-board"
  | "chair-president";

export interface AllocationApproval {
  role: AllocationApproverRole;
  approved: boolean;
  approvedAt?: string;
}

export interface CampaignPoolAllocation {
  id: string;
  campaignId: string;
  createdAt: string;
  targetType: AllocationTargetType;
  targetFundraiserId?: string;
  targetLabel: string;
  amount: number;
  percentageSplit?: number;
  reason: string;
  operationalCritical: boolean;
  donorIntentConfirmed: boolean;
  singleAmount: number;
  rolling30DayTotalAfterThis: number;
  effectiveRiskAmount: number;
  riskBand: AllocationRiskBand;
  requiresBoardResolution: boolean;
  boardResolutionReference?: string;
  status: "pending-approval" | "cooling-off" | "approved" | "rejected" | "executed";
  cooldownUntil?: string;
  approvals: AllocationApproval[];
}

export interface CampaignAllocationPolicy {
  currency: "ZAR";
  rollingWindowDays: 30;
  lowMax: number;
  mediumMax: number;
  highMax: number;
}

export interface CampaignPartnerPool {
  totalPartnerDonations: number;
  totalAllocated: number;
  balance: number;
  policy: CampaignAllocationPolicy;
  allocations: CampaignPoolAllocation[];
}

export interface CampaignRecord {
  id: string;
  slug: string;
  name: string;
  description: string;
  lifecycleStatus?: CampaignLifecycleStatus;
  preset: CampaignPreset;
  allowsDirectDonations: boolean;
  allowsFundraisers: boolean;
  fundraisers: FundraiserRecord[];
  events: FundraiserEvent[];
  mediaPosts: BlogPost[];
  donations: Donation[];
  partnerPoolDonations: Donation[];
  partnerPool: CampaignPartnerPool;
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
  ctaUrl?: string;
  ctaOpenInNewTab?: boolean;
  mediaType?: "image" | "video";
  mediaUrl?: string;
  layout?: {
    columnSpan: number;
    minHeightRem: number;
    order: number;
  };
}

export interface PageCustomization {
  navigationLabel: string;
  heading: string;
  subheading: string;
  heroImage: string;
  heroMediaType?: "image" | "video";
  heroMediaUrl?: string;
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
  applicationForms: Record<ApplyPathId, ApplicationFormCategory>;
  volunteers: Volunteer[];
  campaigns: CampaignRecord[];
  activeCampaignId: string;
  activeFundraiserId: string;
  branches: Branch[];
  pageCustomizations: Record<PublicPageId, PageCustomization>;
  subscriptionPlan: "Starter" | "Pro" | "Enterprise";
}

export interface AnalyticsData {
  date: string;
  donations: number;
  visits: number;
}
