import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FundraiserConfig, PublicPageId } from "@/types";
import { PUBLIC_PAGE_ORDER } from "@/lib/constants";

interface PreviewNavigationProps {
  config: FundraiserConfig;
  activePage: PublicPageId;
  activeCampaignSlug: string;
  onNavigate: (page: PublicPageId) => void;
  onCampaignChange: (campaignSlug: string) => void;
  onDonate: () => void;
}

function formatCampaignStatus(status?: FundraiserConfig["campaigns"][number]["lifecycleStatus"]): string {
  if (status === "completed") {
    return "Completed";
  }
  if (status === "archived") {
    return "Archived";
  }
  if (status === "planned") {
    return "Planned";
  }
  return "Active";
}

export function PreviewNavigation({
  config,
  activePage,
  activeCampaignSlug,
  onNavigate,
  onCampaignChange,
  onDonate,
}: PreviewNavigationProps) {
  const visiblePages = PUBLIC_PAGE_ORDER.filter((pageId) => config.pageCustomizations[pageId].isVisible);
  const activeCampaign =
    config.campaigns.find((campaign) => campaign.slug === activeCampaignSlug) ??
    config.campaigns.find((campaign) => campaign.id === config.activeCampaignId) ??
    config.campaigns[0];
  const canDonateDirectly = activeCampaign?.allowsDirectDonations ?? true;

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <button
          type="button"
          className="group inline-flex items-center gap-3 rounded-full border border-transparent px-3 py-2 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
          onClick={() => onNavigate("landing")}
        >
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
            <Heart className="size-5" />
          </span>
          <span>
            <span className="block text-xs uppercase tracking-[0.18em] text-slate-500">Campaign Hub</span>
            <span className="font-display text-lg font-semibold text-slate-900">{config.tenantName}</span>
          </span>
        </button>

        <nav className="flex flex-wrap items-center gap-2">
          {visiblePages.map((page) => (
            <Button
              key={page}
              variant={activePage === page ? "secondary" : "ghost"}
              className="rounded-full"
              onClick={() => onNavigate(page)}
              type="button"
            >
              {config.pageCustomizations[page].navigationLabel}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Select value={activeCampaign?.slug ?? activeCampaignSlug} onValueChange={onCampaignChange}>
            <SelectTrigger className="w-[18rem] rounded-full border-slate-200 bg-white">
              <SelectValue placeholder="Choose campaign" />
            </SelectTrigger>
            <SelectContent>
              {config.campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.slug}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge
            className={
              activeCampaign?.lifecycleStatus === "completed"
                ? "rounded-full bg-slate-200 px-3 py-1 text-slate-700"
                : activeCampaign?.lifecycleStatus === "archived"
                  ? "rounded-full bg-amber-100 px-3 py-1 text-amber-700"
                  : "rounded-full bg-emerald-50 px-3 py-1 text-emerald-700"
            }
          >
            {formatCampaignStatus(activeCampaign?.lifecycleStatus)}
          </Badge>
          <Button
            type="button"
            className="rounded-full px-6"
            onClick={onDonate}
            style={{ backgroundColor: config.primaryColor }}
            disabled={!canDonateDirectly}
          >
            {config.terminology.donation}
          </Button>
        </div>
      </div>
    </header>
  );
}
