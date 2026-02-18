import { Calendar, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FundraiserConfig } from "@/types";
import { PageHero } from "@/components/preview/PageHero";
import { PageSections } from "@/components/preview/PageSections";

interface EventsPageProps {
  config: FundraiserConfig;
}

export function EventsPage({ config }: EventsPageProps) {
  const customization = config.pageCustomizations.events;

  return (
    <div className="space-y-6 px-6 py-8 md:px-10 md:py-10">
      <PageHero customization={customization} campaignLabel="Community events" />
      <PageSections sections={customization.sections} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {config.events.map((event) => (
          <Card key={event.id} className="border-white/90 bg-white/90 shadow-soft">
            <CardHeader>
              <div className="mb-3 inline-flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Calendar className="size-5" />
              </div>
              <CardTitle className="font-display text-2xl">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="inline-flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="size-4 text-rose-500" />
                {event.venue}
              </p>
              <p className="text-sm text-slate-700">
                {new Date(event.date).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <Button variant="outline" className="w-full rounded-full">
                Reserve seat
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
