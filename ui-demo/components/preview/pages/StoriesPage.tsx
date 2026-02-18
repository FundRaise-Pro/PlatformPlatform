import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FundraiserConfig } from "@/types";
import { PageHero } from "@/components/preview/PageHero";
import { PageSections } from "@/components/preview/PageSections";

interface StoriesPageProps {
  config: FundraiserConfig;
}

export function StoriesPage({ config }: StoriesPageProps) {
  const customization = config.pageCustomizations.stories;

  return (
    <div className="space-y-6 px-6 py-8 md:px-10 md:py-10">
      <PageHero customization={customization} campaignLabel="Impact narratives" />
      <PageSections sections={customization.sections} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {config.beneficiaryStories.map((story) => (
          <Card key={story.id} className="overflow-hidden border-white/90 bg-white/90 shadow-soft">
            <img src={story.image} alt={story.name} className="h-52 w-full object-cover" loading="lazy" />
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-2xl">{story.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">{story.bio}</p>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-sm">
                <div>
                  <p className="text-slate-500">Raised</p>
                  <p className="font-semibold text-slate-900">${story.raised.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Goal</p>
                  <p className="font-semibold text-slate-900">${story.goal.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
