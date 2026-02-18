import { ReactNode, useMemo, useState } from "react";
import {
  CircleHelp,
  Globe,
  LayoutTemplate,
  Layers,
  PieChart,
  Plus,
  Upload,
  UserCircle2,
} from "lucide-react";
import Dashboard from "@/components/Dashboard";
import Editor from "@/components/Editor";
import Preview from "@/components/Preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { readImageFile } from "@/lib/fileUploads";
import { INITIAL_CONFIG } from "@/lib/defaultConfig";
import { useHashRoute } from "@/hooks/useHashRoute";
import { ApplyPathId, Donation, FundraiserConfig, Partner } from "@/types";
import { IMAGE_FILE_ACCEPT } from "@/lib/constants";

const INITIAL_NEW_PARTNER: Partial<Partner> = {
  name: "",
  contactPerson: "",
  email: "",
  logo: "https://images.unsplash.com/photo-1599305090598-fe179d501c27?q=80&w=200&h=200&auto=format&fit=crop",
  status: "active",
};

export default function App() {
  const [config, setConfig] = useState<FundraiserConfig>(INITIAL_CONFIG);
  const [showPreviewPanel, setShowPreviewPanel] = useState(true);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [newPartner, setNewPartner] = useState<Partial<Partner>>({
    ...INITIAL_NEW_PARTNER,
    tierId: INITIAL_CONFIG.partnerTiers[0]?.id,
  });
  const { route, setApplyPath, setCrmTab, setPublicPage, setView } = useHashRoute();

  const updateConfig = (updates: Partial<FundraiserConfig>) => setConfig((current) => ({ ...current, ...updates }));

  const handleDonate = (amount: number, name: string, tierId?: string) => {
    const donation: Donation = {
      id: `tx-${Math.random().toString(36).slice(2, 8)}`,
      donorName: name,
      amount,
      date: new Date().toISOString(),
      tierId,
      channel: "direct",
      certificateGenerated: true,
    };

    setConfig((current) => ({
      ...current,
      raised: current.raised + amount,
      donations: [...current.donations, donation],
    }));
  };

  const handleOnboardPartner = () => {
    if (!newPartner.name || !newPartner.email || !newPartner.tierId) {
      return;
    }

    const partner: Partner = {
      id: `partner-${Date.now()}`,
      name: newPartner.name,
      contactPerson: newPartner.contactPerson ?? "",
      email: newPartner.email,
      logo:
        newPartner.logo ??
        "https://images.unsplash.com/photo-1599305090598-fe179d501c27?q=80&w=200&h=200&auto=format&fit=crop",
      tierId: newPartner.tierId,
      status: "active",
      totalContributed: 0,
      joinedDate: new Date().toISOString(),
    };

    setConfig((current) => ({
      ...current,
      partners: [...current.partners, partner],
    }));

    setIsPartnerModalOpen(false);
    setNewPartner({
      ...INITIAL_NEW_PARTNER,
      tierId: config.partnerTiers[0]?.id,
    });
  };

  const handleApplySubmission = (categoryId: ApplyPathId, values: Record<string, string>) => {
    const submission = {
      id: `apply-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: "new" as const,
      values,
    };

    setConfig((current) => ({
      ...current,
      applicationForms: {
        ...current.applicationForms,
        [categoryId]: {
          ...current.applicationForms[categoryId],
          submissions: [submission, ...current.applicationForms[categoryId].submissions],
        },
      },
    }));
  };

  const uploadNewPartnerLogo = async (file?: File) => {
    const image = await readImageFile(file);
    if (!image) {
      return;
    }

    setNewPartner((current) => ({ ...current, logo: image }));
  };

  const crmMetrics = useMemo(
    () => ({
      totalGiving: config.raised,
      activeContributors: config.donations.filter((donation) => donation.donorName !== "Anonymous").length,
      activePartners: config.partners.length,
    }),
    [config],
  );

  const crmTabGuide = route.crmTab === "donors"
    ? {
        title: "Supporter relationship center",
        instruction: "Track supporter history, certificates, and giving activity with simple filters and search.",
        websiteNote:
          "Donor and amount trends influence campaign confidence messaging shown in the website builder preview.",
      }
    : {
        title: "Partner relationship center",
        instruction: "Track partner tier position, contribution value, and mention readiness with simple search and sorting.",
        websiteNote:
          "Partner tier and mention data controls how partner credibility sections render in builder and public preview.",
      };

  const donorColumns = useMemo<DataTableColumn<FundraiserConfig["donations"][number]>[]>(
    () => [
      { key: "donorName", header: "Supporter", accessor: (row) => row.donorName, sortable: true },
      { key: "amount", header: "Amount", accessor: (row) => row.amount, sortable: true, cell: (row) => `$${row.amount.toLocaleString()}` },
      {
        key: "date",
        header: "Date",
        accessor: (row) => row.date,
        sortable: true,
        cell: (row) => new Date(row.date).toLocaleDateString(),
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

  const partnerColumns = useMemo<
    DataTableColumn<
      Partner & {
        tierName: string;
        mentions: number;
      }
    >[]
  >(
    () => [
      { key: "name", header: "Partner", accessor: (row) => row.name, sortable: true },
      { key: "email", header: "Email", accessor: (row) => row.email, sortable: true },
      { key: "tierName", header: "Tier", accessor: (row) => row.tierName, sortable: true },
      {
        key: "totalContributed",
        header: "Total contributed",
        accessor: (row) => row.totalContributed,
        sortable: true,
        cell: (row) => `$${row.totalContributed.toLocaleString()}`,
      },
      { key: "mentions", header: "Mentions", accessor: (row) => row.mentions, sortable: true },
    ],
    [],
  );

  if (route.view === "public") {
    return (
      <div className="relative h-screen w-full overflow-hidden">
        <Preview
          config={config}
          activePage={route.publicPage}
          applyPath={route.applyPath}
          onNavigate={setPublicPage}
          onApplyPathChange={setApplyPath}
          onDonate={handleDonate}
          onSubmitApplication={handleApplySubmission}
        />
        <Button
          type="button"
          className="fixed bottom-8 right-8 rounded-full px-6 py-6 shadow-float"
          onClick={() => setView("dashboard")}
        >
          <Layers className="size-5" />
          Back to Admin
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-ambient-grid [background-size:1.5rem_1.5rem]">
      <aside className="flex w-24 shrink-0 flex-col items-center gap-6 border-r border-white/70 bg-white/80 py-6 backdrop-blur-xl">
        <div className="inline-flex size-14 items-center justify-center rounded-3xl bg-emerald-700 text-white shadow-soft">
          <Layers className="size-7" />
        </div>

        <nav className="flex flex-1 flex-col items-center gap-2">
          <SideNavButton icon={<PieChart className="size-5" />} label="Dashboard" isActive={route.view === "dashboard"} onClick={() => setView("dashboard")} />
          <SideNavButton icon={<LayoutTemplate className="size-5" />} label="Builder" isActive={route.view === "editor"} onClick={() => setView("editor")} />
          <SideNavButton icon={<UserCircle2 className="size-5" />} label="CRM" isActive={route.view === "crm"} onClick={() => setView("crm")} />
        </nav>

        <div className="space-y-2">
          <SideNavButton icon={<Globe className="size-5" />} label="Public site" isActive={false} onClick={() => setView("public")} />
          <div className="mx-auto size-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <img src="https://picsum.photos/100/100?seed=saasadmin" alt="Admin profile" className="h-full w-full object-cover" />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        {route.view === "dashboard" ? (
          <Dashboard config={config} onUpdate={updateConfig} />
        ) : null}

        {route.view === "editor" ? (
          <div className="flex h-full">
            <Editor config={config} onChange={setConfig} />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center justify-between border-b border-white/70 bg-white/75 px-6 py-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <Badge className="rounded-full bg-emerald-50 text-emerald-700">Live Preview</Badge>
                  <p className="text-sm text-slate-600">Location-based navigation remains active in preview mode.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="preview-switch" className="text-sm text-slate-700">
                    Preview panel
                  </Label>
                  <Switch
                    id="preview-switch"
                    checked={showPreviewPanel}
                    onCheckedChange={setShowPreviewPanel}
                    aria-label="Toggle preview panel"
                  />
                </div>
              </div>
              <div className="min-h-0 flex-1 p-4">
                {showPreviewPanel ? (
                  <div className="h-full overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 shadow-soft">
                    <Preview
                      config={config}
                      activePage={route.publicPage}
                      applyPath={route.applyPath}
                      onNavigate={setPublicPage}
                      onApplyPathChange={setApplyPath}
                      onDonate={handleDonate}
                      onSubmitApplication={handleApplySubmission}
                    />
                  </div>
                ) : (
                  <Card className="h-full border-white/80 bg-white/85">
                    <CardContent className="flex h-full items-center justify-center">
                      <p className="text-center text-sm text-slate-500">
                        Preview is hidden. Toggle it back on to validate per-page customizations in real time.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {route.view === "crm" ? (
          <div className="flex h-full flex-col">
            <header className="border-b border-white/70 bg-white/80 px-8 py-6 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                    <CircleHelp className="size-4" />
                    Relationship Management
                  </p>
                  <h2 className="font-display text-4xl text-slate-900">{crmTabGuide.title}</h2>
                  <p className="mt-1 max-w-3xl text-sm text-slate-600">{crmTabGuide.instruction}</p>
                  <p className="mt-1 text-sm text-emerald-700">Website note: {crmTabGuide.websiteNote}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant={route.crmTab === "donors" ? "secondary" : "outline"} className="rounded-full" onClick={() => setCrmTab("donors")}>
                    Supporters
                  </Button>
                  <Button variant={route.crmTab === "partners" ? "secondary" : "outline"} className="rounded-full" onClick={() => setCrmTab("partners")}>
                    Partners
                  </Button>
                </div>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
              <section className="mb-6 grid gap-4 md:grid-cols-3">
                <MetricCard title="Aggregate giving" value={`$${crmMetrics.totalGiving.toLocaleString()}`} />
                <MetricCard title="Active contributors" value={crmMetrics.activeContributors.toString()} />
                <MetricCard title="Partners onboarded" value={crmMetrics.activePartners.toString()} />
              </section>

              {route.crmTab === "donors" ? (
                <DonorTable config={config} columns={donorColumns} />
              ) : (
                <PartnerTable config={config} columns={partnerColumns} onAdd={() => setIsPartnerModalOpen(true)} />
              )}
            </div>
          </div>
        ) : null}
      </main>

      <Dialog open={isPartnerModalOpen} onOpenChange={setIsPartnerModalOpen}>
        <DialogContent className="rounded-3xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl">Onboard Partner</DialogTitle>
            <DialogDescription>Attach partner details, logo, and tier so mentions can be surfaced in preview pages.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-[6rem_1fr] items-center gap-3">
              <div className="size-20 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-2">
                <img src={newPartner.logo} alt="Partner logo preview" className="h-full w-full object-contain" />
              </div>
              <Button variant="outline" className="justify-start rounded-full" asChild>
                <label className="cursor-pointer">
                  <Upload className="size-4" />
                  Upload logo
                  <input
                    type="file"
                    accept={IMAGE_FILE_ACCEPT}
                    className="hidden"
                    onChange={(event) => uploadNewPartnerLogo(event.target.files?.[0])}
                  />
                </label>
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnerName">Partner name</Label>
              <Input
                id="partnerName"
                value={newPartner.name}
                onChange={(event) => setNewPartner((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partnerEmail">Partner email</Label>
              <Input
                id="partnerEmail"
                value={newPartner.email}
                onChange={(event) => setNewPartner((current) => ({ ...current, email: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partnerContact">Contact person</Label>
              <Input
                id="partnerContact"
                value={newPartner.contactPerson}
                onChange={(event) => setNewPartner((current) => ({ ...current, contactPerson: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Tier assignment</Label>
              <Select
                value={newPartner.tierId}
                onValueChange={(value) => setNewPartner((current) => ({ ...current, tierId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose tier" />
                </SelectTrigger>
                <SelectContent>
                  {config.partnerTiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setIsPartnerModalOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-full" onClick={handleOnboardPartner} disabled={!newPartner.name || !newPartner.email || !newPartner.tierId}>
              <Plus className="size-4" />
              Add partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface SideNavButtonProps {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function SideNavButton({ icon, label, isActive, onClick }: SideNavButtonProps) {
  return (
    <Button
      type="button"
      variant={isActive ? "secondary" : "ghost"}
      size="icon"
      className="group relative size-12 rounded-2xl"
      onClick={onClick}
    >
      {icon}
      <span className="pointer-events-none absolute left-full ml-2 hidden rounded-lg bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
        {label}
      </span>
    </Button>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
}

function MetricCard({ title, value }: MetricCardProps) {
  return (
    <Card className="glass-surface">
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-display text-4xl font-semibold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}

interface TableProps {
  config: FundraiserConfig;
  columns: DataTableColumn<FundraiserConfig["donations"][number]>[];
}

function DonorTable({ config, columns }: TableProps) {
  return (
    <DataTable
      title="Supporter ledger"
      description="Search and sort supporters while tracking certificate readiness."
      data={config.donations.filter((donation) => donation.donorName !== "Anonymous")}
      columns={columns}
      defaultSortKey="date"
      defaultSortDirection="desc"
      searchPlaceholder="Search supporters..."
    />
  );
}

interface PartnerTableProps {
  config: FundraiserConfig;
  columns: DataTableColumn<
    Partner & {
      tierName: string;
      mentions: number;
    }
  >[];
  onAdd: () => void;
}

function PartnerTable({ config, columns, onAdd }: PartnerTableProps) {
  const partnerRows = config.partners.map((partner) => {
    const tier = config.partnerTiers.find((entry) => entry.id === partner.tierId);
    const mentions = config.partnerMentions.filter((mention) => mention.partnerId === partner.id).length;
    return {
      ...partner,
      tierName: tier?.name ?? "No tier",
      mentions,
    };
  });

  return (
    <Card className="glass-surface space-y-4">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="font-display text-2xl">Partner accounts</CardTitle>
            <CardDescription>Tier assignment and public mention readiness.</CardDescription>
          </div>
          <Button className="rounded-full" onClick={onAdd}>
            <Plus className="size-4" />
            Onboard partner
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          {config.partnerTiers.map((tier) => (
            <Card key={tier.id} className="border-slate-200/80">
              <CardContent className="space-y-2 p-4">
                <p className="font-medium text-slate-900">{tier.name}</p>
                <p className="text-sm text-slate-600">${tier.minCommitment.toLocaleString()} minimum</p>
                <Separator />
                {tier.benefits.map((benefit) => (
                  <p key={benefit} className="text-xs text-slate-500">
                    - {benefit}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <DataTable
          title="Partner accounts"
          description="Tier and mention readiness mapped to public website partner pages."
          data={partnerRows}
          columns={columns}
          defaultSortKey="name"
          searchPlaceholder="Search partners..."
        />
      </CardContent>
    </Card>
  );
}
