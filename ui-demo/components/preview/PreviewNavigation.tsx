import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FundraiserConfig, PublicPageId } from "@/types";
import { PUBLIC_PAGE_ORDER } from "@/lib/constants";

interface PreviewNavigationProps {
  config: FundraiserConfig;
  activePage: PublicPageId;
  onNavigate: (page: PublicPageId) => void;
  onDonate: () => void;
}

export function PreviewNavigation({ config, activePage, onNavigate, onDonate }: PreviewNavigationProps) {
  const visiblePages = PUBLIC_PAGE_ORDER.filter((pageId) => config.pageCustomizations[pageId].isVisible);

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
            <span className="block text-xs uppercase tracking-[0.18em] text-slate-500">Fundraise Pro</span>
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
          <Badge className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">S18A Ready</Badge>
          <Button type="button" className="rounded-full px-6" onClick={onDonate} style={{ backgroundColor: config.primaryColor }}>
            {config.terminology.donation}
          </Button>
        </div>
      </div>
    </header>
  );
}
