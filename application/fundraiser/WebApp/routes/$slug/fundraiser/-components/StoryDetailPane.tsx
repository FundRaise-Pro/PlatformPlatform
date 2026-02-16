import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Separator } from "@repo/ui/components/Separator";
import { SidePane, SidePaneBody, SidePaneHeader } from "@repo/ui/components/SidePane";
import { Text } from "@repo/ui/components/Text";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRightIcon, BookHeartIcon, CheckCircle2Icon, ClipboardCheckIcon,
  PackageIcon, PlayIcon, SendIcon, ShieldCheckIcon
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/shared/lib/api/client";

type StoryDetailPaneProps = Readonly<{
  storyId: string;
  isOpen: boolean;
  onClose: () => void;
}>;

function fundraisingStatusVariant(status: string) {
  switch (status) {
    case "Draft": return "neutral";
    case "RequiresScreening": return "secondary";
    case "Approved": return "info";
    case "Raising": return "success";
    case "Funded": return "outline";
    case "Archived": return "neutral";
    default: return "outline";
  }
}

function fulfilmentStatusVariant(status: string) {
  switch (status) {
    case "Pending": return "neutral";
    case "InProgress": return "info";
    case "Fulfilled": return "success";
    default: return "outline";
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);
}

export function StoryDetailPane({ storyId, isOpen, onClose }: StoryDetailPaneProps) {
  const queryClient = useQueryClient();
  const { data: story, isLoading } = api.useQuery("get", "/api/fundraiser/stories/{id}", {
    params: { path: { id: storyId } }
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/stories"] });
    queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/stories/{id}"] });
  };

  const publishMutation = api.useMutation("post", "/api/fundraiser/stories/{id}/publish", {
    onSuccess: () => { invalidate(); toast.success(t`Story published`); }
  });
  const submitScreeningMutation = api.useMutation("post", "/api/fundraiser/stories/{id}/submit-screening", {
    onSuccess: () => { invalidate(); toast.success(t`Submitted for screening`); }
  });
  const approveMutation = api.useMutation("post", "/api/fundraiser/stories/{id}/approve", {
    onSuccess: () => { invalidate(); toast.success(t`Story approved`); }
  });
  const completeFundraisingMutation = api.useMutation("post", "/api/fundraiser/stories/{id}/complete-fundraising", {
    onSuccess: () => { invalidate(); toast.success(t`Fundraising completed`); }
  });
  const markInProgressMutation = api.useMutation("post", "/api/fundraiser/stories/{id}/mark-fulfilment-in-progress", {
    onSuccess: () => { invalidate(); toast.success(t`Marked in progress`); }
  });
  const markFulfilledMutation = api.useMutation("post", "/api/fundraiser/stories/{id}/mark-fulfilled", {
    onSuccess: () => { invalidate(); toast.success(t`Story fulfilled`); }
  });
  const deleteMutation = api.useMutation("delete", "/api/fundraiser/stories/{id}", {
    onSuccess: () => { invalidate(); toast.success(t`Story deleted`); onClose(); }
  });

  const anyPending =
    publishMutation.isPending || submitScreeningMutation.isPending || approveMutation.isPending ||
    completeFundraisingMutation.isPending || markInProgressMutation.isPending ||
    markFulfilledMutation.isPending || deleteMutation.isPending;

  const pathParams = { params: { path: { id: storyId } } };

  return (
    <SidePane isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SidePaneHeader>{story?.title ?? t`Story`}</SidePaneHeader>
      <SidePaneBody>
        {isLoading ? (
          <Text className="text-muted-foreground"><Trans>Loading...</Trans></Text>
        ) : story ? (
          <div className="flex flex-col gap-6">
            {/* Featured image */}
            {story.featuredImageUrl ? (
              <img src={story.featuredImageUrl} alt={story.title} className="h-48 w-full rounded-lg object-cover" />
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg bg-muted">
                <BookHeartIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            )}

            {/* Status badges */}
            <div className="flex items-center gap-3">
              <Badge variant={fundraisingStatusVariant(story.fundraisingStatus)} className="text-sm">
                {story.fundraisingStatus}
              </Badge>
              <Badge variant={fulfilmentStatusVariant(story.fulfilmentStatus)} className="text-sm">
                {story.fulfilmentStatus}
              </Badge>
            </div>

            {/* Funding progress */}
            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center justify-between">
                <Text className="text-muted-foreground text-sm"><Trans>Raised</Trans></Text>
                <Text className="text-muted-foreground text-sm"><Trans>Goal</Trans></Text>
              </div>
              <div className="mb-2 flex items-center justify-between">
                <Text className="font-bold text-lg">{formatCurrency(story.raisedAmount ?? 0)}</Text>
                <Text className="font-medium">{formatCurrency(story.goalAmount)}</Text>
              </div>
              {story.goalAmount > 0 && (
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, ((story.raisedAmount ?? 0) / story.goalAmount) * 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              {story.summary && <DetailField label={t`Summary`} value={story.summary} />}
              {story.campaignId && <DetailField label={t`Campaign`} value={String(story.campaignId)} />}
              {story.publishedAt && <DetailField label={t`Published`} value={new Date(story.publishedAt).toLocaleDateString()} />}
              <DetailField label={t`Created`} value={new Date(story.createdAt).toLocaleDateString()} />
            </div>

            {/* Content excerpt */}
            {story.content && (
              <>
                <Separator />
                <div>
                  <Text className="mb-2 font-medium text-sm"><Trans>Content</Trans></Text>
                  <Text className="line-clamp-6 text-muted-foreground text-sm">{story.content}</Text>
                </div>
              </>
            )}

            {/* Images */}
            {story.images && story.images.length > 0 && (
              <>
                <Separator />
                <div>
                  <Text className="mb-2 font-medium text-sm"><Trans>Images</Trans></Text>
                  <div className="grid grid-cols-3 gap-2">
                    {story.images.map((img) => (
                      <img key={img.id} src={img.blobUrl} alt="" className="h-20 w-full rounded object-cover" />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Updates */}
            {story.updates && story.updates.length > 0 && (
              <>
                <Separator />
                <div>
                  <Text className="mb-2 font-medium text-sm"><Trans>Updates</Trans></Text>
                  <div className="flex flex-col gap-3">
                    {story.updates.map((update) => (
                      <div key={update.id} className="rounded-lg border border-border p-3">
                        <Text className="mb-1 font-medium text-sm">{update.title}</Text>
                        <Text className="text-muted-foreground text-sm">{update.content}</Text>
                        <Text className="mt-1 text-muted-foreground text-xs">
                          {new Date(update.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Lifecycle actions */}
            <Separator />
            <div>
              <Text className="mb-3 font-medium text-sm"><Trans>Actions</Trans></Text>
              <div className="flex flex-wrap gap-2">
                {story.fundraisingStatus === "Draft" && (
                  <Button
                    variant="secondary"
                    disabled={anyPending}
                    onPress={() => publishMutation.mutate(pathParams)}
                  >
                    <PlayIcon className="mr-1.5 h-3.5 w-3.5" />
                    <Trans>Publish</Trans>
                  </Button>
                )}
                {story.fundraisingStatus === "Draft" && (
                  <Button
                    variant="secondary"
                    disabled={anyPending}
                    onPress={() => submitScreeningMutation.mutate(pathParams)}
                  >
                    <SendIcon className="mr-1.5 h-3.5 w-3.5" />
                    <Trans>Submit for screening</Trans>
                  </Button>
                )}
                {story.fundraisingStatus === "RequiresScreening" && (
                  <Button
                    variant="secondary"
                    disabled={anyPending}
                    onPress={() => approveMutation.mutate(pathParams)}
                  >
                    <ShieldCheckIcon className="mr-1.5 h-3.5 w-3.5" />
                    <Trans>Approve</Trans>
                  </Button>
                )}
                {story.fundraisingStatus === "Raising" && (
                  <Button
                    variant="secondary"
                    disabled={anyPending}
                    onPress={() => completeFundraisingMutation.mutate(pathParams)}
                  >
                    <CheckCircle2Icon className="mr-1.5 h-3.5 w-3.5" />
                    <Trans>Complete fundraising</Trans>
                  </Button>
                )}
                {story.fulfilmentStatus === "Pending" && story.fundraisingStatus === "Funded" && (
                  <Button
                    variant="secondary"
                    disabled={anyPending}
                    onPress={() => markInProgressMutation.mutate(pathParams)}
                  >
                    <PackageIcon className="mr-1.5 h-3.5 w-3.5" />
                    <Trans>Mark in progress</Trans>
                  </Button>
                )}
                {story.fulfilmentStatus === "InProgress" && (
                  <Button
                    variant="secondary"
                    disabled={anyPending}
                    onPress={() => markFulfilledMutation.mutate(pathParams)}
                  >
                    <ClipboardCheckIcon className="mr-1.5 h-3.5 w-3.5" />
                    <Trans>Mark fulfilled</Trans>
                  </Button>
                )}
                {story.fundraisingStatus === "Draft" && (
                  <Button
                    variant="destructive"
                    disabled={anyPending}
                    onPress={() => deleteMutation.mutate(pathParams)}
                  >
                    <Trans>Delete</Trans>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Text className="text-muted-foreground"><Trans>Story not found.</Trans></Text>
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
