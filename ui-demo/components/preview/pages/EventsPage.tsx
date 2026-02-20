import { Calendar, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventCalendar } from "@/components/EventCalendar";
import { FundraiserConfig } from "@/types";
import { PageHero } from "@/components/preview/PageHero";
import { PageSections, PageSectionsBuilderProps } from "@/components/preview/PageSections";

interface EventsPageProps {
  config: FundraiserConfig;
  sectionBuilder?: PageSectionsBuilderProps;
}

export function EventsPage({ config, sectionBuilder }: EventsPageProps) {
  const customization = config.pageCustomizations.events;
  const allEvents = config.campaigns.flatMap((campaign) => campaign.events);
  const campaignNameLookup = config.campaigns.reduce<Record<string, string>>((accumulator, campaign) => {
    accumulator[campaign.id] = campaign.name;
    return accumulator;
  }, {});

  return (
    <div className="space-y-6 px-6 py-8 md:px-10 md:py-10">
      <PageHero customization={customization} campaignLabel="Community events" />
      <PageSections sections={customization.sections} builder={sectionBuilder} />
      <EventCalendar
        events={allEvents}
        title="Event calendar"
        description="Dates with events are highlighted so supporters can plan participation early."
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {allEvents.map((event) => (
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
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                {campaignNameLookup[event.campaignId] ?? "Campaign"}
              </p>
              {event.volunteerIds?.length ? (
                <p className="text-xs text-slate-500">
                  Volunteers:{" "}
                  {event.volunteerIds
                    .map((volunteerId) => config.volunteers.find((volunteer) => volunteer.id === volunteerId)?.fullName ?? "Team member")
                    .join(", ")}
                </p>
              ) : null}
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
