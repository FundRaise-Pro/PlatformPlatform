import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { CreateEventDialog } from "./-components/CreateEventDialog";
import { EventDetailPane } from "./-components/EventDetailPane";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";

export const Route = createFileRoute("/$slug/fundraiser/events")({
  component: EventsPage
});

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);
}

function eventStatusVariant(status: string) {
  switch (status) {
    case "Planned":
      return "neutral";
    case "InProgress":
      return "success";
    case "Completed":
      return "info";
    case "Cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

export default function EventsPage() {
  const { data: events, isLoading } = api.useQuery("get", "/api/fundraiser/events");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Events` }]} />}
        title={t`Events`}
        subtitle={t`Plan and manage fundraising events.`}
        sidePane={
          selectedEventId ? (
            <EventDetailPane
              eventId={selectedEventId}
              isOpen={!!selectedEventId}
              onClose={() => setSelectedEventId(null)}
            />
          ) : undefined
        }
      >
        <div className="mb-4 flex items-center justify-between">
          <Text className="text-muted-foreground">{events ? t`${events.length} events` : t`Loading...`}</Text>
          <Button onPress={() => setIsCreateOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            <Trans>Create event</Trans>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Text className="text-muted-foreground">
              <Trans>Loading events...</Trans>
            </Text>
          </div>
        ) : events && events.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead className="border-border border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Name</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Date</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Status</Trans>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground text-sm">
                    <Trans>Progress</Trans>
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr
                    key={String(event.id)}
                    className="cursor-pointer border-border border-b last:border-b-0 hover:bg-hover-background"
                    onClick={() => setSelectedEventId(String(event.id))}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <Text className="font-medium text-foreground">{event.name}</Text>
                        {event.location && (
                          <Text className="text-muted-foreground text-xs">{event.location}</Text>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(event.eventDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={eventStatusVariant(event.status)}>{event.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {event.targetAmount > 0
                        ? `${formatCurrency(event.raisedAmount ?? 0)} / ${formatCurrency(event.targetAmount)}`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <Text className="mb-2 text-muted-foreground">
              <Trans>No events yet</Trans>
            </Text>
            <Text className="text-muted-foreground text-sm">
              <Trans>Create fundraising events to engage your community.</Trans>
            </Text>
          </div>
        )}

        <CreateEventDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      </AppLayout>
    </>
  );
}
