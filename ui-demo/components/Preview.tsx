import { useMemo, useState } from "react";
import { Loader2, Monitor, Tablet, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApplyPathId, PublicPageId, FundraiserConfig, DonationTier } from "@/types";
import { PageSectionsBuilderProps } from "@/components/preview/PageSections";
import { PreviewNavigation } from "@/components/preview/PreviewNavigation";
import { LandingPage } from "@/components/preview/pages/LandingPage";
import { FundraisersPage } from "@/components/preview/pages/FundraisersPage";
import { EventsPage } from "@/components/preview/pages/EventsPage";
import { BlogPage } from "@/components/preview/pages/BlogPage";
import { PartnersPage } from "@/components/preview/pages/PartnersPage";
import { ApplyPage } from "@/components/preview/pages/ApplyPage";
import { SuccessPage } from "@/components/preview/pages/SuccessPage";

interface PreviewProps {
  config: FundraiserConfig;
  activePage: PublicPageId;
  applyPath: ApplyPathId;
  campaignSlug: string;
  fundraiserSlug: string;
  onNavigate: (page: PublicPageId) => void;
  onApplyPathChange: (path: ApplyPathId) => void;
  onCampaignChange: (slug: string) => void;
  onFundraiserChange: (slug: string, campaignSlug?: string) => void;
  onDonate?: (amount: number, name: string, tierId?: string) => void;
  onSubmitApplication?: (categoryId: ApplyPathId, values: Record<string, string>) => void;
  builderMode?: boolean;
  focusedSectionId?: string | null;
  onFocusSection?: (sectionId: string | null) => void;
  onUpdatePageSection?: (
    pageId: PublicPageId,
    sectionId: string,
    updates: Partial<FundraiserConfig["pageCustomizations"][PublicPageId]["sections"][number]>,
  ) => void;
  onReorderPageSections?: (pageId: PublicPageId, orderedSectionIds: string[]) => void;
}

const DEFAULT_TIER = "custom";

type PreviewMode = "desktop" | "tablet" | "mobile";

const PREVIEW_MODE_CONFIG: Record<PreviewMode, { icon: typeof Monitor; label: string; maxWidth?: string }> = {
  desktop: { icon: Monitor, label: "Desktop" },
  tablet: { icon: Tablet, label: "Tablet", maxWidth: "48rem" },
  mobile: { icon: Smartphone, label: "Mobile", maxWidth: "24rem" },
};

