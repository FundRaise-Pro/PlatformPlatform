import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApplyPathId, PublicPageId, FundraiserConfig, DonationTier } from "@/types";
import { PreviewNavigation } from "@/components/preview/PreviewNavigation";
import { LandingPage } from "@/components/preview/pages/LandingPage";
import { StoriesPage } from "@/components/preview/pages/StoriesPage";
import { EventsPage } from "@/components/preview/pages/EventsPage";
import { BlogPage } from "@/components/preview/pages/BlogPage";
import { PartnersPage } from "@/components/preview/pages/PartnersPage";
import { ApplyPage } from "@/components/preview/pages/ApplyPage";
import { SuccessPage } from "@/components/preview/pages/SuccessPage";

interface PreviewProps {
  config: FundraiserConfig;
  activePage: PublicPageId;
  applyPath: ApplyPathId;
  onNavigate: (page: PublicPageId) => void;
  onApplyPathChange: (path: ApplyPathId) => void;
  onDonate?: (amount: number, name: string, tierId?: string) => void;
  onSubmitApplication?: (categoryId: ApplyPathId, values: Record<string, string>) => void;
}

const DEFAULT_TIER = "custom";

export default function Preview({
  config,
  activePage,
  applyPath,
  onNavigate,
  onApplyPathChange,
  onDonate,
  onSubmitApplication,
}: PreviewProps) {
  const [isDonateDialogOpen, setIsDonateDialogOpen] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState<string>(DEFAULT_TIER);
  const [customAmount, setCustomAmount] = useState("25");
  const [donorName, setDonorName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedTier = useMemo<DonationTier | undefined>(
    () => config.tiers.find((tier) => tier.id === selectedTierId),
    [config.tiers, selectedTierId],
  );

  const parsedCustomAmount = Number(customAmount || "0");
  const selectedAmount = selectedTier ? selectedTier.amount : Number.isFinite(parsedCustomAmount) ? parsedCustomAmount : 0;

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
    if (showSuccess) {
      return <SuccessPage config={config} onContinue={() => setShowSuccess(false)} />;
    }

    if (activePage === "stories") {
      return <StoriesPage config={config} />;
    }

    if (activePage === "events") {
      return <EventsPage config={config} />;
    }

    if (activePage === "blog") {
      return <BlogPage config={config} />;
    }

    if (activePage === "partners") {
      return <PartnersPage config={config} />;
    }

    if (activePage === "apply") {
      return (
        <ApplyPage
          config={config}
          activePath={applyPath}
          onPathChange={onApplyPathChange}
          onSubmitApplication={onSubmitApplication}
        />
      );
    }

    return <LandingPage config={config} onStartDonate={() => setIsDonateDialogOpen(true)} onNavigateStories={() => onNavigate("stories")} />;
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PreviewNavigation config={config} activePage={activePage} onNavigate={onNavigate} onDonate={() => setIsDonateDialogOpen(true)} />
      <ScrollArea className="flex-1">{renderPage()}</ScrollArea>

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
