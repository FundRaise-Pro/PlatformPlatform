import { Dispatch, SetStateAction } from "react";
import { CircleHelp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AllocationDraft, CampaignAllocation } from "@/features/crm/allocationPolicy";
import { CrmTabId, FundraiserConfig, Partner } from "@/types";

interface CrmWorkspaceProps {
  crmTab: CrmTabId;
  onTabChange: (tab: CrmTabId) => void;
  crmTabGuide: {
    title: string;
    instruction: string;
    websiteNote: string;
  };
  crmMetrics: {
    totalGiving: number;
    activeContributors: number;
    activePartners: number;
  };
  scopedConfig: FundraiserConfig;
  config: FundraiserConfig;
  donorColumns: DataTableColumn<FundraiserConfig["donations"][number]>[];
  partnerColumns: DataTableColumn<
    Partner & {
      tierName: string;
      mentions: number;
    }
  >[];
  onOpenPartnerModal: () => void;
  activeCampaign?: FundraiserConfig["campaigns"][number];
  activeCampaignFundraisers: FundraiserConfig["campaigns"][number]["fundraisers"];
  allocationDraft: AllocationDraft;
  setAllocationDraft: Dispatch<SetStateAction<AllocationDraft>>;
  onCreatePartnerPoolAllocation: () => void;
  activeCampaignAllocations: CampaignAllocation[];
  partnerAllocationColumns: DataTableColumn<CampaignAllocation>[];
}

