import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageCustomization } from "@/types";

interface PageHeroProps {
  customization: PageCustomization;
  campaignLabel: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function PageHero({ customization, campaignLabel, actionLabel, onAction }: PageHeroProps) {
  return (
    <header className="relative isolate overflow-hidden rounded-3xl border border-white/80 bg-white px-6 py-8 shadow-soft md:px-10 md:py-12">
      <img
        src={customization.heroImage}
        alt={customization.heading}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-900/45 to-emerald-900/30" />
      <div className="relative z-10 flex flex-col gap-8">
        <div className="space-y-4">
          <Badge className="rounded-full bg-white/90 px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] text-slate-700">
            {campaignLabel}
          </Badge>
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
            {customization.heading}
          </h1>
          <p className="max-w-3xl text-sm text-white/85 md:text-base">{customization.subheading}</p>
        </div>
        {onAction && actionLabel ? (
          <div>
            <Button
              className="rounded-full bg-white text-slate-900 hover:bg-white/90"
              size="lg"
              onClick={onAction}
              type="button"
            >
              {actionLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
