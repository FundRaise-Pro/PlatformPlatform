import { ReactNode, useMemo, useRef, useState } from "react";
import {
  Bold,
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Calendar,
  Facebook,
  FileCheck2,
  Heading2,
  HandHeart,
  Handshake,
  House,
  ImagePlus,
  Instagram,
  Italic,
  HandCoins,
  LayoutTemplate,
  Layers,
  Link,
  List,
  MessageCircle,
  Plus,
  SendHorizontal,
  Sparkles,
  Twitter,
  Workflow,
  UsersRound,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { EventCalendar } from "@/components/EventCalendar";
import { IMAGE_FILE_ACCEPT } from "@/lib/constants";
import { readImageFile } from "@/lib/fileUploads";
import { generateBlogPost, generateEventContent } from "@/services/geminiService";
import { ApplicationFieldType, ApplyPathId, FundraiserConfig, FundraiserEvent } from "@/types";

interface DashboardProps {
  config: FundraiserConfig;
  onUpdate: (updates: Partial<FundraiserConfig>) => void;
  activeCampaignSlug?: string;
  activeFundraiserSlug?: string;
  onSelectCampaign?: (campaignSlug: string) => void;
  onSelectFundraiser?: (fundraiserSlug: string) => void;
}

type DashboardTabId = "overview" | "media" | "fundraising" | "events" | "applications" | "operations";
type GeneratorMode = "event" | "blog" | null;

interface DashboardTabMeta {
  label: string;
  icon: ReactNode;
}

const DASHBOARD_TAB_META: Record<DashboardTabId, DashboardTabMeta> = {
  overview: {
    label: "Command",
    icon: <House className="size-4" />,
  },
  media: {
    label: "Manage Media",
    icon: <LayoutTemplate className="size-4" />,
  },
  fundraising: {
    label: "Fundraising",
    icon: <HandHeart className="size-4" />,
  },
  events: {
    label: "Events",
    icon: <CalendarDays className="size-4" />,
  },
  applications: {
    label: "Applications",
    icon: <FileCheck2 className="size-4" />,
  },
  operations: {
    label: "Operations",
    icon: <UsersRound className="size-4" />,
  },
};

const APPLICATION_CATEGORY_ORDER: ApplyPathId[] = ["volunteer", "help", "sponsor"];

const APPLICATION_CATEGORY_META: Record<ApplyPathId, { label: string; path: string }> = {
  volunteer: {
    label: "Volunteer",
    path: "/apply/volunteer",
  },
  help: {
    label: "Request Help",
    path: "/apply/help",
  },
  sponsor: {
    label: "Partner / Sponsor",
    path: "/apply/sponsor",
  },
};

type MediaChannelId = "whatsapp" | "instagram" | "facebook" | "twitter";
type MediaChannelStatus = "draft" | "scheduled" | "live";

interface MediaActivityRow {
  id: string;
  channel: MediaChannelId;
  postTitle: string;
  campaign: string;
  scheduledFor: string;
  status: MediaChannelStatus;
  audience: string;
}

const MEDIA_CHANNEL_META: Record<
  MediaChannelId,
  {
    label: string;
    icon: ReactNode;
    badgeClassName: string;
    audienceLabel: string;
  }
> = {
  whatsapp: {
    label: "WhatsApp",
    icon: <MessageCircle className="size-4" />,
    badgeClassName: "bg-emerald-100 text-emerald-700",
    audienceLabel: "Volunteer and field broadcast",
  },
  instagram: {
    label: "Instagram",
    icon: <Instagram className="size-4" />,
    badgeClassName: "bg-pink-100 text-pink-700",
    audienceLabel: "Visual story feed",
  },
  facebook: {
    label: "Facebook",
    icon: <Facebook className="size-4" />,
    badgeClassName: "bg-blue-100 text-blue-700",
    audienceLabel: "Community updates",
  },
  twitter: {
    label: "Twitter / X",
    icon: <Twitter className="size-4" />,
    badgeClassName: "bg-slate-200 text-slate-700",
    audienceLabel: "Rapid response updates",
  },
};

const MEDIA_DEFAULT_CHANNELS: MediaChannelId[] = ["whatsapp", "instagram", "facebook"];

function renderApplicationCategoryIcon(categoryId: ApplyPathId, className = "size-5"): ReactNode {
  if (categoryId === "volunteer") {
    return <UsersRound className={className} />;
  }

  if (categoryId === "help") {
    return <HandHeart className={className} />;
  }

  return <Handshake className={className} />;
}

const ANALYTICS_DATA = [
  { day: "Mon", donations: 120, reach: 800 },
  { day: "Tue", donations: 300, reach: 1200 },
  { day: "Wed", donations: 450, reach: 1500 },
  { day: "Thu", donations: 400, reach: 1100 },
  { day: "Fri", donations: 900, reach: 2400 },
  { day: "Sat", donations: 1200, reach: 3100 },
  { day: "Sun", donations: 1540, reach: 3800 },
];

const DOMAIN_ROWS = [
  { id: "campaigns", domain: "Campaigns", route: "/fundraiser/campaigns", status: "Ready", owner: "Fundraising Team" },
  { id: "fundraisers", domain: "Fundraisers", route: "/campaigns/{campaign}/fundraisers/{slug}", status: "Ready", owner: "Program Team" },
  { id: "donations", domain: "Donations", route: "/fundraiser/donations", status: "Ready", owner: "Finance" },
  { id: "events", domain: "Events", route: "/fundraiser/events", status: "Ready", owner: "Field Ops" },
  { id: "certificates", domain: "Certificates", route: "/fundraiser/certificates", status: "Ready", owner: "Compliance" },
  { id: "qr", domain: "QR Codes", route: "/fundraiser/qr-codes", status: "Ready", owner: "Growth Team" },
  { id: "blogs", domain: "Blogs", route: "/fundraiser/blogs", status: "Ready", owner: "Communications" },
  { id: "applications", domain: "Applications", route: "/apply/*", status: "Ready", owner: "Program Team" },
  { id: "forms", domain: "Forms", route: "/fundraiser/forms", status: "Ready", owner: "Program Team" },
  { id: "branches", domain: "Branches", route: "/fundraiser/branches", status: "Ready", owner: "Operations" },
  { id: "users", domain: "Users", route: "/fundraiser/users", status: "Ready", owner: "Admin" },
  { id: "subscription", domain: "Subscriptions", route: "/fundraiser/subscription", status: "Ready", owner: "Platform Ops" },
  { id: "settings", domain: "Tenant settings", route: "/fundraiser/settings", status: "Ready", owner: "Admin" },
  { id: "public", domain: "Public services", route: "Behind the scenes", status: "Coming soon", owner: "Platform Team" },
  { id: "provisioning", domain: "Provisioning", route: "Automatic", status: "Ready", owner: "Platform Ops" },
];

const DOMAIN_COLUMNS: DataTableColumn<(typeof DOMAIN_ROWS)[number]>[] = [
  { key: "domain", header: "Domain", accessor: (row) => row.domain, sortable: true },
  { key: "route", header: "Where to manage", accessor: (row) => row.route, sortable: true },
  {
    key: "status",
    header: "Status",
    accessor: (row) => row.status,
    sortable: true,
    cell: (row) => (
      <Badge
        className={
          row.status === "Ready"
            ? "bg-emerald-100 text-emerald-700"
            : row.status === "Coming soon"
              ? "bg-amber-100 text-amber-700"
              : "bg-red-100 text-red-700"
        }
      >
        <span
          className={`inline-block size-2 rounded-full ${
            row.status === "Ready" ? "bg-emerald-500" : row.status === "Coming soon" ? "bg-amber-500" : "bg-red-500"
          }`}
        />
        {row.status}
      </Badge>
    ),
  },
  { key: "owner", header: "Owner", accessor: (row) => row.owner, sortable: true },
];

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function Dashboard({
  config,
  onUpdate,
  activeCampaignSlug,
  activeFundraiserSlug,
  onSelectCampaign,
  onSelectFundraiser,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTabId>("overview");
  const [isGenerating, setIsGenerating] = useState<GeneratorMode>(null);
  const [activeApplicationCategory, setActiveApplicationCategory] = useState<ApplyPathId>("volunteer");
  const [newEvent, setNewEvent] = useState<{ title: string; venue: string; date: string; volunteerId: string }>({
    title: "",
    venue: "",
    date: new Date().toISOString().split("T")[0],
    volunteerId: "",
  });
  const [newMediaPost, setNewMediaPost] = useState<{
    title: string;
    excerpt: string;
    author: string;
    date: string;
    image: string;
    contentHtml: string;
    channels: MediaChannelId[];
    channelStatus: Record<MediaChannelId, MediaChannelStatus>;
    whatsappAudience: string;
  }>({
    title: "",
    excerpt: "",
    author: "Campaign Team",
    date: new Date().toISOString().split("T")[0],
    image: "",
    contentHtml: "<p>Start writing your campaign message here...</p>",
    channels: MEDIA_DEFAULT_CHANNELS,
    channelStatus: {
      whatsapp: "draft",
      instagram: "draft",
      facebook: "draft",
      twitter: "draft",
    },
    whatsappAudience: "Volunteer broadcast",
  });
  const [isMediaDetailsOpen, setIsMediaDetailsOpen] = useState(false);
  const [isMediaChannelsOpen, setIsMediaChannelsOpen] = useState(false);
  const mediaComposerRef = useRef<HTMLDivElement>(null);
  const [newApplicationField, setNewApplicationField] = useState<{
    label: string;
    type: ApplicationFieldType;
    placeholder: string;
    required: boolean;
    options: string;
  }>({
    label: "",
    type: "text",
    placeholder: "",
    required: true,
    options: "",
  });
  const [conversionSubmissionId, setConversionSubmissionId] = useState<string | null>(null);
  const [conversionDraft, setConversionDraft] = useState({
    legalName: "",
    nationalId: "",
    contactPhone: "",
    contactEmail: "",
    physicalAddress: "",
    requestedAmount: "",
    approvalNotes: "",
    fundraiserTitle: "",
    fundraiserSummary: "",
  });
  const selectedCampaign =
    config.campaigns.find((campaign) => campaign.slug === activeCampaignSlug) ??
    config.campaigns.find((campaign) => campaign.id === config.activeCampaignId) ??
    config.campaigns[0];
  const selectedCampaignFundraisers = selectedCampaign?.fundraisers ?? [];
  const selectedFundraiser =
    selectedCampaignFundraisers.find((fundraiser) => fundraiser.slug === activeFundraiserSlug) ??
    selectedCampaignFundraisers.find((fundraiser) => fundraiser.id === config.activeFundraiserId) ??
    selectedCampaignFundraisers[0];

  const donationColumns = useMemo<DataTableColumn<FundraiserConfig["donations"][number]>[]>(
    () => [
      { key: "id", header: "Reference", accessor: (row) => row.id, sortable: true },
      { key: "donorName", header: "Supporter", accessor: (row) => row.donorName, sortable: true },
      { key: "amount", header: "Amount", accessor: (row) => row.amount, sortable: true, cell: (row) => `$${row.amount.toLocaleString()}` },
      {
        key: "date",
        header: "Date",
        accessor: (row) => row.date,
        sortable: true,
        cell: (row) => toShortDate(row.date),
      },
      {
        key: "certificateGenerated",
        header: "Certificate",
        accessor: (row) => (row.certificateGenerated ? "Issued" : "Pending"),
        sortable: true,
        cell: (row) => (
          <Badge className={row.certificateGenerated ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
            {row.certificateGenerated ? "Issued" : "Pending"}
          </Badge>
        ),
      },
    ],
    [],
  );

  const eventColumns = useMemo<DataTableColumn<FundraiserEvent>[]>(
    () => [
      { key: "title", header: "Event", accessor: (row) => row.title, sortable: true },
      {
        key: "date",
        header: "Date",
        accessor: (row) => row.date,
        sortable: true,
        cell: (row) => toShortDate(row.date),
      },
      { key: "venue", header: "Venue", accessor: (row) => row.venue, sortable: true },
      {
        key: "volunteers",
        header: "Volunteer assignments",
        accessor: (row) => row.volunteerIds?.length ?? 0,
        sortable: true,
        cell: (row) => String(row.volunteerIds?.length ?? 0),
      },
      {
        key: "actions",
        header: "Actions",
        accessor: () => "",
        searchable: false,
        cell: (row) => (
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => onUpdate({ events: config.events.filter((event) => event.id !== row.id) })}
          >
            Remove
          </Button>
        ),
      },
    ],
    [config.events, onUpdate],
  );

  const branchColumns = useMemo<DataTableColumn<FundraiserConfig["branches"][number]>[]>(
    () => [
      { key: "name", header: "Branch", accessor: (row) => row.name, sortable: true },
      { key: "location", header: "Location", accessor: (row) => row.location, sortable: true },
    ],
    [],
  );

  const mediaColumns = useMemo<DataTableColumn<FundraiserConfig["blogPosts"][number]>[]>(
    () => [
      { key: "title", header: "Story title", accessor: (row) => row.title, sortable: true },
      {
        key: "channels",
        header: "Channels",
        accessor: (row) => (row.channels ?? []).join(", "),
        sortable: false,
        searchable: false,
        cell: (row) => (
          <div className="flex flex-wrap gap-1">
            {(row.channels ?? []).length ? (
              (row.channels ?? []).map((channel) => (
                <Badge key={`${row.id}-${channel}`} className={MEDIA_CHANNEL_META[channel].badgeClassName}>
                  {MEDIA_CHANNEL_META[channel].icon}
                  {MEDIA_CHANNEL_META[channel].label}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-slate-500">Not assigned</span>
            )}
          </div>
        ),
      },
      { key: "author", header: "Author", accessor: (row) => row.author, sortable: true },
      { key: "date", header: "Publish date", accessor: (row) => row.date, sortable: true },
      { key: "excerpt", header: "Summary", accessor: (row) => row.excerpt, sortable: false },
      {
        key: "actions",
        header: "Actions",
        accessor: () => "",
        searchable: false,
        cell: (row) => (
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => onUpdate({ blogPosts: config.blogPosts.filter((post) => post.id !== row.id) })}
          >
            Remove
          </Button>
        ),
      },
    ],
    [config.blogPosts, onUpdate],
  );

  const mediaActivityRows = useMemo<MediaActivityRow[]>(
    () =>
      config.blogPosts.flatMap((post) => {
        const channels = post.channels ?? [];
        return channels.map((channel) => ({
          id: `${post.id}-${channel}`,
          channel,
          postTitle: post.title,
          campaign: selectedCampaign?.name ?? config.title,
          scheduledFor: post.date,
          status: post.channelStatus?.[channel] ?? "draft",
          audience:
            channel === "whatsapp"
              ? post.whatsappAudience ?? MEDIA_CHANNEL_META.whatsapp.audienceLabel
              : MEDIA_CHANNEL_META[channel].audienceLabel,
        }));
      }),
    [config.blogPosts, config.title, selectedCampaign?.name],
  );

  const mediaActivityColumns = useMemo<DataTableColumn<MediaActivityRow>[]>(
    () => [
      {
        key: "channel",
        header: "Channel",
        accessor: (row) => row.channel,
        sortable: true,
        cell: (row) => (
          <Badge className={MEDIA_CHANNEL_META[row.channel].badgeClassName}>
            {MEDIA_CHANNEL_META[row.channel].icon}
            {MEDIA_CHANNEL_META[row.channel].label}
          </Badge>
        ),
      },
      { key: "postTitle", header: "Post", accessor: (row) => row.postTitle, sortable: true },
      { key: "campaign", header: "Campaign", accessor: (row) => row.campaign, sortable: true },
      { key: "scheduledFor", header: "Planned date", accessor: (row) => row.scheduledFor, sortable: true },
      {
        key: "status",
        header: "Status",
        accessor: (row) => row.status,
        sortable: true,
        cell: (row) => (
          <Badge
            className={
              row.status === "live"
                ? "bg-emerald-100 text-emerald-700"
                : row.status === "scheduled"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-700"
            }
          >
            {row.status}
          </Badge>
        ),
      },
      { key: "audience", header: "Audience", accessor: (row) => row.audience, sortable: false },
    ],
    [],
  );

  const mediaActivitySummary = useMemo(
    () => ({
      live: mediaActivityRows.filter((row) => row.status === "live").length,
      scheduled: mediaActivityRows.filter((row) => row.status === "scheduled").length,
      draft: mediaActivityRows.filter((row) => row.status === "draft").length,
    }),
    [mediaActivityRows],
  );

  const activeApplicationForm = config.applicationForms[activeApplicationCategory];
  const activeApplicationSubmissions = activeApplicationForm.submissions.filter(
    (submission) => !selectedCampaign || submission.campaignId === selectedCampaign.id,
  );
  const conversionSubmission = config.applicationForms.help.submissions.find((submission) => submission.id === conversionSubmissionId) ?? null;

  const applicationFieldColumns = useMemo<DataTableColumn<(typeof activeApplicationForm.fields)[number]>[]>(
    () => [
      { key: "label", header: "Field label", accessor: (row) => row.label, sortable: true },
      { key: "type", header: "Type", accessor: (row) => row.type, sortable: true },
      {
        key: "required",
        header: "Required",
        accessor: (row) => (row.required ? "Yes" : "No"),
        sortable: true,
      },
      { key: "placeholder", header: "Placeholder", accessor: (row) => row.placeholder, sortable: false },
      {
        key: "options",
        header: "Options",
        accessor: (row) => (row.options ?? []).join(", "),
        sortable: false,
      },
      {
        key: "actions",
        header: "Actions",
        accessor: () => "",
        searchable: false,
        cell: (row) => (
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() =>
              onUpdate({
                applicationForms: {
                  ...config.applicationForms,
                  [activeApplicationCategory]: {
                    ...activeApplicationForm,
                    fields: activeApplicationForm.fields.filter((field) => field.id !== row.id),
                  },
                },
              })
            }
          >
            Remove
          </Button>
        ),
      },
    ],
    [activeApplicationCategory, activeApplicationForm, config.applicationForms, onUpdate],
  );

  const applyMediaComposerFormat = (command: "bold" | "italic" | "insertUnorderedList" | "formatBlock" | "createLink", value?: string) => {
    if (!mediaComposerRef.current) {
      return;
    }

    mediaComposerRef.current.focus();
    document.execCommand(command, false, value);

    setNewMediaPost((current) => ({
      ...current,
      contentHtml: mediaComposerRef.current?.innerHTML ?? current.contentHtml,
    }));
  };

  const toggleMediaChannel = (channel: MediaChannelId, checked: boolean) => {
    setNewMediaPost((current) => {
      const nextChannels = checked
        ? Array.from(new Set([...current.channels, channel]))
        : current.channels.filter((entry) => entry !== channel);

      return {
        ...current,
        channels: nextChannels,
      };
    });
  };

  const updateMediaChannelStatus = (channel: MediaChannelId, status: MediaChannelStatus) => {
    setNewMediaPost((current) => ({
      ...current,
      channelStatus: {
        ...current.channelStatus,
        [channel]: status,
      },
    }));
  };

  const handleAiEvent = async () => {
    setIsGenerating("event");
    try {
      const generated = await generateEventContent(config.title);
      const event: FundraiserEvent = {
        id: `event-${Date.now()}`,
        title: generated.title ?? "Community Event",
        date: new Date().toISOString(),
        venue: generated.venue ?? "Main Hall",
        campaignId: selectedCampaign?.id ?? config.activeCampaignId,
        fundraiserId: selectedFundraiser?.id,
        volunteerIds: [],
      };
      onUpdate({ events: [event, ...config.events] });
    } finally {
      setIsGenerating(null);
    }
  };

  const handleAiBlog = async () => {
    setIsGenerating("blog");
    try {
      const generated = await generateBlogPost(config.title);
      const nextHtml = `<p>${(generated.content ?? generated.excerpt ?? "Story details pending.").replace(/\n/g, "</p><p>")}</p>`;
      setNewMediaPost((current) => ({
        ...current,
        title: generated.title ?? current.title,
        excerpt: generated.excerpt ?? current.excerpt,
        contentHtml: nextHtml,
      }));
      if (mediaComposerRef.current) {
        mediaComposerRef.current.innerHTML = nextHtml;
      }
      setIsMediaDetailsOpen(true);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleCreateEvent = () => {
    if (!newEvent.title.trim() || !newEvent.venue.trim() || !newEvent.date) {
      return;
    }

    const event: FundraiserEvent = {
      id: `event-${Date.now()}`,
      title: newEvent.title.trim(),
      venue: newEvent.venue.trim(),
      date: newEvent.date,
      campaignId: selectedCampaign?.id ?? config.activeCampaignId,
      fundraiserId: selectedFundraiser?.id,
      volunteerIds: newEvent.volunteerId ? [newEvent.volunteerId] : [],
    };

    onUpdate({ events: [event, ...config.events] });
    setNewEvent((current) => ({ ...current, title: "", venue: "", volunteerId: "" }));
  };

  const handleMediaImageUpload = async (file?: File) => {
    const image = await readImageFile(file);
    if (!image) {
      return;
    }

    setNewMediaPost((current) => ({ ...current, image }));
  };

  const handleCreateMediaPost = () => {
    const bodyText = htmlToPlainText(newMediaPost.contentHtml).trim();
    const excerpt = newMediaPost.excerpt.trim() || bodyText.slice(0, 180);
    if (!newMediaPost.title.trim() || !bodyText || !newMediaPost.author.trim() || !newMediaPost.date || !newMediaPost.channels.length) {
      return;
    }

    onUpdate({
      blogPosts: [
        {
          id: `blog-${Date.now()}`,
          title: newMediaPost.title.trim(),
          excerpt,
          content: newMediaPost.contentHtml.trim(),
          author: newMediaPost.author.trim(),
          date: toShortDate(newMediaPost.date),
          image: newMediaPost.image || undefined,
          channels: newMediaPost.channels,
          channelStatus: newMediaPost.channelStatus,
          whatsappAudience: newMediaPost.whatsappAudience,
        },
        ...config.blogPosts,
      ],
    });

    setNewMediaPost({
      title: "",
      excerpt: "",
      author: "Campaign Team",
      date: new Date().toISOString().split("T")[0],
      image: "",
      contentHtml: "<p>Start writing your campaign message here...</p>",
      channels: MEDIA_DEFAULT_CHANNELS,
      channelStatus: {
        whatsapp: "draft",
        instagram: "draft",
        facebook: "draft",
        twitter: "draft",
      },
      whatsappAudience: "Volunteer broadcast",
    });
    if (mediaComposerRef.current) {
      mediaComposerRef.current.innerHTML = "<p>Start writing your campaign message here...</p>";
    }
  };

  const updateActiveApplicationForm = (updates: Partial<FundraiserConfig["applicationForms"][ApplyPathId]>) => {
    onUpdate({
      applicationForms: {
        ...config.applicationForms,
        [activeApplicationCategory]: {
          ...activeApplicationForm,
          ...updates,
        },
      },
    });
  };

  const updateApplicationField = (
    fieldId: string,
    updates: Partial<FundraiserConfig["applicationForms"][ApplyPathId]["fields"][number]>,
  ) => {
    updateActiveApplicationForm({
      fields: activeApplicationForm.fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
    });
  };

  const handleAddApplicationField = () => {
    if (!newApplicationField.label.trim()) {
      return;
    }

    const options =
      newApplicationField.type === "select"
        ? newApplicationField.options
            .split(",")
            .map((option) => option.trim())
            .filter(Boolean)
        : undefined;

    updateActiveApplicationForm({
      fields: [
        ...activeApplicationForm.fields,
        {
          id: `${activeApplicationCategory}-field-${Date.now()}`,
          label: newApplicationField.label.trim(),
          type: newApplicationField.type,
          placeholder: newApplicationField.placeholder.trim(),
          required: newApplicationField.required,
          options,
        },
      ],
    });

    setNewApplicationField({
      label: "",
      type: "text",
      placeholder: "",
      required: true,
      options: "",
    });
  };

  const updateSelectedCampaign = (
    updater: (campaign: FundraiserConfig["campaigns"][number]) => FundraiserConfig["campaigns"][number],
  ) => {
    if (!selectedCampaign) {
      return;
    }

    onUpdate({
      campaigns: config.campaigns.map((campaign) => (campaign.id === selectedCampaign.id ? updater(campaign) : campaign)),
    });
  };

  const updateSubmissionStatus = (submissionId: string, nextStatus: "new" | "reviewing" | "approved" | "declined") => {
    const submission = activeApplicationForm.submissions.find((entry) => entry.id === submissionId);
    if (!submission) {
      return;
    }

    let nextPartners = config.partners;
    let linkedPartnerId = submission.linkedPartnerId;

    if (activeApplicationCategory === "sponsor" && nextStatus === "approved" && !submission.linkedPartnerId) {
      const tierName = submission.values["sponsor-tier"] ?? "";
      const fallbackTier =
        [...config.partnerTiers].sort((left, right) => left.minCommitment - right.minCommitment)[0] ?? config.partnerTiers[0];
      const resolvedTier =
        config.partnerTiers.find((tier) => tier.name.toLowerCase() === tierName.toLowerCase()) ?? fallbackTier;

      if (resolvedTier) {
        const partnerId = `partner-${Date.now()}`;
        linkedPartnerId = partnerId;
        nextPartners = [
          ...config.partners,
          {
            id: partnerId,
            name: submission.values["sponsor-organization"] ?? "New sponsor",
            contactPerson: submission.values["sponsor-contact-person"] ?? "Team contact",
            email: submission.values["sponsor-email"] ?? "partner@example.org",
            logo:
              "https://images.unsplash.com/photo-1599305090598-fe179d501c27?q=80&w=200&h=200&auto=format&fit=crop",
            tierId: resolvedTier.id,
            status: "active",
            totalContributed: 0,
            joinedDate: new Date().toISOString(),
          },
        ];
      }
    }

    onUpdate({
      partners: nextPartners,
      applicationForms: {
        ...config.applicationForms,
        [activeApplicationCategory]: {
          ...activeApplicationForm,
          submissions: activeApplicationForm.submissions.map((entry) =>
            entry.id === submissionId ? { ...entry, status: nextStatus, linkedPartnerId } : entry,
          ),
        },
      },
    });
  };

  const startHelpConversion = (submissionId: string) => {
    const submission = config.applicationForms.help.submissions.find((entry) => entry.id === submissionId);
    if (!submission) {
      return;
    }

    setConversionSubmissionId(submission.id);
    setConversionDraft({
      legalName: submission.values["help-full-name"] ?? "",
      nationalId: "",
      contactPhone: submission.values["help-phone"] ?? "",
      contactEmail: submission.values["help-email"] ?? "",
      physicalAddress: submission.values["help-address"] ?? "",
      requestedAmount: submission.values["help-requested-amount"] ?? "",
      approvalNotes: submission.reviewNotes ?? "",
      fundraiserTitle: submission.values["help-support-type"] ? `${submission.values["help-support-type"]} Support Fund` : "Community Support Fund",
      fundraiserSummary: submission.values["help-details"] ?? "",
    });
  };

  const confirmHelpConversion = () => {
    if (!selectedCampaign || !conversionSubmission) {
      return;
    }

    const requestedAmount = Number(conversionDraft.requestedAmount || 0);
    if (
      !conversionDraft.legalName.trim() ||
      !conversionDraft.nationalId.trim() ||
      !conversionDraft.contactPhone.trim() ||
      !conversionDraft.physicalAddress.trim() ||
      !conversionDraft.fundraiserTitle.trim() ||
      requestedAmount <= 0
    ) {
      return;
    }

    const fundraiserId = `fund-${Date.now()}`;
    const fundraiserSlug = toSlug(conversionDraft.fundraiserTitle) || fundraiserId;

    const fundraiser = {
      id: fundraiserId,
      campaignId: selectedCampaign.id,
      slug: fundraiserSlug,
      title: conversionDraft.fundraiserTitle.trim(),
      summary: conversionDraft.fundraiserSummary.trim() || "Officially approved fundraiser conversion.",
      story: conversionDraft.fundraiserSummary.trim() || "Fundraiser details pending.",
      goal: requestedAmount,
      raised: 0,
      heroImage:
        "https://images.unsplash.com/photo-1469571486292-b53601020e6b?q=80&w=1200&auto=format&fit=crop",
      status: "active" as const,
      sourceSubmissionId: conversionSubmission.id,
      officialDocument: {
        legalName: conversionDraft.legalName.trim(),
        nationalId: conversionDraft.nationalId.trim(),
        contactPhone: conversionDraft.contactPhone.trim(),
        contactEmail: conversionDraft.contactEmail.trim(),
        physicalAddress: conversionDraft.physicalAddress.trim(),
        requestedAmount,
        approvalNotes: conversionDraft.approvalNotes.trim(),
      },
    };

    onUpdate({
      campaigns: config.campaigns.map((campaign) =>
        campaign.id === selectedCampaign.id
          ? {
              ...campaign,
              preset: campaign.preset === "general" ? "hybrid" : campaign.preset,
              allowsFundraisers: true,
              fundraisers: [fundraiser, ...campaign.fundraisers],
            }
          : campaign,
      ),
      applicationForms: {
        ...config.applicationForms,
        help: {
          ...config.applicationForms.help,
          submissions: config.applicationForms.help.submissions.map((entry) =>
            entry.id === conversionSubmission.id
              ? {
                  ...entry,
                  status: "approved",
                  reviewNotes: conversionDraft.approvalNotes.trim(),
                  convertedFundraiserId: fundraiserId,
                }
              : entry,
          ),
        },
      },
    });

    onSelectFundraiser?.(fundraiserSlug);
    setConversionSubmissionId(null);
  };

  const applicationSubmissionColumns = useMemo<
    DataTableColumn<(typeof activeApplicationForm.submissions)[number]>[]
  >(
    () => [
      {
        key: "submittedAt",
        header: "Submitted",
        accessor: (row) => row.submittedAt,
        sortable: true,
        cell: (row) => toShortDate(row.submittedAt),
      },
      {
        key: "primary",
        header: "Primary response",
        accessor: (row) => {
          const firstField = activeApplicationForm.fields[0];
          if (!firstField) {
            return "-";
          }
          return row.values[firstField.id] ?? "-";
        },
        sortable: false,
      },
      {
        key: "summary",
        header: "Submission details",
        accessor: (row) =>
          Object.entries(row.values)
            .map((entry) => entry[1])
            .filter(Boolean)
            .join(" | "),
        sortable: false,
      },
      {
        key: "status",
        header: "Status",
        accessor: (row) => row.status,
        sortable: true,
        searchable: false,
        cell: (row) => (
          <Select
            value={row.status}
            onValueChange={(value) => updateSubmissionStatus(row.id, value as "new" | "reviewing" | "approved" | "declined")}
          >
            <SelectTrigger className="w-[9rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        accessor: () => "",
        searchable: false,
        cell: (row) =>
          activeApplicationCategory === "help" ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => startHelpConversion(row.id)}
              disabled={Boolean(row.convertedFundraiserId) || (row.status !== "reviewing" && row.status !== "approved")}
            >
              {row.convertedFundraiserId ? "Converted" : "Review & convert"}
            </Button>
          ) : row.linkedPartnerId ? (
            <Badge className="bg-emerald-100 text-emerald-700">Partner created</Badge>
          ) : (
            <span className="text-xs text-slate-500">-</span>
          ),
      },
    ],
    [activeApplicationCategory, activeApplicationForm.fields, activeApplicationForm.submissions],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="border-b border-slate-200 bg-white px-8 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Layers className="size-5" />
            </span>
            <div className="space-y-0.5">
              <h1 className="font-display text-3xl text-slate-900">{config.tenantName} Command Hub</h1>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Enterprise Administration</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {selectedCampaign ? (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1">
                <Select
                  value={selectedCampaign.slug}
                  onValueChange={(value) => {
                    onSelectCampaign?.(value);
                    const campaign = config.campaigns.find((entry) => entry.slug === value);
                    const nextFundraiser = campaign?.fundraisers[0];
                    if (nextFundraiser) {
                      onSelectFundraiser?.(nextFundraiser.slug);
                    }
                  }}
                >
                  <SelectTrigger className="h-8 w-[15rem] border-none bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {config.campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.slug}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCampaign.allowsFundraisers && selectedCampaignFundraisers.length ? (
                  <Select value={selectedFundraiser?.slug} onValueChange={(value) => onSelectFundraiser?.(value)}>
                    <SelectTrigger className="h-8 w-[14rem] border-none bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCampaignFundraisers.map((fundraiser) => (
                        <SelectItem key={fundraiser.id} value={fundraiser.slug}>
                          {fundraiser.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="px-2 text-xs uppercase tracking-[0.14em] text-slate-500">General campaign mode</p>
                )}
              </div>
            ) : null}
            <Badge className="bg-emerald-100 text-emerald-700">
              <BadgeCheck className="size-3.5" />
              Everything synced
            </Badge>
            <Badge className="bg-slate-100 text-slate-700">
              <LayoutTemplate className="size-3.5" />
              Website updates are live
            </Badge>
            <Badge className="bg-blue-100 text-blue-700">
              <BookOpen className="size-3.5" />
              Donor records are organized
            </Badge>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DashboardTabId)} className="space-y-6">
          <div className="sticky top-0 z-20 -mx-8 border-b border-slate-200 bg-white px-8 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TabsList className="h-auto w-full justify-start gap-1 rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="overview"
                  title={DASHBOARD_TAB_META.overview.label}
                  className="h-10 gap-2 rounded-lg border border-transparent px-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 data-[state=active]:border-slate-200 data-[state=active]:bg-slate-100 data-[state=active]:text-indigo-700"
                >
                  {DASHBOARD_TAB_META.overview.icon}
                  {DASHBOARD_TAB_META.overview.label}
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  title={DASHBOARD_TAB_META.media.label}
                  className="h-10 gap-2 rounded-lg border border-transparent px-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 data-[state=active]:border-slate-200 data-[state=active]:bg-slate-100 data-[state=active]:text-indigo-700"
                >
                  {DASHBOARD_TAB_META.media.icon}
                  {DASHBOARD_TAB_META.media.label}
                </TabsTrigger>
                <TabsTrigger
                  value="fundraising"
                  title={DASHBOARD_TAB_META.fundraising.label}
                  className="h-10 gap-2 rounded-lg border border-transparent px-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 data-[state=active]:border-slate-200 data-[state=active]:bg-slate-100 data-[state=active]:text-indigo-700"
                >
                  {DASHBOARD_TAB_META.fundraising.icon}
                  {DASHBOARD_TAB_META.fundraising.label}
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  title={DASHBOARD_TAB_META.events.label}
                  className="h-10 gap-2 rounded-lg border border-transparent px-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 data-[state=active]:border-slate-200 data-[state=active]:bg-slate-100 data-[state=active]:text-indigo-700"
                >
                  {DASHBOARD_TAB_META.events.icon}
                  {DASHBOARD_TAB_META.events.label}
                </TabsTrigger>
                <div className="mx-1 h-6 w-px self-center bg-slate-200" />
                <TabsTrigger
                  value="applications"
                  title={DASHBOARD_TAB_META.applications.label}
                  className="h-10 gap-2 rounded-lg border border-transparent px-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 data-[state=active]:border-slate-200 data-[state=active]:bg-slate-100 data-[state=active]:text-indigo-700"
                >
                  {DASHBOARD_TAB_META.applications.icon}
                  {DASHBOARD_TAB_META.applications.label}
                </TabsTrigger>
                <TabsTrigger
                  value="operations"
                  title={DASHBOARD_TAB_META.operations.label}
                  className="h-10 gap-2 rounded-lg border border-transparent px-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 data-[state=active]:border-slate-200 data-[state=active]:bg-slate-100 data-[state=active]:text-indigo-700"
                >
                  {DASHBOARD_TAB_META.operations.icon}
                  {DASHBOARD_TAB_META.operations.label}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <section className="grid gap-4 md:grid-cols-4">
              <StatCard title="Total raised" value={`$${config.raised.toLocaleString()}`} icon={<HandCoins className="size-5" />} trend={{ value: 12, label: "vs last week" }} subtitle="vs last week" />
              <StatCard title="Donors recorded" value={String(config.donations.length)} icon={<BadgeCheck className="size-5" />} trend={{ value: 8, label: "vs last week" }} subtitle="vs last week" />
              <StatCard title="Events scheduled" value={String(config.events.length)} icon={<Calendar className="size-5" />} trend={{ value: -3, label: "vs last month" }} subtitle="vs last month" />
              <StatCard title="Partner mentions" value={String(config.partnerMentions.length)} icon={<BookOpen className="size-5" />} trend={{ value: 24, label: "vs last quarter" }} subtitle="vs last quarter" />
            </section>

            <PendingActionsCard config={config} />

            <Card className="glass-surface">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Giving trend this week</CardTitle>
                <CardDescription>Donations vs. supporter reach — see how activity is moving each day.</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ANALYTICS_DATA}>
                    <defs>
                      <linearGradient id="raisedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f766e" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="reachGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d6e4e2" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="reach" stroke="#6366f1" fill="url(#reachGradient)" strokeWidth={2} strokeDasharray="5 3" />
                    <Area type="monotone" dataKey="donations" stroke="#0f766e" fill="url(#raisedGradient)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <DataTable
              title="Organization feature overview"
              description="See what is ready and where your team manages each area."
              data={DOMAIN_ROWS}
              columns={DOMAIN_COLUMNS}
              defaultSortKey="domain"
              searchPlaceholder="Search domains..."
            />
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
              <Card className="glass-surface">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Media studio</CardTitle>
                  <CardDescription>
                    Write once, adapt per channel, and publish with a cleaner WYSIWYG workflow.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Sheet open={isMediaDetailsOpen} onOpenChange={setIsMediaDetailsOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline" type="button">
                          <LayoutTemplate className="size-4" />
                          Post details
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-full max-w-xl overflow-y-auto bg-white">
                        <SheetHeader className="mb-4">
                          <SheetTitle>Post details</SheetTitle>
                          <SheetDescription>
                            Keep these fields tucked away until you need them.
                          </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="media-title">Story title</Label>
                            <Input
                              id="media-title"
                              value={newMediaPost.title}
                              onChange={(event) => setNewMediaPost((current) => ({ ...current, title: event.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="media-excerpt">Short summary (optional)</Label>
                            <Textarea
                              id="media-excerpt"
                              rows={3}
                              value={newMediaPost.excerpt}
                              onChange={(event) => setNewMediaPost((current) => ({ ...current, excerpt: event.target.value }))}
                            />
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="media-author">Author</Label>
                              <Input
                                id="media-author"
                                value={newMediaPost.author}
                                onChange={(event) => setNewMediaPost((current) => ({ ...current, author: event.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="media-date">Publish date</Label>
                              <Input
                                id="media-date"
                                type="date"
                                value={newMediaPost.date}
                                onChange={(event) => setNewMediaPost((current) => ({ ...current, date: event.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Cover image</Label>
                            <Button variant="outline" className="w-full" type="button" asChild>
                              <label className="cursor-pointer">
                                <ImagePlus className="size-4" />
                                Upload cover image
                                <input
                                  type="file"
                                  accept={IMAGE_FILE_ACCEPT}
                                  className="hidden"
                                  onChange={(event) => handleMediaImageUpload(event.target.files?.[0])}
                                />
                              </label>
                            </Button>
                            <Input
                              value={newMediaPost.image}
                              onChange={(event) => setNewMediaPost((current) => ({ ...current, image: event.target.value }))}
                              placeholder="Or paste image URL"
                            />
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>

                    <Sheet open={isMediaChannelsOpen} onOpenChange={setIsMediaChannelsOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline" type="button">
                          <Layers className="size-4" />
                          Channel settings
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-full max-w-xl overflow-y-auto bg-white">
                        <SheetHeader className="mb-4">
                          <SheetTitle>Channel manager</SheetTitle>
                          <SheetDescription>
                            Control WhatsApp communications and social platform activity from one panel.
                          </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-4">
                          {(Object.keys(MEDIA_CHANNEL_META) as MediaChannelId[]).map((channel) => (
                            <Card key={channel} className="border-slate-200/80">
                              <CardContent className="space-y-3 p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="inline-flex items-center gap-2 font-medium text-slate-900">
                                      {MEDIA_CHANNEL_META[channel].icon}
                                      {MEDIA_CHANNEL_META[channel].label}
                                    </p>
                                    <p className="text-xs text-slate-500">{MEDIA_CHANNEL_META[channel].audienceLabel}</p>
                                  </div>
                                  <Switch
                                    checked={newMediaPost.channels.includes(channel)}
                                    onCheckedChange={(checked) => toggleMediaChannel(channel, checked)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Publishing status</Label>
                                  <Select
                                    value={newMediaPost.channelStatus[channel]}
                                    onValueChange={(value) => updateMediaChannelStatus(channel, value as MediaChannelStatus)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="draft">Draft</SelectItem>
                                      <SelectItem value="scheduled">Scheduled</SelectItem>
                                      <SelectItem value="live">Live</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </CardContent>
                            </Card>
                          ))}

                          {newMediaPost.channels.includes("whatsapp") ? (
                            <div className="space-y-2">
                              <Label htmlFor="whatsapp-audience">WhatsApp audience</Label>
                              <Input
                                id="whatsapp-audience"
                                value={newMediaPost.whatsappAudience}
                                onChange={(event) =>
                                  setNewMediaPost((current) => ({ ...current, whatsappAudience: event.target.value }))
                                }
                                placeholder="Example: Event volunteers and local coordinators"
                              />
                            </div>
                          ) : null}
                        </div>
                      </SheetContent>
                    </Sheet>

                    <Button onClick={handleAiBlog} disabled={isGenerating === "blog"} type="button" variant="outline">
                      <Sparkles className={isGenerating === "blog" ? "size-4 animate-spin" : "size-4"} />
                      {isGenerating === "blog" ? "Generating..." : "Generate draft"}
                    </Button>
                    <Button onClick={handleCreateMediaPost} type="button">
                      <SendHorizontal className="size-4" />
                      Publish to queue
                    </Button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white">
                    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => applyMediaComposerFormat("bold")}>
                        <Bold className="size-4" />
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => applyMediaComposerFormat("italic")}>
                        <Italic className="size-4" />
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => applyMediaComposerFormat("formatBlock", "h2")}>
                        <Heading2 className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => applyMediaComposerFormat("insertUnorderedList")}
                      >
                        <List className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const url = window.prompt("Enter a URL");
                          if (url) {
                            applyMediaComposerFormat("createLink", url);
                          }
                        }}
                      >
                        <Link className="size-4" />
                      </Button>
                    </div>
                    <div
                      ref={mediaComposerRef}
                      className="min-h-[14rem] px-4 py-3 text-sm text-slate-700 outline-none [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-2"
                      contentEditable
                      suppressContentEditableWarning
                      dangerouslySetInnerHTML={{ __html: newMediaPost.contentHtml }}
                      onInput={(event) =>
                        setNewMediaPost((current) => ({
                          ...current,
                          contentHtml: event.currentTarget.innerHTML,
                        }))
                      }
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {newMediaPost.channels.map((channel) => (
                      <Card key={`composer-preview-${channel}`} className="border-slate-200/80">
                        <CardContent className="space-y-2 p-4">
                          <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                            {MEDIA_CHANNEL_META[channel].icon}
                            {MEDIA_CHANNEL_META[channel].label}
                          </p>
                          <p className="text-xs text-slate-500">
                            Status: {newMediaPost.channelStatus[channel]} | Audience:{" "}
                            {channel === "whatsapp" ? newMediaPost.whatsappAudience : MEDIA_CHANNEL_META[channel].audienceLabel}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-surface">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Distribution pulse</CardTitle>
                  <CardDescription>Quick read of live, scheduled, and draft channel activity.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                      <p className="text-xs uppercase tracking-[0.15em] text-emerald-700">Live posts</p>
                      <p className="font-display text-3xl text-emerald-800">{mediaActivitySummary.live}</p>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                      <p className="text-xs uppercase tracking-[0.15em] text-amber-700">Scheduled posts</p>
                      <p className="font-display text-3xl text-amber-800">{mediaActivitySummary.scheduled}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-700">Draft posts</p>
                      <p className="font-display text-3xl text-slate-800">{mediaActivitySummary.draft}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    WhatsApp coordination, Instagram/Facebook storytelling, and Twitter updates are managed from this one media studio.
                  </p>
                </CardContent>
              </Card>
            </div>

            <DataTable
              title="Media stories"
              description="Search and sort every story shown on your public media page."
              data={config.blogPosts}
              columns={mediaColumns}
              defaultSortKey="date"
              defaultSortDirection="desc"
              searchPlaceholder="Search stories..."
            />

            <DataTable
              title="Channel activity"
              description="Cross-channel publishing activity, including WhatsApp communications and social feed readiness."
              data={mediaActivityRows}
              columns={mediaActivityColumns}
              defaultSortKey="scheduledFor"
              defaultSortDirection="desc"
              searchPlaceholder="Search channel activity..."
            />
          </TabsContent>

          <TabsContent value="fundraising" className="space-y-6">
            <DataTable
              title="Donation ledger"
              description="Search, sort, and review supporter contributions in one place."
              data={config.donations}
              columns={donationColumns}
              defaultSortKey="date"
              defaultSortDirection="desc"
              searchPlaceholder="Search supporters..."
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="glass-surface">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Campaign controls</CardTitle>
                  <CardDescription>Adjust campaign goals and supporter wording shown on your public pages.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-title">Campaign title</Label>
                    <Input
                      id="campaign-title"
                      value={selectedCampaign?.name ?? config.title}
                      onChange={(event) =>
                        updateSelectedCampaign((campaign) => ({
                          ...campaign,
                          name: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Campaign mode preset</Label>
                    <Select
                      value={selectedCampaign?.preset ?? "hybrid"}
                      onValueChange={(value) =>
                        updateSelectedCampaign((campaign) => ({
                          ...campaign,
                          preset: value as "general" | "fundraiser-based" | "hybrid",
                          allowsDirectDonations: value === "general" || value === "hybrid",
                          allowsFundraisers: value === "fundraiser-based" || value === "hybrid",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General campaign (direct donations only)</SelectItem>
                        <SelectItem value="fundraiser-based">Fundraiser-based (fundraisers only)</SelectItem>
                        <SelectItem value="hybrid">Hybrid campaign (default)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Allow direct donations</p>
                        <p className="text-xs text-slate-500">Campaign pool donations without fundraiser targeting.</p>
                      </div>
                      <Switch
                        checked={selectedCampaign?.allowsDirectDonations ?? true}
                        onCheckedChange={(checked) =>
                          updateSelectedCampaign((campaign) => ({
                            ...campaign,
                            allowsDirectDonations: checked,
                            preset: checked && campaign.allowsFundraisers
                              ? "hybrid"
                              : checked
                                ? "general"
                                : campaign.allowsFundraisers
                                  ? "fundraiser-based"
                                  : campaign.preset,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Allow fundraiser pages</p>
                        <p className="text-xs text-slate-500">Each fundraiser gets its own public URL.</p>
                      </div>
                      <Switch
                        checked={selectedCampaign?.allowsFundraisers ?? true}
                        onCheckedChange={(checked) =>
                          updateSelectedCampaign((campaign) => ({
                            ...campaign,
                            allowsFundraisers: checked,
                            preset: campaign.allowsDirectDonations && checked
                              ? "hybrid"
                              : campaign.allowsDirectDonations
                                ? "general"
                                : checked
                                  ? "fundraiser-based"
                                  : campaign.preset,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campaign-goal">Goal amount</Label>
                    <Input
                      id="campaign-goal"
                      type="number"
                      value={config.goal}
                      onChange={(event) => onUpdate({ goal: Number(event.target.value || 0) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="donation-label">Donation label</Label>
                    <Input
                      id="donation-label"
                      value={config.terminology.donation}
                      onChange={(event) =>
                        onUpdate({ terminology: { ...config.terminology, donation: event.target.value } })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Campaign active</p>
                      <p className="text-xs text-slate-500">Controls whether public donation routes are open.</p>
                    </div>
                    <Switch checked={config.active} onCheckedChange={(checked) => onUpdate({ active: checked })} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-surface">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Tier strategy</CardTitle>
                  <CardDescription>Donation tiers mirrored in the preview donation dialog.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {config.tiers.map((tier) => (
                    <div key={tier.id} className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="font-medium text-slate-900">
                        {tier.label}: ${tier.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-600">{tier.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
              <EventCalendar
                events={config.events}
                title="Event calendar"
                description="Highlighted dates are synced with builder and public preview event experiences."
              />
              <DataTable
                title="Event schedule"
                description="Search and sort all scheduled events."
                data={config.events}
                columns={eventColumns}
                defaultSortKey="date"
                defaultSortDirection="asc"
                searchPlaceholder="Search events..."
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <Card className="glass-surface">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Create event</CardTitle>
                  <CardDescription>Add events and immediately see the date markers update in all surfaces.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="event-title">Event title</Label>
                    <Input
                      id="event-title"
                      value={newEvent.title}
                      onChange={(event) => setNewEvent((current) => ({ ...current, title: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-venue">Venue</Label>
                    <Input
                      id="event-venue"
                      value={newEvent.venue}
                      onChange={(event) => setNewEvent((current) => ({ ...current, venue: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-date">Date</Label>
                    <Input
                      id="event-date"
                      type="date"
                      value={newEvent.date}
                      onChange={(event) => setNewEvent((current) => ({ ...current, date: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Assign lead volunteer</Label>
                    <Select
                      value={newEvent.volunteerId}
                      onValueChange={(value) => setNewEvent((current) => ({ ...current, volunteerId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Optional volunteer assignment" />
                      </SelectTrigger>
                      <SelectContent>
                        {config.volunteers.map((volunteer) => (
                          <SelectItem key={volunteer.id} value={volunteer.id}>
                            {volunteer.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateEvent} type="button">
                    <Plus className="size-4" />
                    Add event
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-surface">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Event generation</CardTitle>
                  <CardDescription>Use quick idea generation when you need help naming or drafting an event.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={handleAiEvent} disabled={isGenerating === "event"} type="button">
                    <Sparkles className={isGenerating === "event" ? "size-4 animate-spin" : "size-4"} />
                    {isGenerating === "event" ? "Creating..." : "Create event idea"}
                  </Button>
                  <p className="text-sm text-slate-600">
                    New ideas appear instantly in this calendar, the website builder, and the public preview.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
              {APPLICATION_CATEGORY_ORDER.map((categoryId) => (
                <StatCard
                  key={categoryId}
                  title={APPLICATION_CATEGORY_META[categoryId].label}
                  value={String(
                    config.applicationForms[categoryId].submissions.filter(
                      (submission) => !selectedCampaign || submission.campaignId === selectedCampaign.id,
                    ).length,
                  )}
                  icon={renderApplicationCategoryIcon(categoryId)}
                />
              ))}
            </section>

            <Card className="glass-surface">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Application form manager</CardTitle>
                <CardDescription>Manage fields, labels, and submissions for each public apply path.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {APPLICATION_CATEGORY_ORDER.map((categoryId) => (
                    <Button
                      key={categoryId}
                      type="button"
                      variant={activeApplicationCategory === categoryId ? "secondary" : "outline"}
                      className="rounded-full"
                      onClick={() => setActiveApplicationCategory(categoryId)}
                    >
                      {renderApplicationCategoryIcon(categoryId, "size-4")}
                      {APPLICATION_CATEGORY_META[categoryId].label}
                    </Button>
                  ))}
                </div>
                <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs uppercase tracking-[0.15em] text-slate-500">
                  Public path: {APPLICATION_CATEGORY_META[activeApplicationCategory].path}
                </p>
              </CardContent>
            </Card>

            <DataTable
              title="Submission inbox"
              description="Submissions sent from the public apply path."
              data={activeApplicationSubmissions}
              columns={applicationSubmissionColumns}
              defaultSortKey="submittedAt"
              defaultSortDirection="desc"
              searchPlaceholder="Search submissions..."
            />

            <DataTable
              title="Form fields"
              description="Current field set for this application category."
              data={activeApplicationForm.fields}
              columns={applicationFieldColumns}
              defaultSortKey="label"
              searchPlaceholder="Search fields..."
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="glass-surface">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Form content</CardTitle>
                  <CardDescription>These labels appear on the public application page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="apply-title">Title</Label>
                    <Input
                      id="apply-title"
                      value={activeApplicationForm.title}
                      onChange={(event) => updateActiveApplicationForm({ title: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apply-description">Description</Label>
                    <Textarea
                      id="apply-description"
                      rows={3}
                      value={activeApplicationForm.description}
                      onChange={(event) => updateActiveApplicationForm({ description: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apply-submit-label">Submit button label</Label>
                    <Input
                      id="apply-submit-label"
                      value={activeApplicationForm.submitLabel}
                      onChange={(event) => updateActiveApplicationForm({ submitLabel: event.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-surface">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Add field</CardTitle>
                  <CardDescription>Create dynamic fields for this category form.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="new-field-label">Field label</Label>
                    <Input
                      id="new-field-label"
                      value={newApplicationField.label}
                      onChange={(event) =>
                        setNewApplicationField((current) => ({ ...current, label: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Field type</Label>
                    <Select
                      value={newApplicationField.type}
                      onValueChange={(value) =>
                        setNewApplicationField((current) => ({ ...current, type: value as ApplicationFieldType }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="textarea">Paragraph</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-field-placeholder">Placeholder</Label>
                    <Input
                      id="new-field-placeholder"
                      value={newApplicationField.placeholder}
                      onChange={(event) =>
                        setNewApplicationField((current) => ({ ...current, placeholder: event.target.value }))
                      }
                    />
                  </div>
                  {newApplicationField.type === "select" ? (
                    <div className="space-y-2">
                      <Label htmlFor="new-field-options">Dropdown options</Label>
                      <Input
                        id="new-field-options"
                        value={newApplicationField.options}
                        onChange={(event) =>
                          setNewApplicationField((current) => ({ ...current, options: event.target.value }))
                        }
                        placeholder="Option A, Option B, Option C"
                      />
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                    <p className="text-sm text-slate-700">Required field</p>
                    <Switch
                      checked={newApplicationField.required}
                      onCheckedChange={(checked) =>
                        setNewApplicationField((current) => ({ ...current, required: checked }))
                      }
                    />
                  </div>
                  <Button type="button" onClick={handleAddApplicationField}>
                    <Plus className="size-4" />
                    Add field
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-surface">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Field editor</CardTitle>
                <CardDescription>Adjust labels and behavior for each field.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeApplicationForm.fields.map((field) => (
                  <Card key={field.id} className="border-slate-200/80">
                    <CardContent className="space-y-3 p-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`field-label-${field.id}`}>Field label</Label>
                          <Input
                            id={`field-label-${field.id}`}
                            value={field.label}
                            onChange={(event) => updateApplicationField(field.id, { label: event.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Field type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) =>
                              updateApplicationField(field.id, {
                                type: value as ApplicationFieldType,
                                options: value === "select" ? field.options ?? [] : undefined,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="textarea">Paragraph</SelectItem>
                              <SelectItem value="select">Dropdown</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`field-placeholder-${field.id}`}>Placeholder</Label>
                        <Input
                          id={`field-placeholder-${field.id}`}
                          value={field.placeholder}
                          onChange={(event) => updateApplicationField(field.id, { placeholder: event.target.value })}
                        />
                      </div>
                      {field.type === "select" ? (
                        <div className="space-y-2">
                          <Label htmlFor={`field-options-${field.id}`}>Dropdown options</Label>
                          <Input
                            id={`field-options-${field.id}`}
                            value={(field.options ?? []).join(", ")}
                            onChange={(event) =>
                              updateApplicationField(field.id, {
                                options: event.target.value
                                  .split(",")
                                  .map((option) => option.trim())
                                  .filter(Boolean),
                              })
                            }
                          />
                        </div>
                      ) : null}
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                        <p className="text-sm text-slate-700">Required field</p>
                        <Switch
                          checked={field.required}
                          onCheckedChange={(checked) => updateApplicationField(field.id, { required: checked })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {conversionSubmission ? (
              <Card className="glass-surface">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Convert help request to fundraiser</CardTitle>
                  <CardDescription>
                    Complete this official review form before activating the fundraiser page.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="convert-legal-name">Legal name</Label>
                      <Input
                        id="convert-legal-name"
                        value={conversionDraft.legalName}
                        onChange={(event) =>
                          setConversionDraft((current) => ({ ...current, legalName: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="convert-national-id">National ID / Passport</Label>
                      <Input
                        id="convert-national-id"
                        value={conversionDraft.nationalId}
                        onChange={(event) =>
                          setConversionDraft((current) => ({ ...current, nationalId: event.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="convert-contact-phone">Contact phone</Label>
                      <Input
                        id="convert-contact-phone"
                        value={conversionDraft.contactPhone}
                        onChange={(event) =>
                          setConversionDraft((current) => ({ ...current, contactPhone: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="convert-contact-email">Contact email</Label>
                      <Input
                        id="convert-contact-email"
                        value={conversionDraft.contactEmail}
                        onChange={(event) =>
                          setConversionDraft((current) => ({ ...current, contactEmail: event.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="convert-physical-address">Physical address</Label>
                    <Textarea
                      id="convert-physical-address"
                      rows={2}
                      value={conversionDraft.physicalAddress}
                      onChange={(event) =>
                        setConversionDraft((current) => ({ ...current, physicalAddress: event.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="convert-fundraiser-title">Fundraiser title</Label>
                      <Input
                        id="convert-fundraiser-title"
                        value={conversionDraft.fundraiserTitle}
                        onChange={(event) =>
                          setConversionDraft((current) => ({ ...current, fundraiserTitle: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="convert-requested-amount">Requested amount</Label>
                      <Input
                        id="convert-requested-amount"
                        type="number"
                        value={conversionDraft.requestedAmount}
                        onChange={(event) =>
                          setConversionDraft((current) => ({ ...current, requestedAmount: event.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="convert-summary">Fundraiser summary</Label>
                    <Textarea
                      id="convert-summary"
                      rows={3}
                      value={conversionDraft.fundraiserSummary}
                      onChange={(event) =>
                        setConversionDraft((current) => ({ ...current, fundraiserSummary: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="convert-notes">Approval notes</Label>
                    <Textarea
                      id="convert-notes"
                      rows={2}
                      value={conversionDraft.approvalNotes}
                      onChange={(event) =>
                        setConversionDraft((current) => ({ ...current, approvalNotes: event.target.value }))
                      }
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={confirmHelpConversion}>
                      Convert to fundraiser
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setConversionSubmissionId(null)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card className="glass-surface">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Partner pool allocations moved</CardTitle>
                <CardDescription>
                  Allocation requests and approvals are now managed in CRM under the Partners tab to keep application
                  review and partner finance workflows separate.
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard title="Branches tracked" value={String(config.branches.length)} icon={<Workflow className="size-5" />} />
              <StatCard title="Legacy requests" value={String(config.applications.length)} icon={<FileCheck2 className="size-5" />} />
            </div>

            <DataTable
              title="Branch list"
              description="Keep branch names and locations easy to find."
              data={config.branches}
              columns={branchColumns}
              defaultSortKey="name"
              searchPlaceholder="Search branches..."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: { value: number; label: string };
  subtitle?: string;
}

function StatCard({ title, value, icon, trend, subtitle }: StatCardProps) {
  return (
    <Card className="glass-surface">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="font-display text-3xl font-semibold text-slate-900">{value}</p>
            {trend ? (
              <span className={`text-xs font-medium ${trend.value >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            ) : null}
          </div>
          {subtitle ? <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p> : null}
        </div>
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">{icon}</span>
      </CardContent>
    </Card>
  );
}

function PendingActionsCard({ config }: { config: FundraiserConfig }) {
  const newApplications = Object.values(config.applicationForms)
    .flatMap((form) => form.submissions)
    .filter((submission) => submission.status === "new").length;
  const eventsWithoutVolunteers = config.events.filter((event) => !event.volunteerIds?.length).length;
  const pendingCertificates = config.donations.filter((donation) => !donation.certificateGenerated).length;

  const actions: { label: string; icon: ReactNode }[] = [
    ...(newApplications > 0
      ? [{ label: `${newApplications} application submission(s) need review`, icon: <FileCheck2 className="size-4" /> }]
      : []),
    ...(eventsWithoutVolunteers > 0
      ? [{ label: `${eventsWithoutVolunteers} event(s) have no volunteers assigned`, icon: <CalendarDays className="size-4" /> }]
      : []),
    ...(pendingCertificates > 0
      ? [{ label: `${pendingCertificates} donation certificate(s) pending`, icon: <BadgeCheck className="size-4" /> }]
      : []),
  ];

  if (!actions.length) {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-amber-50/60">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-amber-600" />
          <CardTitle className="font-display text-lg">Pending actions</CardTitle>
        </div>
        <CardDescription>Items that need your attention right now</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.map((action) => (
            <div key={action.label} className="flex items-center gap-3 rounded-lg bg-white/70 px-4 py-2.5 text-sm text-slate-700">
              <span className="text-amber-600">{action.icon}</span>
              {action.label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function toShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
