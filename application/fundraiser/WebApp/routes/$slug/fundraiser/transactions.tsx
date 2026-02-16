import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { tenantPath } from "@repo/infrastructure/auth/constants";
import { useUserInfo } from "@repo/infrastructure/auth/hooks";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";
import { TransactionDetailPane } from "./-components/TransactionDetailPane";

export const Route = createFileRoute("/$slug/fundraiser/transactions")({
  component: TransactionsPage
});

function statusVariant(status: string) {
  switch (status) {
    case "Success":
      return "success";
    case "Failed":
    case "Cancelled":
      return "destructive";
    case "Processing":
      return "info";
    case "Refunded":
      return "neutral";
    case "ManualReview":
      return "secondary";
    default:
      return "outline";
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);
}

export default function TransactionsPage() {
  const { data: transactions, isLoading } = api.useQuery("get", "/api/fundraiser/donations/transactions");
  const slug = useUserInfo()?.tenantSlug;
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Transactions` }]} />}
        title={t`Transactions`}
        subtitle={t`View and track all payment transactions.`}
      >
        <div className="mb-4 flex justify-end">
          <Button variant="primary" onPress={() => navigate({ to: "/$slug/fundraiser/donate", params: { slug: slug ?? "" } })}>
            <PlusIcon className="mr-1.5 h-4 w-4" />
            <Trans>New payment</Trans>
          </Button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Text className="text-muted-foreground">
              <Trans>Loading transactions...</Trans>
            </Text>
          </div>
        ) : transactions && transactions.length > 0 ? (
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
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground text-sm">
                    <Trans>Amount</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Status</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Date</Trans>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground text-sm" />
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={String(tx.id)}
                    className="cursor-pointer border-border border-b last:border-b-0 hover:bg-hover-background"
                    onClick={() => setSelectedId(String(tx.id))}
                  >
                    <td className="px-4 py-3 font-medium">{tx.name}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{tx.type}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(tx.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(tx.status)}>{tx.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {tx.completedAt ? new Date(tx.completedAt).toLocaleDateString() : new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ArrowRightIcon className="inline h-4 w-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <Text className="mb-2 text-muted-foreground">
              <Trans>No transactions yet</Trans>
            </Text>
            <Text className="text-muted-foreground text-sm">
              <Trans>Transactions will appear here once payments are processed.</Trans>
            </Text>
          </div>
        )}
      </AppLayout>

      {selectedId && (
        <TransactionDetailPane
          transactionId={selectedId}
          isOpen={!!selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
