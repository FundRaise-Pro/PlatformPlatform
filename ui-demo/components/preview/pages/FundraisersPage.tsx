import { ArrowRight, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FundraiserConfig } from "@/types";
import { PageHero } from "@/components/preview/PageHero";
import { PageSections } from "@/components/preview/PageSections";

interface FundraisersPageProps {
  config: FundraiserConfig;
  activeFundraiserSlug: string;
  onOpenFundraiser: (slug: string) => void;
}

export function FundraisersPage({ config, activeFundraiserSlug, onOpenFundraiser }: FundraisersPageProps) {
  const customization = config.pageCustomizations.fundraisers;
  const activeCampaign = config.campaigns.find((campaign) => campaign.id === config.activeCampaignId) ?? config.campaigns[0];
  const fundraisers = activeCampaign?.fundraisers ?? [];
  const selectedFundraiser = fundraisers.find((entry) => entry.slug === activeFundraiserSlug) ?? fundraisers[0];

  return (
    <div className="space-y-6 px-6 py-8 md:px-10 md:py-10">
      <PageHero customization={customization} campaignLabel="Fundraiser index" />
      <PageSections sections={customization.sections} />
      {selectedFundraiser ? (
        <Card className="border-white/90 bg-white/90 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-3xl">{selectedFundraiser.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700">{selectedFundraiser.story}</p>
            <p className="text-sm text-slate-500">
              Public URL: {`/campaigns/${activeCampaign.slug}/fundraisers/${selectedFundraiser.slug}`}
            </p>
          </CardContent>
        </Card>
      ) : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fundraisers.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-white/90 md:col-span-2 xl:col-span-3">
            <CardContent className="p-8 text-sm text-slate-600">
              This campaign is currently configured as general-impact with no active fundraiser pages.
            </CardContent>
          </Card>
        ) : null}
        {fundraisers.map((fundraiser) => (
          <Card key={fundraiser.id} className="overflow-hidden border-white/90 bg-white/90 shadow-soft">
            <img src={fundraiser.heroImage} alt={fundraiser.title} className="h-52 w-full object-cover" loading="lazy" />
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-2xl">{fundraiser.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">{fundraiser.summary}</p>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-sm">
                <div>
                  <p className="text-slate-500">Raised</p>
                  <p className="font-semibold text-slate-900">${fundraiser.raised.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Goal</p>
                  <p className="font-semibold text-slate-900">${fundraiser.goal.toLocaleString()}</p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">
                <BadgeCheck className="size-3.5" />
                {`/campaigns/${activeCampaign.slug}/fundraisers/${fundraiser.slug}`}
              </Badge>
              <Button type="button" variant="outline" className="w-full rounded-full" onClick={() => onOpenFundraiser(fundraiser.slug)}>
                Open fundraiser page
                <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
