import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon, QrCodeIcon } from "lucide-react";
import { useState } from "react";
import { CreateQRCodeDialog } from "./-components/CreateQRCodeDialog";
import { QRCodeDetailPane } from "./-components/QRCodeDetailPane";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";

export const Route = createFileRoute("/$slug/fundraiser/qr-codes")({
  component: QRCodesPage
});

export default function QRCodesPage() {
  const { data: qrCodes, isLoading } = api.useQuery("get", "/api/fundraiser/qrcodes");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`QR Codes` }]} />}
        title={t`QR Codes`}
        subtitle={t`Create and track QR codes for campaigns and events.`}
        sidePane={
          selectedId ? (
            <QRCodeDetailPane
              qrCodeId={selectedId}
              isOpen={!!selectedId}
              onClose={() => setSelectedId(null)}
            />
          ) : undefined
        }
      >
        <div className="mb-4 flex items-center justify-between">
          <Text className="text-muted-foreground">
            {qrCodes ? t`${qrCodes.length} QR codes` : t`Loading...`}
          </Text>
          <Button onPress={() => setIsCreateOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            <Trans>Create QR code</Trans>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Text className="text-muted-foreground"><Trans>Loading QR codes...</Trans></Text>
          </div>
        ) : qrCodes && qrCodes.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead className="border-border border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Name</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Type</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Status</Trans>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground text-sm">
                    <Trans>Scans</Trans>
                  </th>
                </tr>
              </thead>
              <tbody>
                {qrCodes.map((qrCode) => (
                  <tr
                    key={String(qrCode.id)}
                    className="cursor-pointer border-border border-b last:border-b-0 hover:bg-hover-background"
                    onClick={() => setSelectedId(String(qrCode.id))}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                          <QrCodeIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <Text className="font-medium text-foreground">{qrCode.name}</Text>
                          <Text className="line-clamp-1 text-muted-foreground text-xs">{qrCode.redirectUrl}</Text>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{qrCode.qrCodeType}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={qrCode.isActive ? "success" : "neutral"}>
                        {qrCode.isActive ? t`Active` : t`Inactive`}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {qrCode.hitCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <QrCodeIcon className="mb-3 h-8 w-8 text-muted-foreground" />
            <Text className="mb-2 text-muted-foreground"><Trans>No QR codes yet</Trans></Text>
            <Text className="text-muted-foreground text-sm">
              <Trans>Create QR codes to drive engagement for your campaigns.</Trans>
            </Text>
          </div>
        )}

        <CreateQRCodeDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      </AppLayout>
    </>
  );
}
