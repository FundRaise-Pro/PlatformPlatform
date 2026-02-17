import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Separator } from "@repo/ui/components/Separator";
import { SidePane, SidePaneBody, SidePaneHeader } from "@repo/ui/components/SidePane";
import { Text } from "@repo/ui/components/Text";
import { useQueryClient } from "@tanstack/react-query";
import {
  BanIcon,
  CalendarIcon,
  CheckCircle2Icon,
  MapPinIcon,
  PlayIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/shared/lib/api/client";

type EventDetailPaneProps = Readonly<{
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}>;

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);
}

export function EventDetailPane({ eventId, isOpen, onClose }: EventDetailPaneProps) {
  const queryClient = useQueryClient();
  const { data: event, isLoading } = api.useQuery("get", "/api/fundraiser/events/{id}", {
    params: { path: { id: eventId } },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/events"] });
    queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/events/{id}"] });
  };

  const startMutation = api.useMutation("post", "/api/fundraiser/events/{id}/start", {
    onSuccess: () => {
      invalidate();
      toast.success(t`Event started`);
    },
  });
  const completeMutation = api.useMutation("post", "/api/fundraiser/events/{id}/complete", {
    onSuccess: () => {
      invalidate();
      toast.success(t`Event completed`);
    },
  });
  const cancelMutation = api.useMutation("post", "/api/fundraiser/events/{id}/cancel", {
    onSuccess: () => {
      invalidate();
      toast.success(t`Event cancelled`);
    },
  });
  const deleteMutation = api.useMutation("delete", "/api/fundraiser/events/{id}", {
    onSuccess: () => {
      invalidate();
      toast.success(t`Event deleted`);
      onClose();
    },
  });

  const anyPending =
    startMutation.isPending || completeMutation.isPending || cancelMutation.isPending || deleteMutation.isPending;

  const pathParams = { params: { path: { id: eventId } } };

  return (
    <SidePane isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SidePaneHeader>{event?.name ?? t`Event`}</SidePaneHeader>
      <SidePaneBody>
        {isLoading ? (
          <Text className="text-muted-foreground">
            <Trans>Loading...</Trans>
          </Text>
        ) : event ? (
          <div className="flex flex-col gap-6">
            {/* Image */}
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={event.name} className="h-48 w-full rounded-lg object-cover" />
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg bg-muted">
                <CalendarIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            )}

            {/* Status badge */}
            <div className="flex items-center gap-3">
              <Badge variant={eventStatusVariant(event.status)} className="text-sm">
                {event.status}
              </Badge>
            </div>

            {/* Funding progress */}
            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center justify-between">
                <Text className="text-muted-foreground text-sm">
                  <Trans>Raised</Trans>
                </Text>
                <Text className="text-muted-foreground text-sm">
                  <Trans>Target</Trans>
                </Text>
              </div>
              <div className="mb-2 flex items-center justify-between">
                <Text className="font-bold text-lg">{formatCurrency(event.raisedAmount ?? 0)}</Text>
                <Text className="font-medium">{formatCurrency(event.targetAmount)}</Text>
              </div>
              {event.targetAmount > 0 && (
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(100, ((event.raisedAmount ?? 0) / event.targetAmount) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <DetailField
                label={t`Event Date`}
                value={new Date(event.eventDate).toLocaleDateString()}
              />
              {event.location && (
                <div className="flex items-start gap-1.5">
                  <MapPinIcon className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <Text className="text-muted-foreground text-xs">{t`Location`}</Text>
                    <Text className="font-medium text-sm">{event.location}</Text>
                  </div>
                </div>
              )}
              {event.campaignId && (
                <DetailField label={t`Campaign`} value={String(event.campaignId)} />
              )}
              <DetailField label={t`Created`} value={new Date(event.createdAt).toLocaleDateString()} />
            </div>

            {/* Description */}
            {event.description && (
              <>
                <Separator />
                <div>
                  <Text className="mb-2 font-medium text-sm">
                    <Trans>Description</Trans>
                  </Text>
                  <Text className="line-clamp-6 text-muted-foreground text-sm">{event.description}</Text>
                </div>
              </>
            )}

            {/* Lifecycle actions */}
            <Separator />
            <div>
              <Text className="mb-3 font-medium text-sm">
                <Trans>Actions</Trans>
              </Text>
              <div className="flex flex-wrap gap-2">
                {event.status === "Planned" && (
                  <Button
                    variant="secondary"
                    disabled={anyPending}
                    onPress={() => startMutation.mutate(pathParams)}
                  >
                    <PlayIcon className="mr-1.5 h-3.5 w-3.5" />
                    <Trans>Start</Trans>
                  </Button>
                )}
                {event.status === "InProgress" && (
                  <Button
                    variant="secondary"
                    disabled={anyPending}
                    onPress={() => completeMutation.mutate(pathParams)}
                  >
                    <CheckCircle2Icon className="mr-1.5 h-3.5 w-3.5" />
                    <Trans>Complete</Trans>
                  </Button>
                )}
                {(event.status === "Planned" || event.status === "InProgress") && (
                  <Button
                    variant="secondary"
                    disabled={anyPending}
                    onPress={() => cancelMutation.mutate(pathParams)}
                  >
                    <BanIcon className="mr-1.5 h-3.5 w-3.5" />
                    <Trans>Cancel</Trans>
                  </Button>
                )}
                {event.status === "Planned" && (
                  <Button
                    variant="destructive"
                    disabled={anyPending}
                    onPress={() => deleteMutation.mutate(pathParams)}
                  >
                    <Trash2Icon className="mr-1.5 h-3.5 w-3.5" />
                    <Trans>Delete</Trans>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Text className="text-muted-foreground">
            <Trans>Event not found.</Trans>
          </Text>
        )}
      </SidePaneBody>
    </SidePane>
  );
}

function DetailField({ label, value }: Readonly<{ label: string; value: string | number }>) {
  return (
    <div>
      <Text className="text-muted-foreground text-xs">{label}</Text>
      <Text className="font-medium text-sm">{String(value)}</Text>
    </div>
  );
}
