import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FundraiserConfig } from "@/types";
import { PageHero } from "@/components/preview/PageHero";
import { PageSections, PageSectionsBuilderProps } from "@/components/preview/PageSections";

interface LandingPageProps {
  config: FundraiserConfig;
  onStartDonate: () => void;
  onNavigateFundraisers: () => void;
  onOpenCampaign: (campaignSlug: string) => void;
  sectionBuilder?: PageSectionsBuilderProps;
}

export function LandingPage({
  config,
  onStartDonate,
  onNavigateFundraisers,
  onOpenCampaign,
  sectionBuilder,
}: LandingPageProps) {
  const customization = config.pageCustomizations.landing;
  const progressPercent = Math.min(100, (config.raised / config.goal) * 100);
  const allFundraiserCards = config.campaigns.flatMap((campaign) =>
    campaign.fundraisers.map((fundraiser) => ({
      id: fundraiser.id,
      name: fundraiser.title,
      bio: fundraiser.summary,
      image: fundraiser.heroImage,
    })),
  );

  return (
    <div className="space-y-6 px-6 py-8 md:px-10 md:py-10">
      <PageHero
        customization={customization}
        campaignLabel={`Active ${config.terminology.campaign}`}
        actionLabel={`Support this ${config.terminology.campaign.toLowerCase()}`}
        onAction={onStartDonate}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="glass-surface md:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Progress Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Raised</p>
                <p className="font-display text-4xl font-semibold text-slate-900">${config.raised.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Goal</p>
                <p className="font-display text-3xl font-semibold text-slate-900">${config.goal.toLocaleString()}</p>
              </div>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-sm text-slate-600">{progressPercent.toFixed(0)}% of the mission target secured.</p>
          </CardContent>
        </Card>

        <Card className="glass-surface">
          <CardHeader>
            <CardTitle className="font-display text-xl">Live Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{config.terminology.donor} count</span>
              <span className="font-semibold text-slate-900">{config.donations.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Partners active</span>
              <span className="font-semibold text-slate-900">{config.partners.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Compliance state</span>
              <span className="font-semibold text-emerald-700">Verified</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <PageSections sections={customization.sections} builder={sectionBuilder} />

      <Card className="glass-surface">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="font-display text-2xl">Our initiatives</CardTitle>
          <Button variant="ghost" className="rounded-full" onClick={onNavigateFundraisers} type="button">
            Browse all <ArrowRight className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {config.campaigns.map((campaign) => (
            <Card key={campaign.id} className="border-white/90 bg-white/95 shadow-none">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg text-slate-900">{campaign.name}</p>
                  <span
                    className={`rounded-full px-2 py-1 text-[0.65rem] uppercase tracking-[0.12em] ${
                      campaign.lifecycleStatus === "completed"
                        ? "bg-slate-200 text-slate-700"
                        : campaign.lifecycleStatus === "archived"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {campaign.lifecycleStatus ?? "active"}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{campaign.description}</p>
                <p className="text-xs text-slate-500">
                  Fundraisers: {campaign.fundraisers.length} | Events: {campaign.events.length}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => onOpenCampaign(campaign.slug)}
                >
                  Open campaign
                </Button>
              </CardContent>
            </Card>
          ))}

          {allFundraiserCards.slice(0, 3).map((story) => (
            <Card key={story.id} className="border-white/90 bg-white/95 shadow-none">
              <img src={story.image} alt={story.name} className="h-40 w-full rounded-t-xl object-cover" loading="lazy" />
              <CardContent className="space-y-2 p-4">
                <p className="font-display text-lg text-slate-900">{story.name}</p>
                <p className="line-clamp-2 text-sm text-slate-600">{story.bio}</p>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
