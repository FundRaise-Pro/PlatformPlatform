import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";
import { RecordDonationDialog } from "./-components/RecordDonationDialog";

export const Route = createFileRoute("/$slug/fundraiser/donations")({
  component: DonationsPage
});

export default function DonationsPage() {
  const { data: donations, isLoading } = api.useQuery("get", "/api/fundraiser/donations");
  const [showRecordDialog, setShowRecordDialog] = useState(false);

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Donations` }]} />}
        title={t`Donations`}
        subtitle={t`View and record donations from your supporters.`}
      >
        <div className="mb-4 flex justify-end">
          <Button variant="primary" onPress={() => setShowRecordDialog(true)}>
            <PlusIcon className="mr-1.5 h-4 w-4" />
            <Trans>Record donation</Trans>
          </Button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Text className="text-muted-foreground">
              <Trans>Loading donations...</Trans>
            </Text>
          </div>
        ) : donations && donations.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead className="border-border border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Donation ID</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Transaction</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Date</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Type</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Donor</Trans>
                  </th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr
                    key={String(donation.id)}
                    className="border-border border-b last:border-b-0 hover:bg-hover-background"
                  >
                    <td className="px-4 py-3 font-mono text-sm">{String(donation.id).slice(0, 12)}...</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground text-sm">
                      {String(donation.transactionId).slice(0, 12)}...
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {donation.donatedAt ? new Date(donation.donatedAt).toLocaleDateString() : new Date(donation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={donation.isRecurring ? "info" : "success"}>
                        {donation.isRecurring ? t`Recurring` : t`One-time`}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {donation.isAnonymous ? t`Anonymous` : t`Named`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <Text className="mb-2 text-muted-foreground">
              <Trans>No donations yet</Trans>
            </Text>
            <Text className="text-muted-foreground text-sm">
              <Trans>Donations will appear here once supporters contribute to your campaigns.</Trans>
            </Text>
          </div>
        )}
      </AppLayout>

      <RecordDonationDialog
        isOpen={showRecordDialog}
        onClose={() => setShowRecordDialog(false)}
      />
    </>
  );
}
