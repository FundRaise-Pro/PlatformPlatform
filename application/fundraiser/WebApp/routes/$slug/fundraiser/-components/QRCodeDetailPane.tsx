import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Separator } from "@repo/ui/components/Separator";
import { SidePane, SidePaneBody, SidePaneHeader } from "@repo/ui/components/SidePane";
import { Text } from "@repo/ui/components/Text";
import { useQueryClient } from "@tanstack/react-query";
import {
  BanIcon, ExternalLinkIcon, QrCodeIcon,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/shared/lib/api/client";

type QRCodeDetailPaneProps = Readonly<{
  qrCodeId: string;
  isOpen: boolean;
  onClose: () => void;
}>;

export function QRCodeDetailPane({ qrCodeId, isOpen, onClose }: QRCodeDetailPaneProps) {
  const queryClient = useQueryClient();
  const { data: qrCode, isLoading } = api.useQuery("get", "/api/fundraiser/qrcodes/{id}", {
    params: { path: { id: qrCodeId } },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/qrcodes"] });
    queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/qrcodes/{id}"] });
  };

  const deactivateMutation = api.useMutation("post", "/api/fundraiser/qrcodes/{id}/deactivate", {
    onSuccess: () => {
      invalidate();
      toast.success(t`QR code deactivated`);
    },
  });

  const anyPending = deactivateMutation.isPending;
  const pathParams = { params: { path: { id: qrCodeId } } };

  return (
    <SidePane isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SidePaneHeader>{qrCode?.name ?? t`QR code`}</SidePaneHeader>
      <SidePaneBody>
        {isLoading ? (
          <Text className="text-muted-foreground"><Trans>Loading...</Trans></Text>
        ) : qrCode ? (
          <div className="flex flex-col gap-6">
            {/* QR code image */}
            {qrCode.qrCodeImageUrl ? (
              <div className="flex items-center justify-center rounded-lg border border-border p-4">
                <img src={qrCode.qrCodeImageUrl} alt={qrCode.name} className="h-48 w-48" />
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg bg-muted">
                <QrCodeIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            )}

            {/* Status + Type */}
            <div className="flex items-center gap-3">
              <Badge variant={qrCode.isActive ? "success" : "neutral"} className="text-sm">
                {qrCode.isActive ? t`Active` : t`Inactive`}
              </Badge>
              <Badge variant="outline" className="text-sm">{qrCode.qrCodeType}</Badge>
            </div>

            {/* Analytics */}
            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center justify-between">
                <Text className="text-muted-foreground text-sm"><Trans>Total scans</Trans></Text>
                <Text className="font-bold text-2xl">{qrCode.hitCount}</Text>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-1.5">
                <ExternalLinkIcon className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                <div className="min-w-0">
                  <Text className="text-muted-foreground text-xs">{t`Redirect URL`}</Text>
                  <Text className="truncate font-medium text-sm">{qrCode.redirectUrl}</Text>
                </div>
              </div>
              <DetailField label={t`Created`} value={new Date(qrCode.createdAt).toLocaleDateString()} />
              {qrCode.modifiedAt && (
                <DetailField label={t`Modified`} value={new Date(qrCode.modifiedAt).toLocaleDateString()} />
              )}
            </div>

            {/* Recent hits */}
            {qrCode.hits && qrCode.hits.length > 0 && (
              <>
                <Separator />
                <div>
                  <Text className="mb-2 font-medium text-sm"><Trans>Recent scans</Trans></Text>
                  <div className="flex flex-col gap-2">
                    {qrCode.hits.slice(0, 10).map((hit) => (
                      <div key={hit.id} className="flex items-center justify-between rounded border border-border p-2">
                        <Text className="text-muted-foreground text-xs">
                          {new Date(hit.hitAt).toLocaleString()}
                        </Text>
                        {hit.referrer && (
                          <Text className="truncate text-muted-foreground text-xs">{hit.referrer}</Text>
                        )}
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
                {qrCode.isActive && (
                  <Button
                    variant="secondary"
                    disabled={anyPending}
                    onPress={() => deactivateMutation.mutate(pathParams)}
                  >
                    <BanIcon className="mr-1.5 h-3.5 w-3.5" />
                    <Trans>Deactivate</Trans>
                  </Button>
                )}
                {!qrCode.isActive && (
                  <Badge variant="neutral" className="px-3 py-1.5">
                    <Trans>Deactivated</Trans>
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Text className="text-muted-foreground"><Trans>QR code not found.</Trans></Text>
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
