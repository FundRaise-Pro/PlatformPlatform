import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Separator } from "@repo/ui/components/Separator";
import { SidePane, SidePaneBody, SidePaneHeader } from "@repo/ui/components/SidePane";
import { Text } from "@repo/ui/components/Text";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookHeartIcon,
  CalendarIcon,
  FlagIcon,
  PlayIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/shared/lib/api/client";

type CampaignDetailPaneProps = Readonly<{
  campaignId: string;
  isOpen: boolean;
  onClose: () => void;
}>;

function campaignStatusVariant(status: string) {
  switch (status) {
    case "Draft":
      return "neutral";
    case "RequiresScreening":
      return "secondary";
    case "Approved":
      return "info";
    case "Published":
      return "success";
    case "FundingInProgress":
      return "success";
    case "Fulfilled":
      return "outline";
    case "Archived":
      return "neutral";
    default:
      return "outline";
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);
}

export function CampaignDetailPane({ campaignId, isOpen, onClose }: CampaignDetailPaneProps) {
  const queryClient = useQueryClient();
  const { data: campaign, isLoading } = api.useQuery("get", "/api/fundraiser/campaigns/{id}", {
    params: { path: { id: campaignId } },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/campaigns/{id}"] });
  };

  const publishMutation = api.useMutation("post", "/api/fundraiser/campaigns/{id}/publish", {
    onSuccess: () => {
      invalidate();
      toast.success(t`Campaign published`);
    },
  });
  const deleteMutation = api.useMutation("delete", "/api/fundraiser/campaigns/{id}", {
    onSuccess: () => {
      invalidate();
      toast.success(t`Campaign deleted`);
      onClose();
    },
  });

  const anyPending = publishMutation.isPending || deleteMutation.isPending;
  const pathParams = { params: { path: { id: campaignId } } };

  return (
    <SidePane isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SidePaneHeader>{campaign?.title ?? t`Campaign`}</SidePaneHeader>
      <SidePaneBody>
        {isLoading ? (
          <Text className="text-muted-foreground">
            <Trans>Loading...</Trans>
          </Text>
        ) : campaign ? (
          <div className="flex flex-col gap-6">
            {/* Featured image */}
            {campaign.featuredImageUrl ? (
              <img
                src={campaign.featuredImageUrl}
                alt={campaign.title}
                className="h-48 w-full rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg bg-muted">
                <FlagIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            )}

            {/* Status badge */}
            <div className="flex items-center gap-3">
              <Badge variant={campaignStatusVariant(campaign.status)} className="text-sm">
                {campaign.status}
              </Badge>
            </div>

            {/* Funding progress */}
            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center justify-between">
                <Text className="text-muted-foreground text-sm">
                  <Trans>Raised</Trans>
                </Text>
                <Text className="text-muted-foreground text-sm">
                  <Trans>Goal</Trans>
                </Text>
              </div>
              <div className="mb-2 flex items-center justify-between">
                <Text className="font-bold text-lg">{formatCurrency(campaign.raisedAmount ?? 0)}</Text>
                <Text className="font-medium">{formatCurrency(campaign.goalAmount ?? 0)}</Text>
              </div>
              {(campaign.goalAmount ?? 0) > 0 && (
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(100, ((campaign.raisedAmount ?? 0) / (campaign.goalAmount ?? 1)) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Summary counts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border p-3 text-center">
                <Text className="font-bold text-lg">{campaign.storyCount ?? 0}</Text>
                <Text className="text-muted-foreground text-xs">
                  <Trans>Stories</Trans>
                </Text>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <Text className="font-bold text-lg">{campaign.eventCount ?? 0}</Text>
                <Text className="text-muted-foreground text-xs">
                  <Trans>Events</Trans>
                </Text>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              {campaign.summary && <DetailField label={t`Summary`} value={campaign.summary} />}
              {campaign.publishedAt && (
                <DetailField label={t`Published`} value={new Date(campaign.publishedAt).toLocaleDateString()} />
              )}
              <DetailField label={t`Created`} value={new Date(campaign.createdAt).toLocaleDateString()} />
            </div>

            {/* Content excerpt */}
            {campaign.content && (
              <>
                <Separator />
                <div>
                  <Text className="mb-2 font-medium text-sm">
                    <Trans>Content</Trans>
                  </Text>
                  <Text className="line-clamp-6 text-muted-foreground text-sm">{campaign.content}</Text>
                </div>
              </>
            )}

            {/* Linked Stories */}
            {campaign.linkedStories && campaign.linkedStories.length > 0 && (
              <>
                <Separator />
                <div>
                  <Text className="mb-2 font-medium text-sm">
                    <Trans>Linked Stories</Trans>
                  </Text>
                  <div className="flex flex-col gap-2">
                    {campaign.linkedStories.map((story) => (
                      <div key={String(story.id)} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="flex items-center gap-2">
                          <BookHeartIcon className="h-4 w-4 text-muted-foreground" />
                          <Text className="font-medium text-sm">{story.title}</Text>
                        </div>
                        <div className="flex items-center gap-2">
                          <Text className="text-muted-foreground text-xs">
                            {formatCurrency(story.raisedAmount ?? 0)} / {formatCurrency(story.goalAmount)}
                          </Text>
                          <Badge variant={story.fundraisingStatus === "Raising" ? "success" : "neutral"} className="text-xs">
                            {story.fundraisingStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Linked Events */}
            {campaign.linkedEvents && campaign.linkedEvents.length > 0 && (
              <>
                <Separator />
                <div>
                  <Text className="mb-2 font-medium text-sm">
                    <Trans>Linked Events</Trans>
                  </Text>
                  <div className="flex flex-col gap-2">
                    {campaign.linkedEvents.map((event) => (
                      <div key={String(event.id)} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <Text className="font-medium text-sm">{event.name}</Text>
                            <Text className="text-muted-foreground text-xs">
                              {new Date(event.eventDate).toLocaleDateString()}
                            </Text>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Text className="text-muted-foreground text-xs">
                            {formatCurrency(event.raisedAmount ?? 0)} / {formatCurrency(event.targetAmount)}
                          </Text>
                          <Badge variant={event.status === "InProgress" ? "success" : "neutral"} className="text-xs">
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Tags */}
            {campaign.tags && campaign.tags.length > 0 && (
              <>
                <Separator />
                <div>
                  <Text className="mb-2 font-medium text-sm">
                    <Trans>Tags</Trans>
                  </Text>
                  <div className="flex flex-wrap gap-1">
                    {campaign.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
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
                {campaign.status === "Draft" && (
                  <Button
                    variant="secondary"
                    disabled={anyPending}
                    onPress={() => publishMutation.mutate(pathParams)}
                  >
                    <PlayIcon className="mr-1.5 h-3.5 w-3.5" />
                    <Trans>Publish</Trans>
                  </Button>
                )}
                {campaign.status === "Draft" && (
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
            <Trans>Campaign not found.</Trans>
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
