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

export const Route = createFileRoute("/$slug/fundraiser/qrcodes")({
  component: QRCodesPage
});

export default function QRCodesPage() {
  const { data: qrCodes, isLoading } = api.useQuery("get", "/api/fundraiser/qrcodes");

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`QR codes` }]} />}
        title={t`QR codes`}
        subtitle={t`Generate and track QR codes for campaigns and events.`}
      >
        <div className="mb-4 flex items-center justify-between">
          <Text className="text-muted-foreground">{qrCodes ? t`${qrCodes.length} QR codes` : t`Loading...`}</Text>
          <Button onPress={() => {}}>
            <PlusIcon className="mr-2 h-4 w-4" />
            <Trans>Generate QR code</Trans>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Text className="text-muted-foreground">
              <Trans>Loading QR codes...</Trans>
            </Text>
          </div>
        ) : qrCodes && qrCodes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {qrCodes.map((qrCode) => (
              <div key={String(qrCode.id)} className="rounded-lg border border-border p-4">
                <Text className="font-medium">{qrCode.name}</Text>
                <Text className="mt-1 text-muted-foreground text-sm">
                  {qrCode.hitCount !== undefined ? t`${String(qrCode.hitCount)} scans` : t`No scans yet`}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <Text className="mb-2 text-muted-foreground">
              <Trans>No QR codes yet</Trans>
            </Text>
            <Text className="text-muted-foreground text-sm">
              <Trans>Generate QR codes to track campaign engagement.</Trans>
            </Text>
          </div>
        )}
      </AppLayout>
    </>
  );
}
