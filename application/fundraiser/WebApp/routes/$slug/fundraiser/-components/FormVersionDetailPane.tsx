import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Separator } from "@repo/ui/components/Separator";
import { SidePane, SidePaneBody, SidePaneHeader } from "@repo/ui/components/SidePane";
import { Text } from "@repo/ui/components/Text";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2Icon, FileTextIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/shared/lib/api/client";

type FormVersionDetailPaneProps = Readonly<{
  formVersionId: string;
  isOpen: boolean;
  onClose: () => void;
}>;

export function FormVersionDetailPane({ formVersionId, isOpen, onClose }: FormVersionDetailPaneProps) {
  const queryClient = useQueryClient();
  const { data: formVersion, isLoading } = api.useQuery("get", "/api/fundraiser/forms/versions/{id}", {
    params: { path: { id: formVersionId } },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/forms/versions"] });
    queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/forms/versions/{id}"] });
  };

  const activateMutation = api.useMutation("post", "/api/fundraiser/forms/versions/{id}/activate", {
    onSuccess: () => {
      invalidate();
      toast.success(t`Form version activated`);
    },
  });

  const anyPending = activateMutation.isPending;
  const pathParams = { params: { path: { id: formVersionId } } };

  return (
    <SidePane isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SidePaneHeader>{formVersion?.name ?? t`Form version`}</SidePaneHeader>
      <SidePaneBody>
        {isLoading ? (
          <Text className="text-muted-foreground"><Trans>Loading...</Trans></Text>
        ) : formVersion ? (
          <div className="flex flex-col gap-6">
            {/* Icon */}
            <div className="flex h-32 items-center justify-center rounded-lg bg-muted">
              <FileTextIcon className="h-10 w-10 text-muted-foreground" />
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <Badge variant={formVersion.isActive ? "success" : "neutral"} className="text-sm">
                {formVersion.isActive ? t`Active` : t`Inactive`}
              </Badge>
              <Text className="text-muted-foreground text-sm">v{formVersion.versionNumber}</Text>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <DetailField label={t`Version`} value={formVersion.versionNumber} />
              <DetailField label={t`Created`} value={new Date(formVersion.createdAt).toLocaleDateString()} />
            </div>

            {/* Description */}
            {formVersion.description && (
              <>
                <Separator />
                <div>
                  <Text className="mb-2 font-medium text-sm"><Trans>Description</Trans></Text>
                  <Text className="text-muted-foreground text-sm">{formVersion.description}</Text>
                </div>
              </>
            )}

            {/* Sections */}
            {formVersion.sections && formVersion.sections.length > 0 && (
              <>
                <Separator />
                <div>
                  <Text className="mb-2 font-medium text-sm"><Trans>Sections</Trans></Text>
                  <div className="flex flex-col gap-3">
                    {formVersion.sections.map((section) => (
                      <div key={section.id} className="rounded-lg border border-border p-3">
                        <div className="mb-1 flex items-center gap-2">
                          {section.icon && <span>{section.icon}</span>}
                          <Text className="font-medium text-sm">{section.title}</Text>
                        </div>
                        {section.description && (
                          <Text className="mb-2 text-muted-foreground text-xs">{section.description}</Text>
                        )}
                        <Text className="text-muted-foreground text-xs">
                          {t`${section.fields.length} fields, ${section.flags.length} flags`}
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
                {!formVersion.isActive && (
                  <Button
                    variant="secondary"
                    disabled={anyPending}
                    onPress={() => activateMutation.mutate(pathParams)}
                  >
                    <CheckCircle2Icon className="mr-1.5 h-3.5 w-3.5" />
                    <Trans>Activate</Trans>
                  </Button>
                )}
                {formVersion.isActive && (
                  <Badge variant="success" className="px-3 py-1.5">
                    <CheckCircle2Icon className="mr-1.5 h-3.5 w-3.5" />
                    <Trans>Currently active</Trans>
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Text className="text-muted-foreground"><Trans>Form version not found.</Trans></Text>
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
