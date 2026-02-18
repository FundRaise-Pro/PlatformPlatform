import { ReactNode, useMemo, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Calendar,
  FileCheck2,
  HandHeart,
  Handshake,
  House,
  ImagePlus,
  HandCoins,
  LayoutTemplate,
  Layers,
  Plus,
  Sparkles,
  Workflow,
  UsersRound,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  { id: "stories", domain: "Stories", route: "/fundraiser/stories", status: "Ready", owner: "Content Team" },
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
  { key: "status", header: "Status", accessor: (row) => row.status, sortable: true },
  { key: "owner", header: "Owner", accessor: (row) => row.owner, sortable: true },
];

export default function Dashboard({ config, onUpdate }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTabId>("overview");
  const [isGenerating, setIsGenerating] = useState<GeneratorMode>(null);
  const [activeApplicationCategory, setActiveApplicationCategory] = useState<ApplyPathId>("volunteer");
  const [newEvent, setNewEvent] = useState<{ title: string; venue: string; date: string }>({
    title: "",
    venue: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [newMediaPost, setNewMediaPost] = useState<{
    title: string;
    excerpt: string;
    author: string;
    date: string;
    image: string;
  }>({
    title: "",
    excerpt: "",
    author: "",
    date: new Date().toISOString().split("T")[0],
    image: "",
  });
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

  const activeApplicationForm = config.applicationForms[activeApplicationCategory];

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
            onValueChange={(value) =>
              onUpdate({
                applicationForms: {
                  ...config.applicationForms,
                  [activeApplicationCategory]: {
                    ...activeApplicationForm,
                    submissions: activeApplicationForm.submissions.map((submission) =>
                      submission.id === row.id
                        ? { ...submission, status: value as "new" | "reviewing" | "approved" | "declined" }
                        : submission,
                    ),
                  },
                },
              })
            }
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
    ],
    [activeApplicationCategory, activeApplicationForm, config.applicationForms, onUpdate],
  );

  const handleAiEvent = async () => {
    setIsGenerating("event");
    try {
      const generated = await generateEventContent(config.title);
      const event: FundraiserEvent = {
        id: `event-${Date.now()}`,
        title: generated.title ?? "Community Event",
        date: new Date().toISOString(),
        venue: generated.venue ?? "Main Hall",
        linkedCampaignId: config.id,
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
      onUpdate({
        blogPosts: [
          {
            id: `blog-${Date.now()}`,
            title: generated.title ?? "Campaign update",
            excerpt: generated.excerpt ?? "New update published.",
            content: generated.content ?? "Story details pending.",
            date: new Date().toLocaleDateString(),
            author: "Content Bot",
          },
          ...config.blogPosts,
        ],
      });
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
      linkedCampaignId: config.id,
    };

    onUpdate({ events: [event, ...config.events] });
    setNewEvent((current) => ({ ...current, title: "", venue: "" }));
  };

  const handleMediaImageUpload = async (file?: File) => {
    const image = await readImageFile(file);
    if (!image) {
      return;
    }

    setNewMediaPost((current) => ({ ...current, image }));
  };

  const handleCreateMediaPost = () => {
    if (!newMediaPost.title.trim() || !newMediaPost.excerpt.trim() || !newMediaPost.author.trim() || !newMediaPost.date) {
      return;
    }

    onUpdate({
      blogPosts: [
        {
          id: `blog-${Date.now()}`,
          title: newMediaPost.title.trim(),
          excerpt: newMediaPost.excerpt.trim(),
          content: newMediaPost.excerpt.trim(),
          author: newMediaPost.author.trim(),
          date: toShortDate(newMediaPost.date),
          image: newMediaPost.image || undefined,
        },
        ...config.blogPosts,
      ],
    });

    setNewMediaPost({
      title: "",
      excerpt: "",
      author: "",
      date: new Date().toISOString().split("T")[0],
      image: "",
    });
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

          <div className="flex flex-wrap items-center gap-2">
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
                  className="h-10 gap-2 rounded-lg border border-transparent px-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 data-[state=active]:border-slate-200 data-[state=active]:bg-slate-100 data-[state=active]:text-indigo-700"
                >
                  {DASHBOARD_TAB_META.overview.icon}
                  {DASHBOARD_TAB_META.overview.label}
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="h-10 gap-2 rounded-lg border border-transparent px-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 data-[state=active]:border-slate-200 data-[state=active]:bg-slate-100 data-[state=active]:text-indigo-700"
                >
                  {DASHBOARD_TAB_META.media.icon}
                  {DASHBOARD_TAB_META.media.label}
                </TabsTrigger>
                <TabsTrigger
                  value="fundraising"
                  className="h-10 gap-2 rounded-lg border border-transparent px-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 data-[state=active]:border-slate-200 data-[state=active]:bg-slate-100 data-[state=active]:text-indigo-700"
                >
                  {DASHBOARD_TAB_META.fundraising.icon}
                  {DASHBOARD_TAB_META.fundraising.label}
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="h-10 gap-2 rounded-lg border border-transparent px-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 data-[state=active]:border-slate-200 data-[state=active]:bg-slate-100 data-[state=active]:text-indigo-700"
                >
                  {DASHBOARD_TAB_META.events.icon}
                  {DASHBOARD_TAB_META.events.label}
                </TabsTrigger>
                <TabsTrigger
                  value="applications"
                  className="h-10 gap-2 rounded-lg border border-transparent px-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 data-[state=active]:border-slate-200 data-[state=active]:bg-slate-100 data-[state=active]:text-indigo-700"
                >
                  {DASHBOARD_TAB_META.applications.icon}
                  {DASHBOARD_TAB_META.applications.label}
                </TabsTrigger>
                <TabsTrigger
                  value="operations"
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
              <StatCard title="Total raised" value={`$${config.raised.toLocaleString()}`} icon={<HandCoins className="size-5" />} />
              <StatCard title="Donors recorded" value={String(config.donations.length)} icon={<BadgeCheck className="size-5" />} />
              <StatCard title="Events scheduled" value={String(config.events.length)} icon={<Calendar className="size-5" />} />
              <StatCard title="Partner mentions" value={String(config.partnerMentions.length)} icon={<BookOpen className="size-5" />} />
            </section>

            <Card className="glass-surface">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Giving trend this week</CardTitle>
                <CardDescription>A quick view of how supporter activity is moving each day.</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ANALYTICS_DATA}>
                    <defs>
                      <linearGradient id="raisedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f766e" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d6e4e2" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <Tooltip />
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
            <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
              <Card className="glass-surface">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Manage media</CardTitle>
                  <CardDescription>Add stories, set cover images, and keep your public media page fresh.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="media-title">Story title</Label>
                    <Input
                      id="media-title"
                      value={newMediaPost.title}
                      onChange={(event) => setNewMediaPost((current) => ({ ...current, title: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="media-excerpt">Short summary</Label>
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
                  <Button onClick={handleCreateMediaPost} type="button">
                    <Plus className="size-4" />
                    Add media story
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-surface">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Smart draft helper</CardTitle>
                  <CardDescription>Need a quick start? Generate a story draft and edit it before sharing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" onClick={handleAiBlog} disabled={isGenerating === "blog"} type="button">
                    <Sparkles className={isGenerating === "blog" ? "size-4 animate-spin" : "size-4"} />
                    {isGenerating === "blog" ? "Generating draft..." : "Generate story draft"}
                  </Button>
                  <p className="text-sm text-slate-600">
                    Drafts appear in your media list right away so your team can refine and publish.
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
          </TabsContent>

          <TabsContent value="fundraising" className="space-y-6">
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
                      value={config.title}
                      onChange={(event) => onUpdate({ title: event.target.value })}
                    />
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

            <DataTable
              title="Donation ledger"
              description="Search, sort, and review supporter contributions in one place."
              data={config.donations}
              columns={donationColumns}
              defaultSortKey="date"
              defaultSortDirection="desc"
              searchPlaceholder="Search supporters..."
            />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <EventCalendar
              events={config.events}
              title="Event calendar"
              description="Highlighted dates are synced with builder and public preview event experiences."
            />

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

            <DataTable
              title="Event schedule"
              description="Search and sort all scheduled events."
              data={config.events}
              columns={eventColumns}
              defaultSortKey="date"
              defaultSortDirection="asc"
              searchPlaceholder="Search events..."
            />
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
              {APPLICATION_CATEGORY_ORDER.map((categoryId) => (
                <StatCard
                  key={categoryId}
                  title={APPLICATION_CATEGORY_META[categoryId].label}
                  value={String(config.applicationForms[categoryId].submissions.length)}
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

            <DataTable
              title="Form fields"
              description="Current field set for this application category."
              data={activeApplicationForm.fields}
              columns={applicationFieldColumns}
              defaultSortKey="label"
              searchPlaceholder="Search fields..."
            />

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

            <DataTable
              title="Submission inbox"
              description="Submissions sent from the public apply path."
              data={activeApplicationForm.submissions}
              columns={applicationSubmissionColumns}
              defaultSortKey="submittedAt"
              defaultSortDirection="desc"
              searchPlaceholder="Search submissions..."
            />
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
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="glass-surface">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="font-display text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">{icon}</span>
      </CardContent>
    </Card>
  );
}

function toShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
