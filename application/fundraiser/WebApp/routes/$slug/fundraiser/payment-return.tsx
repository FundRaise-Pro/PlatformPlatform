import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { tenantPath } from "@repo/infrastructure/auth/constants";
import { useUserInfo } from "@repo/infrastructure/auth/hooks";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Card } from "@repo/ui/components/Card";
import { Heading } from "@repo/ui/components/Heading";
import { Link } from "@repo/ui/components/Link";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { CheckCircle2Icon, ClockIcon, XCircleIcon } from "lucide-react";
import { useEffect } from "react";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";

export const Route = createFileRoute("/$slug/fundraiser/payment-return")({
  component: PaymentReturnPage,
  validateSearch: (search: Record<string, unknown>) => ({
    txId: (search.txId as string) ?? ""
  })
});

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);
}

export default function PaymentReturnPage() {
  const { txId } = useSearch({ from: "/$slug/fundraiser/payment-return" });
  const slug = useUserInfo()?.tenantSlug;

  const { data: tx, isLoading, refetch } = api.useQuery(
    "get",
    "/api/fundraiser/donations/transactions/{id}",
    { params: { path: { id: txId } } },
    { enabled: !!txId, refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "Success" || status === "Failed" || status === "Cancelled") return false;
      return 3000;
    }}
  );

  useEffect(() => {
    if (txId) refetch();
  }, [txId, refetch]);

  const isTerminal = tx?.status === "Success" || tx?.status === "Failed" || tx?.status === "Cancelled";

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Payment result` }]} />}
        title={t`Payment result`}
      >
        <div className="mx-auto max-w-md">
          {!txId ? (
            <Card className="p-8 text-center">
              <Text className="text-muted-foreground">
                <Trans>No transaction reference found.</Trans>
              </Text>
            </Card>
          ) : isLoading ? (
            <Card className="p-8 text-center">
              <ClockIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <Text className="text-muted-foreground">
                <Trans>Checking payment status...</Trans>
              </Text>
            </Card>
          ) : tx ? (
            <Card className="p-8 text-center">
              {tx.status === "Success" ? (
                <>
                  <CheckCircle2Icon className="mx-auto mb-4 h-16 w-16 text-primary" />
                  <Heading level={2} className="mb-2 text-2xl font-bold">
                    <Trans>Payment successful</Trans>
                  </Heading>
                  <Text className="mb-4 text-muted-foreground">
                    <Trans>Thank you for your donation of {formatCurrency(tx.amount)}.</Trans>
                  </Text>
                </>
              ) : tx.status === "Failed" || tx.status === "Cancelled" ? (
                <>
                  <XCircleIcon className="mx-auto mb-4 h-16 w-16 text-destructive" />
                  <Heading level={2} className="mb-2 text-2xl font-bold">
                    <Trans>Payment {tx.status === "Failed" ? "failed" : "cancelled"}</Trans>
                  </Heading>
                  <Text className="mb-4 text-muted-foreground">
                    <Trans>Your payment could not be completed. No charge was made.</Trans>
                  </Text>
                </>
              ) : (
                <>
                  <ClockIcon className="mx-auto mb-4 h-16 w-16 animate-pulse text-blue-500" />
                  <Heading level={2} className="mb-2 text-2xl font-bold">
                    <Trans>Processing payment</Trans>
                  </Heading>
                  <Text className="mb-4 text-muted-foreground">
                    <Trans>Your payment is being processed. This page will update automatically.</Trans>
                  </Text>
                </>
              )}

              <Badge variant={tx.status === "Success" ? "success" : tx.status === "Failed" ? "destructive" : "info"} className="mb-6">
                {tx.status}
              </Badge>

              {isTerminal && (
                <div className="mt-6 flex justify-center gap-3">
                  <Link href={tenantPath(slug, "fundraiser", "transactions")} variant="ghost">
                    <Button variant="secondary">
                      <Trans>View transactions</Trans>
                    </Button>
                  </Link>
                  <Link href={tenantPath(slug, "fundraiser")} variant="ghost">
                    <Button variant="primary">
                      <Trans>Back to dashboard</Trans>
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <Text className="text-muted-foreground">
                <Trans>Transaction not found.</Trans>
              </Text>
            </Card>
          )}
        </div>
      </AppLayout>
    </>
  );
}
