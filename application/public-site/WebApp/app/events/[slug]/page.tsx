import { Calendar, Clock, Heart, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicEventBySlug } from "@/actions/events.server";
import { getTenantSettings } from "@/actions/settings.server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const event = await getPublicEventBySlug(slug);
    return {
      title: event.name,
      description: event.description?.slice(0, 160)
    };
  } catch {
    return { title: "Event not found" };
  }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const settings = await getTenantSettings();

  let event;
  try {
    event = await getPublicEventBySlug(slug);
  } catch {
    notFound();
  }

  const progressPercentage = event.targetAmount > 0
    ? Math.min(100, (event.raisedAmount / event.targetAmount) * 100)
    : 0;

  const currencyFormatter = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0
  });

  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-200">
          {event.campaignSlug && (
            <div className="mb-4">
              <Link href={`/campaigns/${event.campaignSlug}`} className="text-primary hover:underline">
                ← Back to campaign
              </Link>
            </div>
          )}

          {event.imageUrl && (
            <div className="mb-8 overflow-hidden rounded-xl">
              <img
                src={event.imageUrl}
                alt={event.name}
                className="h-auto w-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <h1>{event.name}</h1>
              <Badge variant="secondary">{event.status}</Badge>
            </div>

            <div className="mb-6 flex flex-wrap gap-4 text-muted-foreground">
              {event.eventDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  {new Date(event.eventDate).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </span>
              )}
              {event.eventDate && (
                <span className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {new Date(event.eventDate).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              )}
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  {event.location}
                </span>
              )}
            </div>
          </div>

          {event.targetAmount > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="size-5 text-rose-500" />
                  Fundraising progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">
                    {currencyFormatter.format(event.raisedAmount)} raised
                  </span>
                  <span className="text-muted-foreground">
                    of {currencyFormatter.format(event.targetAmount)} goal
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="mt-2 text-right text-sm text-muted-foreground">
                  {progressPercentage.toFixed(0)}% complete
                </div>

                <div className="mt-4">
                  <Link
                    href={`/donate?targetType=Event&targetId=${event.id}&targetName=${encodeURIComponent(event.name)}`}
                    className="inline-flex h-(--control-height) cursor-pointer items-center rounded-md bg-primary px-6 text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/70"
                  >
                    Donate to this event
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>About this event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none whitespace-pre-wrap">{event.description}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
