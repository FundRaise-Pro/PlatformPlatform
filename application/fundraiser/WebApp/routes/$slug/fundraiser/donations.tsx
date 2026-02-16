import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Badge } from "@repo/ui/components/Badge";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";

export const Route = createFileRoute("/$slug/fundraiser/donations")({
  component: DonationsPage
});

export default function DonationsPage() {
  const { data: donations, isLoading } = api.useQuery("get", "/api/fundraiser/donations");

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Donations` }]} />}
        title={t`Donations`}
        subtitle={t`View and manage donations and transactions.`}
      >
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
                    <Trans>Donor</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Date</Trans>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground text-sm">
                    <Trans>Transaction</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Type</Trans>
                  </th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr
                    key={String(donation.id)}
                    className="border-border border-b last:border-b-0 hover:bg-hover-background"
                  >
                    <td className="px-4 py-3 font-medium">
                      {donation.isAnonymous ? t`Anonymous` : donation.transactionId}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {donation.donatedAt ? new Date(donation.donatedAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{donation.transactionId}</td>
                    <td className="px-4 py-3">
                      <Badge variant={donation.isRecurring ? "info" : "success"}>
                        {donation.isRecurring ? t`Recurring` : t`One-time`}
                      </Badge>
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
              <Trans>Donations will appear here once campaigns start receiving contributions.</Trans>
            </Text>
          </div>
        )}
      </AppLayout>
    </>
  );
}