export function CrmWorkspace({
  crmTab,
  onTabChange,
  crmTabGuide,
  crmMetrics,
  scopedConfig,
  config,
  donorColumns,
  partnerColumns,
  onOpenPartnerModal,
  activeCampaign,
  activeCampaignFundraisers,
  allocationDraft,
  setAllocationDraft,
  onCreatePartnerPoolAllocation,
  activeCampaignAllocations,
  partnerAllocationColumns,
}: CrmWorkspaceProps) {
  return (
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
            <Button variant={crmTab === "donors" ? "secondary" : "outline"} className="rounded-full" onClick={() => onTabChange("donors")}>
              Supporters
            </Button>
            <Button variant={crmTab === "partners" ? "secondary" : "outline"} className="rounded-full" onClick={() => onTabChange("partners")}>
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

        {crmTab === "donors" ? (
          <DonorTable config={scopedConfig} columns={donorColumns} />
        ) : (
          <div className="space-y-6">
            <PartnerTable config={config} columns={partnerColumns} onAdd={onOpenPartnerModal} />

            {activeCampaign ? (
              <>
                <Card className="glass-surface">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl">Restricted partner pool allocation</CardTitle>
                    <CardDescription>
                      Managed in Partner CRM only. Risk uses max(single amount, rolling 30-day cumulative).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2 lg:grid-cols-4">
                      <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">Low: up to R10,000 | Campaign Admin</p>
                      <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        Medium: R10,001-R50,000 | Campaign Admin + Finance
                      </p>
                      <p className="rounded-xl bg-orange-50 px-3 py-2 text-xs text-orange-800">
                        High: R50,001-R150,000 | Admin + Finance + Board + 24h cool-off
                      </p>
                      <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-800">
                        Critical: &gt; R150,000 | Full Board + Chair sign-off
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <Card className="border-slate-200/80">
                        <CardContent className="p-4">
                          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Partner pool balance</p>
                          <p className="font-display text-3xl text-slate-900">
                            R{(activeCampaign.partnerPool.balance ?? 0).toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-slate-200/80">
                        <CardContent className="p-4">
                          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Total partner donations</p>
                          <p className="font-display text-3xl text-slate-900">
                            R{(activeCampaign.partnerPool.totalPartnerDonations ?? 0).toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-slate-200/80">
                        <CardContent className="p-4">
                          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Allocated (executed)</p>
                          <p className="font-display text-3xl text-slate-900">
                            R{(activeCampaign.partnerPool.totalAllocated ?? 0).toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Allocation target</Label>
                        <Select
                          value={allocationDraft.targetType}
                          onValueChange={(value) =>
                            setAllocationDraft((current) => ({
                              ...current,
                              targetType: value as AllocationDraft["targetType"],
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fundraiser">Fundraiser</SelectItem>
                            <SelectItem value="campaign-ops">Campaign operations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {allocationDraft.targetType === "fundraiser" ? (
                        <div className="space-y-2">
                          <Label>Fundraiser target</Label>
                          <Select
                            value={allocationDraft.targetFundraiserId}
                            onValueChange={(value) =>
                              setAllocationDraft((current) => ({
                                ...current,
                                targetFundraiserId: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {activeCampaignFundraisers.map((fundraiser) => (
                                <SelectItem key={fundraiser.id} value={fundraiser.id}>
                                  {fundraiser.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="crm-allocation-target-label">Ops target label</Label>
                          <Input
                            id="crm-allocation-target-label"
                            value={allocationDraft.targetLabel}
                            onChange={(event) =>
                              setAllocationDraft((current) => ({ ...current, targetLabel: event.target.value }))
                            }
                            placeholder="Example: Water logistics and transport"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="crm-allocation-amount">Fixed amount (required)</Label>
                        <Input
                          id="crm-allocation-amount"
                          type="number"
                          value={allocationDraft.amount}
                          onChange={(event) =>
                            setAllocationDraft((current) => ({ ...current, amount: event.target.value }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="crm-allocation-split">% split (optional)</Label>
                        <Input
                          id="crm-allocation-split"
                          type="number"
                          value={allocationDraft.percentageSplit}
                          onChange={(event) =>
                            setAllocationDraft((current) => ({ ...current, percentageSplit: event.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="crm-allocation-reason">Allocation reason</Label>
                      <Textarea
                        id="crm-allocation-reason"
                        rows={3}
                        value={allocationDraft.reason}
                        onChange={(event) => setAllocationDraft((current) => ({ ...current, reason: event.target.value }))}
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                        <p className="text-sm text-slate-700">Operational critical (required for high-risk ops)</p>
                        <Switch
                          checked={allocationDraft.operationalCritical}
                          onCheckedChange={(checked) =>
                            setAllocationDraft((current) => ({ ...current, operationalCritical: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                        <p className="text-sm text-slate-700">Donor-intent compliance confirmed</p>
                        <Switch
                          checked={allocationDraft.donorIntentConfirmed}
                          onCheckedChange={(checked) =>
                            setAllocationDraft((current) => ({ ...current, donorIntentConfirmed: checked }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="crm-board-resolution">Board resolution reference (critical risk only)</Label>
                      <Input
                        id="crm-board-resolution"
                        value={allocationDraft.boardResolutionReference}
                        onChange={(event) =>
                          setAllocationDraft((current) => ({ ...current, boardResolutionReference: event.target.value }))
                        }
                      />
                    </div>

                    <Button type="button" onClick={onCreatePartnerPoolAllocation}>
                      Create allocation request
                    </Button>
                  </CardContent>
                </Card>

                <DataTable
                  title="Allocation approvals"
                  description="Single transaction and rolling 30-day cumulative risk bands with role-based approvals."
                  data={activeCampaignAllocations}
                  columns={partnerAllocationColumns}
                  defaultSortKey="createdAt"
                  defaultSortDirection="desc"
                  searchPlaceholder="Search allocations..."
                />
              </>
            ) : (
              <Card className="glass-surface">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Restricted partner pool allocation</CardTitle>
                  <CardDescription>Select a campaign to manage partner allocation policy and approvals.</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
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

interface DonorTableProps {
  config: FundraiserConfig;
  columns: DataTableColumn<FundraiserConfig["donations"][number]>[];
}

function DonorTable({ config, columns }: DonorTableProps) {
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
