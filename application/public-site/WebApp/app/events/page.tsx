import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock } from "lucide-react";
import { getPublicEvents } from "@/actions/events.server";
import { getTenantSettings } from "@/actions/settings.server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getTenantSettings();
  const orgName = settings.brand.organizationName ?? "Fundraiser";
  return {
    title: "Events",
    description: `Upcoming events from ${orgName}. Join us and make a difference.`,
  };
}

export default async function EventsPage() {
  const settings = await getTenantSettings();
  const orgName = settings.brand.organizationName ?? "Our Organisation";

  let events: Awaited<ReturnType<typeof getPublicEvents>> = [];
  let error: string | null = null;

  try {
    events = await getPublicEvents();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load events";
    console.error("Error loading events:", err);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Events
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Upcoming events and activities from {orgName}
          </p>
        </div>

        {/* Error */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-center text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!error && events.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No upcoming events at the moment. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Events List */}
        {!error && events.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.slug} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{event.name}</CardTitle>
                  <CardDescription className="space-y-2">
                    {event.eventDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.eventDate).toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    )}
                    {event.eventDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(event.eventDate).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                {event.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {event.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
