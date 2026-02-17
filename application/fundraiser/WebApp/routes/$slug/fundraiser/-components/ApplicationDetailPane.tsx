import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Separator } from "@repo/ui/components/Separator";
import { SidePane, SidePaneBody, SidePaneHeader } from "@repo/ui/components/SidePane";
import { Text } from "@repo/ui/components/Text";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2Icon, ClipboardListIcon, SendIcon,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/shared/lib/api/client";

type ApplicationDetailPaneProps = Readonly<{
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
}>;

function applicationStatusVariant(status: string) {
  switch (status) {
    case "Incomplete": return "neutral";
    case "Submitted": return "info";
    case "Reviewed": return "secondary";
    case "Approved": return "success";
    case "RequiresInfo": return "outline";
    case "Denied": return "destructive";
    case "Paid": return "success";
    default: return "outline";
  }
}

function reviewDecisionVariant(decision: string) {
  switch (decision) {
    case "Approve": return "success";
    case "Reject": return "destructive";
    case "NeedsMoreInfo": return "outline";
    case "Pending": return "neutral";
    default: return "neutral";
  }
}

export function ApplicationDetailPane({ applicationId, isOpen, onClose }: ApplicationDetailPaneProps) {
  const queryClient = useQueryClient();
  const { data: application, isLoading } = api.useQuery("get", "/api/fundraiser/applications/{id}", {
    params: { path: { id: applicationId } },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/applications"] });
    queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/applications/{id}"] });
  };

  const submitMutation = api.useMutation("post", "/api/fundraiser/applications/{id}/submit", {
    onSuccess: () => {
      invalidate();
      toast.success(t`Application submitted`);
    },
  });

  const anyPending = submitMutation.isPending;
  const pathParams = { params: { path: { id: applicationId } } };

  return (
    <SidePane isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SidePaneHeader>{t`Application`}</SidePaneHeader>
      <SidePaneBody>
        {isLoading ? (
          <Text className="text-muted-foreground"><Trans>Loading...</Trans></Text>
        ) : application ? (
          <div className="flex flex-col gap-6">
            {/* Icon */}
            <div className="flex h-32 items-center justify-center rounded-lg bg-muted">
              <ClipboardListIcon className="h-10 w-10 text-muted-foreground" />
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <Badge variant={applicationStatusVariant(application.status)} className="text-sm">
                {application.status}
              </Badge>
              {application.requiresEscalation && (
                <Badge variant="destructive" className="text-sm"><Trans>Escalation required</Trans></Badge>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <DetailField label={t`Campaign`} value={String(application.campaignId)} />
              <DetailField label={t`Priority`} value={`${application.priority}/10`} />
              <DetailField label={t`Reviews`} value={`${application.reviewsCompletedCount} completed`} />
              {application.submittedAt && (
                <DetailField label={t`Submitted`} value={new Date(String(application.submittedAt)).toLocaleDateString()} />
              )}
              {application.reviewedAt && (
                <DetailField label={t`Reviewed`} value={new Date(String(application.reviewedAt)).toLocaleDateString()} />
              )}
              <DetailField label={t`Created`} value={new Date(application.createdAt).toLocaleDateString()} />
            </div>

            {/* Notes */}
            {application.internalNotes && (
              <>
                <Separator />
                <div>
                  <Text className="mb-2 font-medium text-sm"><Trans>Internal notes</Trans></Text>
                  <Text className="text-muted-foreground text-sm">{application.internalNotes}</Text>
                </div>
              </>
            )}

            {/* Field data */}
            {application.fieldData && application.fieldData.length > 0 && (
              <>
                <Separator />
                <div>
                  <Text className="mb-2 font-medium text-sm"><Trans>Form data</Trans></Text>
                  <div className="flex flex-col gap-2">
                    {application.fieldData.map((field) => (
                      <div key={field.id} className="flex items-start justify-between rounded border border-border p-2">
                        <Text className="font-medium text-xs">{field.fieldName}</Text>
                        <Text className="text-muted-foreground text-xs">{field.fieldValue ?? "-"}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Reviews */}
            {application.reviews && application.reviews.length > 0 && (
              <>
                <Separator />
                <div>
                  <Text className="mb-2 font-medium text-sm"><Trans>Reviews</Trans></Text>
                  <div className="flex flex-col gap-3">
                    {application.reviews.map((review) => (
                      <div key={review.id} className="rounded-lg border border-border p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <Text className="font-medium text-sm">{review.reviewType}</Text>
                          <Badge variant={reviewDecisionVariant(review.decision)} className="text-xs">
                            {review.decision}
                          </Badge>
                        </div>
                        <Text className="text-muted-foreground text-xs">{review.notes}</Text>
                        <Text className="mt-1 text-muted-foreground text-xs">
                          {new Date(review.reviewedAt).toLocaleDateString()} · {t`Score: ${review.priorityScore}/10`}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <Separator />
            <div>
              <Text className="mb-3 font-medium text-sm"><Trans>Actions</Trans></Text>
              <div className="flex flex-wrap gap-2">
                {application.isMutable && (
                  <Button
                    variant="secondary"
                    disabled={anyPending}
                    onPress={() => submitMutation.mutate(pathParams)}
                  >
                    <SendIcon className="mr-1.5 h-3.5 w-3.5" />
                    <Trans>Submit</Trans>
                  </Button>
                )}
                {application.status === "Submitted" && (
                  <Badge variant="info" className="px-3 py-1.5">
                    <CheckCircle2Icon className="mr-1.5 h-3.5 w-3.5" />
                    <Trans>Awaiting review</Trans>
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Text className="text-muted-foreground"><Trans>Application not found.</Trans></Text>
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
