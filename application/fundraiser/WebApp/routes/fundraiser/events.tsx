import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Button } from "@repo/ui/components/Button";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";

export const Route = createFileRoute("/fundraiser/events")({
  component: EventsPage
});

export default function EventsPage() {
  const { data: events, isLoading } = api.useQuery("get", "/api/fundraiser/events");

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Events` }]} />}
        title={t`Events`}
        subtitle={t`Plan and manage fundraising events.`}
      >
        <div className="mb-4 flex items-center justify-between">
          <Text className="text-muted-foreground">
            {events ? t`${events.length} events` : t`Loading...`}
          </Text>
          <Button onPress={() => {}}>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event: Record<string, unknown>) => (
              <div key={String(event.id)} className="overflow-hidden rounded-lg border border-border p-4">
                <Text className="font-medium">{String(event.title ?? event.name ?? "")}</Text>
                {event.startDate && (
                  <Text className="mt-1 text-muted-foreground text-sm">
                    {new Date(String(event.startDate)).toLocaleDateString()}
                  </Text>
                )}
                {event.location && (
                  <Text className="mt-1 text-muted-foreground text-sm">{String(event.location)}</Text>
                )}
              </div>
            ))}
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
      </AppLayout>
    </>
  );
}
