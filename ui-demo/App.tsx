import { ReactNode, useMemo, useState } from "react";
import {
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { readImageFile } from "@/lib/fileUploads";
import { INITIAL_CONFIG } from "@/lib/defaultConfig";
import { useHashRoute } from "@/hooks/useHashRoute";
import { Donation, FundraiserConfig, Partner } from "@/types";
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
  const { route, setCrmTab, setPublicPage, setView } = useHashRoute();

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

  if (route.view === "public") {
    return (
      <div className="relative h-screen w-full overflow-hidden">
        <Preview config={config} activePage={route.publicPage} onNavigate={setPublicPage} onDonate={handleDonate} />
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
                    <Preview config={config} activePage={route.publicPage} onNavigate={setPublicPage} onDonate={handleDonate} />
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
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Relationship Management</p>
                  <h2 className="font-display text-4xl text-slate-900">Impact Relations</h2>
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

              {route.crmTab === "donors" ? <DonorTable config={config} /> : <PartnerTable config={config} onAdd={() => setIsPartnerModalOpen(true)} />}
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
}

function DonorTable({ config }: TableProps) {
  return (
    <Card className="glass-surface">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Supporter ledger</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supporter</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Certificate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {config.donations
              .filter((donation) => donation.donorName !== "Anonymous")
              .map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell className="font-medium">{donation.donorName}</TableCell>
                  <TableCell>${donation.amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(donation.date).toLocaleDateString()}</TableCell>
                  <TableCell>{donation.certificateGenerated ? "Issued" : "Pending"}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

interface PartnerTableProps {
  config: FundraiserConfig;
  onAdd: () => void;
}

function PartnerTable({ config, onAdd }: PartnerTableProps) {
  return (
    <Card className="glass-surface">
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

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Partner</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Total Contributed</TableHead>
              <TableHead>Mentions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {config.partners.map((partner) => {
              const tier = config.partnerTiers.find((entry) => entry.id === partner.tierId);
              const mentions = config.partnerMentions.filter((mention) => mention.partnerId === partner.id).length;
              return (
                <TableRow key={partner.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="size-9 overflow-hidden rounded-lg border border-slate-200 bg-white p-1">
                        <img src={partner.logo} alt={partner.name} className="h-full w-full object-contain" />
                      </div>
                      <span className="font-medium">{partner.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{partner.email}</TableCell>
                  <TableCell>
                    <Badge className="rounded-full bg-slate-100 text-slate-700">{tier?.name ?? "No tier"}</Badge>
                  </TableCell>
                  <TableCell>${partner.totalContributed.toLocaleString()}</TableCell>
                  <TableCell>{mentions}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
