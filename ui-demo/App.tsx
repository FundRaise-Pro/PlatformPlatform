import { useEffect, useMemo, useState } from "react";
import { Globe, LayoutTemplate, Layers, PieChart, UserCircle2 } from "lucide-react";
import Dashboard from "@/components/Dashboard";
import Editor from "@/components/Editor";
import Preview from "@/components/Preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DataTableColumn } from "@/components/ui/data-table";
import { CrmWorkspace } from "@/features/crm/CrmWorkspace";
import {
  AllocationDraft,
  CampaignAllocation,
  canTransitionAllocationStatus,
  hasAllocationApprovalsCompleted,
  isAllocationCoolingOffComplete,
  requiredAllocationApprovalsForBand,
  resolveAllocationRiskBand,
} from "@/features/crm/allocationPolicy";
import { PartnerOnboardingDialog } from "@/features/crm/PartnerOnboardingDialog";
import { SideNavButton } from "@/features/shell/SideNavButton";
import { getSectionLayout } from "@/lib/builderLayout";
import { readImageFile } from "@/lib/fileUploads";
import { INITIAL_CONFIG } from "@/lib/defaultConfig";
import { useHashRoute } from "@/hooks/useHashRoute";
import { ApplyPathId, Donation, FundraiserConfig, Partner, PublicPageId } from "@/types";

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
  const [allocationDraft, setAllocationDraft] = useState<AllocationDraft>({
    targetType: "fundraiser",
    targetFundraiserId: "",
    targetLabel: "",
    amount: "",
    percentageSplit: "",
    reason: "",
    operationalCritical: false,
    donorIntentConfirmed: false,
    boardResolutionReference: "",
  });
  const [focusedBuilderSectionId, setFocusedBuilderSectionId] = useState<string | null>(null);
  const { route, setApplyPath, setCampaignSlug, setCrmTab, setEventId, setFundraiserSlug, setPublicPage, setView } = useHashRoute();

  const activeCampaign = useMemo(
    () =>
      config.campaigns.find((campaign) => campaign.slug === route.campaignSlug) ??
      config.campaigns.find((campaign) => campaign.id === config.activeCampaignId) ??
      config.campaigns[0],
    [config.activeCampaignId, config.campaigns, route.campaignSlug],
  );

  const activeFundraiser = useMemo(
    () =>
      activeCampaign?.fundraisers.find((fundraiser) => fundraiser.slug === route.fundraiserSlug) ??
      activeCampaign?.fundraisers.find((fundraiser) => fundraiser.id === config.activeFundraiserId) ??
      activeCampaign?.fundraisers[0],
    [activeCampaign, config.activeFundraiserId, route.fundraiserSlug],
  );
  const activeCampaignFundraisers = activeCampaign?.fundraisers ?? [];
  const activeCampaignAllocations = activeCampaign?.partnerPool.allocations ?? [];
  const activeCampaignAllocationPolicy = activeCampaign?.partnerPool.policy;

  useEffect(() => {
    if (!activeCampaignFundraisers.length) {
      setAllocationDraft((current) => ({ ...current, targetFundraiserId: "" }));
      return;
    }

    const hasCurrentTarget = activeCampaignFundraisers.some((fundraiser) => fundraiser.id === allocationDraft.targetFundraiserId);
    if (hasCurrentTarget) {
      return;
    }

    setAllocationDraft((current) => ({ ...current, targetFundraiserId: activeCampaignFundraisers[0].id }));
  }, [activeCampaignFundraisers, allocationDraft.targetFundraiserId]);

  useEffect(() => {
    setFocusedBuilderSectionId(null);
  }, [route.publicPage, route.view]);

  const scopedConfig = useMemo<FundraiserConfig>(() => {
    const campaign = activeCampaign;
    const fundraiser = activeFundraiser;
    const campaignDonations = campaign?.donations ?? [];
    const campaignPartnerPoolDonations = campaign?.partnerPoolDonations ?? [];
    const campaignEvents = campaign?.events ?? [];
    const campaignMedia = campaign?.mediaPosts ?? [];
    const fundraiserSummaries = (campaign?.fundraisers ?? []).map((entry) => ({
      id: entry.id,
      name: entry.title,
      bio: entry.summary,
      goal: entry.goal,
      raised: entry.raised,
      image: entry.heroImage,
    }));

    return {
      ...config,
      activeCampaignId: campaign?.id ?? config.activeCampaignId,
      activeFundraiserId: fundraiser?.id ?? config.activeFundraiserId,
      title: fundraiser?.title ?? campaign?.name ?? config.title,
      subtitle: fundraiser?.summary ?? campaign?.description ?? config.subtitle,
      story: fundraiser?.story ?? config.story,
      goal: fundraiser?.goal ?? config.goal,
      raised: fundraiser?.raised ?? config.raised,
      heroImage: fundraiser?.heroImage ?? config.heroImage,
      beneficiaryStories: fundraiserSummaries,
      events: campaignEvents,
      blogPosts: campaignMedia,
      donations: [...campaignDonations, ...campaignPartnerPoolDonations],
    };
  }, [activeCampaign, activeFundraiser, config]);

  const updateConfig = (updates: Partial<FundraiserConfig>) =>
    setConfig((current) => {
      const selectedCampaign =
        current.campaigns.find((campaign) => campaign.slug === route.campaignSlug) ??
        current.campaigns.find((campaign) => campaign.id === current.activeCampaignId) ??
        current.campaigns[0];
      const selectedFundraiser =
        selectedCampaign?.fundraisers.find((fundraiser) => fundraiser.slug === route.fundraiserSlug) ??
        selectedCampaign?.fundraisers.find((fundraiser) => fundraiser.id === current.activeFundraiserId) ??
        selectedCampaign?.fundraisers[0];

      const nextCampaigns = updates.campaigns
        ? updates.campaigns
        : current.campaigns.map((campaign) => {
            if (!selectedCampaign || campaign.id !== selectedCampaign.id) {
              return campaign;
            }

            const mappedDonations = updates.donations
              ? updates.donations.map((donation) => ({
                  ...donation,
                  campaignId: campaign.id,
                  fundraiserId:
                    donation.channel === "partner" ? donation.fundraiserId : donation.fundraiserId ?? selectedFundraiser?.id,
                }))
              : undefined;

            return {
              ...campaign,
              name: updates.title ?? campaign.name,
              description: updates.subtitle ?? campaign.description,
              donations: mappedDonations ? mappedDonations.filter((donation) => donation.channel !== "partner") : campaign.donations,
              partnerPoolDonations: mappedDonations
                ? mappedDonations.filter((donation) => donation.channel === "partner")
                : campaign.partnerPoolDonations,
              events: updates.events
                ? updates.events.map((event) => ({
                    ...event,
                    campaignId: campaign.id,
                    fundraiserId: event.fundraiserId ?? selectedFundraiser?.id,
                  }))
                : campaign.events,
              mediaPosts: updates.blogPosts
                ? updates.blogPosts.map((post) => ({
                    ...post,
                    campaignId: campaign.id,
                    fundraiserId: post.fundraiserId ?? selectedFundraiser?.id,
                  }))
                : campaign.mediaPosts,
              fundraisers: campaign.fundraisers.map((fundraiser) => {
                if (!selectedFundraiser || fundraiser.id !== selectedFundraiser.id) {
                  return fundraiser;
                }

                return {
                  ...fundraiser,
                  title: updates.title ?? fundraiser.title,
                  summary: updates.subtitle ?? fundraiser.summary,
                  story: updates.story ?? fundraiser.story,
                  goal: updates.goal ?? fundraiser.goal,
                  raised: updates.raised ?? fundraiser.raised,
                  heroImage: updates.heroImage ?? fundraiser.heroImage,
                };
              }),
            };
          });

      return {
        ...current,
        ...updates,
        campaigns: nextCampaigns,
        activeCampaignId: updates.activeCampaignId ?? selectedCampaign?.id ?? current.activeCampaignId,
        activeFundraiserId: updates.activeFundraiserId ?? selectedFundraiser?.id ?? current.activeFundraiserId,
      };
    });

  const handleEditorChange = (nextConfig: FundraiserConfig) => {
    updateConfig({
      tenantName: nextConfig.tenantName,
      title: nextConfig.title,
      subtitle: nextConfig.subtitle,
      story: nextConfig.story,
      goal: nextConfig.goal,
      raised: nextConfig.raised,
      primaryColor: nextConfig.primaryColor,
      heroImage: nextConfig.heroImage,
      terminology: nextConfig.terminology,
      partnerTiers: nextConfig.partnerTiers,
      partnerMentions: nextConfig.partnerMentions,
      pageCustomizations: nextConfig.pageCustomizations,
    });
  };

  const updateBuilderPageSection = (
    pageId: PublicPageId,
    sectionId: string,
    updates: Partial<FundraiserConfig["pageCustomizations"][PublicPageId]["sections"][number]>,
  ) => {
    setConfig((current) => ({
      ...current,
      pageCustomizations: {
        ...current.pageCustomizations,
        [pageId]: {
          ...current.pageCustomizations[pageId],
          sections: current.pageCustomizations[pageId].sections.map((section, index) => {
            if (section.id !== sectionId) {
              return section;
            }

            const currentLayout = getSectionLayout(section, index);
            return {
              ...section,
              ...updates,
              layout: updates.layout
                ? {
                    ...currentLayout,
                    ...updates.layout,
                  }
                : section.layout,
            };
          }),
        },
      },
    }));
  };

  const reorderBuilderPageSections = (pageId: PublicPageId, orderedSectionIds: string[]) => {
    const orderLookup = orderedSectionIds.reduce<Record<string, number>>((accumulator, id, index) => {
      accumulator[id] = index;
      return accumulator;
    }, {});

    setConfig((current) => ({
      ...current,
      pageCustomizations: {
        ...current.pageCustomizations,
        [pageId]: {
          ...current.pageCustomizations[pageId],
          sections: current.pageCustomizations[pageId].sections.map((section, index) => ({
            ...section,
            layout: {
              ...getSectionLayout(section, index),
              order: orderLookup[section.id] ?? index,
            },
          })),
        },
      },
    }));
  };

  const handleDonate = (amount: number, name: string, tierId?: string) => {
    if (!activeCampaign?.allowsDirectDonations) {
      return;
    }

    const donation: Donation = {
      id: `tx-${Math.random().toString(36).slice(2, 8)}`,
      donorName: name,
      amount,
      date: new Date().toISOString(),
      campaignId: activeCampaign?.id,
      fundraiserId: activeFundraiser?.id,
      tierId,
      channel: "direct",
      certificateGenerated: true,
    };

    setConfig((current) => ({
      ...current,
      raised: current.raised + amount,
      donations: [...current.donations, donation],
      campaigns: current.campaigns.map((campaign) => {
        if (!activeCampaign || campaign.id !== activeCampaign.id) {
          return campaign;
        }

        return {
          ...campaign,
          donations: [donation, ...campaign.donations],
          fundraisers: campaign.fundraisers.map((fundraiser) =>
            fundraiser.id === activeFundraiser?.id ? { ...fundraiser, raised: fundraiser.raised + amount } : fundraiser,
          ),
        };
      }),
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
      campaignId: activeCampaign?.id ?? config.activeCampaignId,
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

  const updateActiveCampaign = (
    updater: (campaign: FundraiserConfig["campaigns"][number]) => FundraiserConfig["campaigns"][number],
  ) => {
    setConfig((current) => {
      const selectedCampaign =
        current.campaigns.find((campaign) => campaign.slug === route.campaignSlug) ??
        current.campaigns.find((campaign) => campaign.id === current.activeCampaignId) ??
        current.campaigns[0];

      if (!selectedCampaign) {
        return current;
      }

      return {
        ...current,
        campaigns: current.campaigns.map((campaign) =>
          campaign.id === selectedCampaign.id ? updater(campaign) : campaign,
        ),
      };
    });
  };

  const createPartnerPoolAllocation = () => {
    if (!activeCampaign || !activeCampaignAllocationPolicy) {
      return;
    }

    const amount = Number(allocationDraft.amount || 0);
    const percentageSplit = Number(allocationDraft.percentageSplit || 0);
    if (amount <= 0 || !allocationDraft.reason.trim()) {
      return;
    }

    const now = new Date();
    const rollingWindowStart = new Date(now);
    rollingWindowStart.setDate(rollingWindowStart.getDate() - activeCampaignAllocationPolicy.rollingWindowDays);

    const rollingTotalBeforeThis = activeCampaignAllocations
      .filter((allocation) => allocation.status !== "rejected")
      .filter((allocation) => new Date(allocation.createdAt) >= rollingWindowStart)
      .reduce((total, allocation) => total + allocation.amount, 0);

    const rolling30DayTotalAfterThis = rollingTotalBeforeThis + amount;
    const effectiveRiskAmount = Math.max(amount, rolling30DayTotalAfterThis);
    const riskBand = resolveAllocationRiskBand(
      activeCampaignAllocationPolicy.lowMax,
      activeCampaignAllocationPolicy.mediumMax,
      activeCampaignAllocationPolicy.highMax,
      effectiveRiskAmount,
    );

    if (riskBand === "high" && !allocationDraft.donorIntentConfirmed) {
      return;
    }

    if (allocationDraft.targetType === "campaign-ops" && riskBand === "high" && !allocationDraft.operationalCritical) {
      return;
    }

    if (riskBand === "critical" && !allocationDraft.boardResolutionReference.trim()) {
      return;
    }

    const selectedFundraiserTarget = activeCampaignFundraisers.find(
      (fundraiser) => fundraiser.id === allocationDraft.targetFundraiserId,
    );
    const targetLabel =
      allocationDraft.targetType === "fundraiser"
        ? selectedFundraiserTarget?.title ?? "Fundraiser"
        : allocationDraft.targetLabel.trim() || "Campaign Operations";

    const cooldownUntil = undefined;
    const approvals = requiredAllocationApprovalsForBand(riskBand).map((approval, index) =>
      riskBand === "low" && index === 0 ? { ...approval, approved: true, approvedAt: now.toISOString() } : approval,
    );
    const approvalsCompleted = approvals.every((approval) => approval.approved);
    const coolingOffComplete = !cooldownUntil || now >= new Date(cooldownUntil);
    const status = approvalsCompleted
      ? coolingOffComplete
        ? ("approved" as const)
        : ("cooling-off" as const)
      : ("pending-approval" as const);

    const allocation: CampaignAllocation = {
      id: `alloc-${Date.now()}`,
      campaignId: activeCampaign.id,
      createdAt: now.toISOString(),
      targetType: allocationDraft.targetType,
      targetFundraiserId: allocationDraft.targetType === "fundraiser" ? allocationDraft.targetFundraiserId : undefined,
      targetLabel,
      amount,
      percentageSplit: percentageSplit > 0 ? percentageSplit : undefined,
      reason: allocationDraft.reason.trim(),
      operationalCritical: allocationDraft.operationalCritical,
      donorIntentConfirmed: allocationDraft.donorIntentConfirmed,
      singleAmount: amount,
      rolling30DayTotalAfterThis,
      effectiveRiskAmount,
      riskBand,
      requiresBoardResolution: riskBand === "critical",
      boardResolutionReference: allocationDraft.boardResolutionReference.trim() || undefined,
      status,
      cooldownUntil,
      approvals,
    };

    updateActiveCampaign((campaign) => ({
      ...campaign,
      partnerPool: {
        ...campaign.partnerPool,
        totalPartnerDonations: campaign.partnerPoolDonations.reduce((total, donation) => total + donation.amount, 0),
        totalAllocated: campaign.partnerPool.allocations
          .filter((entry) => entry.status === "executed")
          .reduce((total, entry) => total + entry.amount, 0),
        balance:
          campaign.partnerPoolDonations.reduce((total, donation) => total + donation.amount, 0) -
          campaign.partnerPool.allocations
            .filter((entry) => entry.status === "executed")
            .reduce((total, entry) => total + entry.amount, 0),
        allocations: [allocation, ...campaign.partnerPool.allocations],
      },
    }));

    setAllocationDraft({
      targetType: "fundraiser",
      targetFundraiserId: activeCampaign.fundraisers[0]?.id ?? "",
      targetLabel: "",
      amount: "",
      percentageSplit: "",
      reason: "",
      operationalCritical: false,
      donorIntentConfirmed: false,
      boardResolutionReference: "",
    });
  };

  const updatePartnerAllocation = (
    allocationId: string,
    updater: (allocation: CampaignAllocation) => CampaignAllocation,
  ) => {
    updateActiveCampaign((campaign) => {
      const nextAllocations = campaign.partnerPool.allocations.map((allocation) =>
        allocation.id === allocationId ? updater(allocation) : allocation,
      );
      const totalPartnerDonations = campaign.partnerPoolDonations.reduce((total, donation) => total + donation.amount, 0);
      const totalAllocated = nextAllocations
        .filter((allocation) => allocation.status === "executed")
        .reduce((total, allocation) => total + allocation.amount, 0);

      return {
        ...campaign,
        partnerPool: {
          ...campaign.partnerPool,
          totalPartnerDonations,
          totalAllocated,
          balance: totalPartnerDonations - totalAllocated,
          allocations: nextAllocations,
        },
      };
    });
  };

  const partnerAllocationColumns = useMemo<DataTableColumn<CampaignAllocation>[]>(
    () => [
      {
        key: "createdAt",
        header: "Created",
        accessor: (row) => row.createdAt,
        sortable: true,
        cell: (row) => new Date(row.createdAt).toLocaleDateString(),
      },
      { key: "targetLabel", header: "Target", accessor: (row) => row.targetLabel, sortable: true },
      {
        key: "amount",
        header: "Amount",
        accessor: (row) => row.amount,
        sortable: true,
        cell: (row) => `R${row.amount.toLocaleString()}`,
      },
      {
        key: "riskBand",
        header: "Risk",
        accessor: (row) => row.riskBand,
        sortable: true,
        cell: (row) => (
          <Badge
            className={
              row.riskBand === "low"
                ? "bg-emerald-100 text-emerald-700"
                : row.riskBand === "medium"
                  ? "bg-amber-100 text-amber-700"
                  : row.riskBand === "high"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-rose-100 text-rose-700"
            }
          >
            {row.riskBand}
          </Badge>
        ),
      },
      {
        key: "approvals",
        header: "Approvals",
        accessor: (row) => `${row.approvals.filter((approval) => approval.approved).length}/${row.approvals.length}`,
        sortable: false,
        searchable: false,
        cell: (row) => (
          <div className="space-y-2">
            <p className="text-xs text-slate-500">
              {row.approvals.filter((approval) => approval.approved).length}/{row.approvals.length} complete
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!row.approvals.some((approval) => !approval.approved) || row.status === "rejected" || row.status === "executed"}
              onClick={() => {
                updatePartnerAllocation(row.id, (allocation) => {
                  const pendingApproval = allocation.approvals.find((approval) => !approval.approved);
                  if (!pendingApproval || allocation.status === "rejected" || allocation.status === "executed") {
                    return allocation;
                  }

                  const nextApprovals = allocation.approvals.map((approval) =>
                    approval.role === pendingApproval.role && !approval.approved
                      ? { ...approval, approved: true, approvedAt: new Date().toISOString() }
                      : approval,
                  );

                  const nextAllocation = {
                    ...allocation,
                    approvals: nextApprovals,
                  };

                  if (!hasAllocationApprovalsCompleted(nextAllocation)) {
                    return {
                      ...nextAllocation,
                      status: "pending-approval",
                    };
                  }

                  const nextCooldownUntil =
                    nextAllocation.riskBand === "high"
                      ? nextAllocation.cooldownUntil ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                      : nextAllocation.cooldownUntil;
                  const finalizedAllocation = {
                    ...nextAllocation,
                    cooldownUntil: nextCooldownUntil,
                  };

                  return {
                    ...finalizedAllocation,
                    status: isAllocationCoolingOffComplete(finalizedAllocation, new Date()) ? "approved" : "cooling-off",
                  };
                });
              }}
            >
              Approve next
            </Button>
          </div>
        ),
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
              updatePartnerAllocation(row.id, (allocation) => {
                const nextStatus = value as CampaignAllocation["status"];
                const now = new Date();
                if (!canTransitionAllocationStatus(allocation, nextStatus, now)) {
                  return allocation;
                }
                if (nextStatus === "cooling-off") {
                  return {
                    ...allocation,
                    status: "cooling-off",
                    cooldownUntil: allocation.cooldownUntil ?? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
                  };
                }
                return {
                  ...allocation,
                  status: nextStatus,
                };
              })
            }
          >
            <SelectTrigger className="w-[11rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending-approval" disabled={row.status === "executed"}>
                Pending approval
              </SelectItem>
              <SelectItem
                value="cooling-off"
                disabled={row.riskBand !== "high" || !hasAllocationApprovalsCompleted(row) || row.status === "executed"}
              >
                Cooling off
              </SelectItem>
              <SelectItem
                value="approved"
                disabled={!hasAllocationApprovalsCompleted(row) || !isAllocationCoolingOffComplete(row, new Date())}
              >
                Approved
              </SelectItem>
              <SelectItem value="rejected" disabled={row.status === "executed"}>
                Rejected
              </SelectItem>
              <SelectItem
                value="executed"
                disabled={!hasAllocationApprovalsCompleted(row) || !isAllocationCoolingOffComplete(row, new Date())}
              >
                Executed
              </SelectItem>
            </SelectContent>
          </Select>
        ),
      },
    ],
    [updatePartnerAllocation],
  );

  const crmMetrics = useMemo(
    () => ({
      totalGiving: scopedConfig.raised,
      activeContributors: scopedConfig.donations.filter((donation) => donation.donorName !== "Anonymous").length,
      activePartners: config.partners.length,
    }),
    [config.partners.length, scopedConfig.donations, scopedConfig.raised],
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
          config={scopedConfig}
          activePage={route.publicPage}
          applyPath={route.applyPath}
          campaignSlug={route.campaignSlug}
          fundraiserSlug={route.fundraiserSlug}
          onNavigate={setPublicPage}
          onApplyPathChange={setApplyPath}
          onCampaignChange={setCampaignSlug}
          onFundraiserChange={setFundraiserSlug}
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
          <Dashboard
            config={scopedConfig}
            onUpdate={updateConfig}
            activeCampaignSlug={route.campaignSlug}
            activeFundraiserSlug={route.fundraiserSlug}
            onSelectCampaign={setCampaignSlug}
            onSelectFundraiser={setFundraiserSlug}
            eventId={route.eventId}
            onSelectEvent={setEventId}
          />
        ) : null}

        {route.view === "editor" ? (
          <div className="flex h-full">
            <Editor
              config={scopedConfig}
              activePage={route.publicPage}
              focusedSectionId={focusedBuilderSectionId}
              onActivePageChange={setPublicPage}
              onFocusedSectionChange={setFocusedBuilderSectionId}
              onChange={handleEditorChange}
            />
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
                      config={scopedConfig}
                      activePage={route.publicPage}
                      applyPath={route.applyPath}
                      campaignSlug={route.campaignSlug}
                      fundraiserSlug={route.fundraiserSlug}
                      onNavigate={setPublicPage}
                      onApplyPathChange={setApplyPath}
                      onCampaignChange={setCampaignSlug}
                      onFundraiserChange={setFundraiserSlug}
                      onDonate={handleDonate}
                      onSubmitApplication={handleApplySubmission}
                      builderMode
                      focusedSectionId={focusedBuilderSectionId}
                      onFocusSection={setFocusedBuilderSectionId}
                      onUpdatePageSection={updateBuilderPageSection}
                      onReorderPageSections={reorderBuilderPageSections}
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
          <CrmWorkspace
            crmTab={route.crmTab}
            onTabChange={setCrmTab}
            crmTabGuide={crmTabGuide}
            crmMetrics={crmMetrics}
            scopedConfig={scopedConfig}
            config={config}
            donorColumns={donorColumns}
            partnerColumns={partnerColumns}
            onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
            activeCampaign={activeCampaign}
            activeCampaignFundraisers={activeCampaignFundraisers}
            allocationDraft={allocationDraft}
            setAllocationDraft={setAllocationDraft}
            onCreatePartnerPoolAllocation={createPartnerPoolAllocation}
            activeCampaignAllocations={activeCampaignAllocations}
            partnerAllocationColumns={partnerAllocationColumns}
          />
        ) : null}
      </main>
      <PartnerOnboardingDialog
        open={isPartnerModalOpen}
        onOpenChange={setIsPartnerModalOpen}
        newPartner={newPartner}
        setNewPartner={setNewPartner}
        partnerTiers={config.partnerTiers}
        onUploadLogo={uploadNewPartnerLogo}
        onSubmit={handleOnboardPartner}
      />
    </div>
  );
}