export default function Preview({
  config,
  activePage,
  applyPath,
  campaignSlug,
  fundraiserSlug,
  onNavigate,
  onApplyPathChange,
  onCampaignChange,
  onFundraiserChange,
  onDonate,
  onSubmitApplication,
  builderMode = false,
  focusedSectionId = null,
  onFocusSection,
  onUpdatePageSection,
  onReorderPageSections,
}: PreviewProps) {
  const [isDonateDialogOpen, setIsDonateDialogOpen] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState<string>(DEFAULT_TIER);
  const [customAmount, setCustomAmount] = useState("25");
  const [donorName, setDonorName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");

  const selectedTier = useMemo<DonationTier | undefined>(
    () => config.tiers.find((tier) => tier.id === selectedTierId),
    [config.tiers, selectedTierId],
  );
  const activeCampaign = useMemo(
    () =>
      config.campaigns.find((campaign) => campaign.slug === campaignSlug) ??
      config.campaigns.find((campaign) => campaign.id === config.activeCampaignId) ??
      config.campaigns[0],
    [campaignSlug, config.activeCampaignId, config.campaigns],
  );

  const parsedCustomAmount = Number(customAmount || "0");
  const selectedAmount = selectedTier ? selectedTier.amount : Number.isFinite(parsedCustomAmount) ? parsedCustomAmount : 0;

  const handleCampaignSelection = (nextCampaignSlug: string) => {
    const nextCampaign = config.campaigns.find((campaign) => campaign.slug === nextCampaignSlug);
    if (activePage === "fundraisers") {
      const nextFundraiserSlug = nextCampaign?.fundraisers[0]?.slug ?? fundraiserSlug;
      onFundraiserChange(nextFundraiserSlug, nextCampaignSlug);
      return;
    }

    onCampaignChange(nextCampaignSlug);
  };

  const handleFinalizeDonation = () => {
    if (!selectedAmount || selectedAmount <= 0) {
      return;
    }

    setIsProcessing(true);
    window.setTimeout(() => {
      onDonate?.(selectedAmount, donorName || "Anonymous", selectedTier?.id);
      setIsProcessing(false);
      setIsDonateDialogOpen(false);
      setShowSuccess(true);
      setDonorName("");
      setCustomAmount("25");
      setSelectedTierId(DEFAULT_TIER);
    }, 1000);
  };

  const renderPage = () => {
    const sectionBuilder: PageSectionsBuilderProps | undefined =
      builderMode && onFocusSection && onUpdatePageSection && onReorderPageSections
        ? {
            enabled: true,
            focusedSectionId,
            onFocusSection,
            onUpdateSection: (sectionId, updates) => onUpdatePageSection(activePage, sectionId, updates),
            onReorderSections: (orderedSectionIds) => onReorderPageSections(activePage, orderedSectionIds),
          }
        : undefined;

    if (showSuccess) {
      return <SuccessPage config={config} onContinue={() => setShowSuccess(false)} />;
    }

    if (activePage === "fundraisers") {
      return (
        <FundraisersPage
          config={config}
          activeCampaignSlug={activeCampaign?.slug ?? campaignSlug}
          activeFundraiserSlug={fundraiserSlug}
          onOpenCampaign={handleCampaignSelection}
          onOpenFundraiser={(nextCampaignSlug, nextFundraiserSlug) => {
            onFundraiserChange(nextFundraiserSlug, nextCampaignSlug);
          }}
          sectionBuilder={sectionBuilder}
        />
      );
    }

    if (activePage === "events") {
      return <EventsPage config={config} sectionBuilder={sectionBuilder} />;
    }

    if (activePage === "blog") {
      return <BlogPage config={config} sectionBuilder={sectionBuilder} />;
    }

    if (activePage === "partners") {
      return <PartnersPage config={config} sectionBuilder={sectionBuilder} />;
    }

    if (activePage === "apply") {
      return (
        <ApplyPage
          config={config}
          activeCampaignSlug={activeCampaign?.slug ?? campaignSlug}
          activePath={applyPath}
          onPathChange={onApplyPathChange}
          onSubmitApplication={onSubmitApplication}
          sectionBuilder={sectionBuilder}
        />
      );
    }

    return (
      <LandingPage
        config={config}
        onStartDonate={() => setIsDonateDialogOpen(true)}
        onNavigateFundraisers={() => onNavigate("fundraisers")}
        onOpenCampaign={(nextCampaignSlug) => {
          const nextCampaign = config.campaigns.find((campaign) => campaign.slug === nextCampaignSlug);
          const nextFundraiserSlug = nextCampaign?.fundraisers[0]?.slug ?? fundraiserSlug;
          onFundraiserChange(nextFundraiserSlug, nextCampaignSlug);
        }}
        sectionBuilder={sectionBuilder}
      />
    );
  };

  const activePreviewConfig = PREVIEW_MODE_CONFIG[previewMode];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PreviewNavigation
        config={config}
        activePage={activePage}
        activeCampaignSlug={activeCampaign?.slug ?? campaignSlug}
        onNavigate={onNavigate}
        onCampaignChange={handleCampaignSelection}
        onDonate={() => setIsDonateDialogOpen(true)}
      />

      {builderMode ? (
        <div className="flex items-center justify-center gap-1 border-b bg-slate-50 py-1.5">
          {(Object.entries(PREVIEW_MODE_CONFIG) as [PreviewMode, (typeof PREVIEW_MODE_CONFIG)[PreviewMode]][]).map(
            ([mode, modeConfig]) => {
              const Icon = modeConfig.icon;
              return (
                <button
                  key={mode}
                  type="button"
                  title={modeConfig.label}
                  onClick={() => setPreviewMode(mode)}
                  className={`rounded-md p-1.5 transition-colors ${
                    previewMode === mode
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  }`}
                >
                  <Icon className="size-4" />
                </button>
              );
            },
          )}
        </div>
      ) : null}

      <ScrollArea className="flex-1">
        <div
          className="mx-auto transition-all duration-300"
          style={{ maxWidth: activePreviewConfig.maxWidth }}
        >
          {renderPage()}
        </div>
      </ScrollArea>

      <Dialog open={isDonateDialogOpen} onOpenChange={setIsDonateDialogOpen}>
        <DialogContent className="rounded-3xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl">Support this mission</DialogTitle>
            <DialogDescription>
              Configure a contribution tier or choose a custom amount. The preview keeps the full donation flow behavior.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="donorName">Supporter name</Label>
              <Input
                id="donorName"
                value={donorName}
                onChange={(event) => setDonorName(event.target.value)}
                placeholder="Optional (anonymous supported)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tier">Contribution tier</Label>
              <Select value={selectedTierId} onValueChange={setSelectedTierId}>
                <SelectTrigger id="tier">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DEFAULT_TIER}>Custom amount</SelectItem>
                  {config.tiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.label} - ${tier.amount}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTierId === DEFAULT_TIER ? (
              <div className="space-y-2">
                <Label htmlFor="customAmount">Custom amount</Label>
                <Input
                  id="customAmount"
                  type="number"
                  min="1"
                  value={customAmount}
                  onChange={(event) => setCustomAmount(event.target.value)}
                />
              </div>
            ) : null}

            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              Final amount: <span className="font-semibold">${selectedAmount || 0}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setIsDonateDialogOpen(false)} type="button">
              Cancel
            </Button>
            <Button className="rounded-full" onClick={handleFinalizeDonation} disabled={isProcessing || selectedAmount <= 0} type="button">
              {isProcessing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processing
                </>
              ) : (
                `Donate $${selectedAmount || 0}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
