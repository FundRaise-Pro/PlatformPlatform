import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Badge } from "@repo/ui/components/Badge";
import { Separator } from "@repo/ui/components/Separator";
import { SidePane, SidePaneBody, SidePaneHeader } from "@repo/ui/components/SidePane";
import { Text } from "@repo/ui/components/Text";
import { CheckCircle2Icon, CircleDotIcon, ClockIcon, XCircleIcon } from "lucide-react";
import { api } from "@/shared/lib/api/client";

type TransactionDetailPaneProps = Readonly<{
  transactionId: string;
  isOpen: boolean;
  onClose: () => void;
}>;

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

function statusIcon(status: string) {
  switch (status) {
    case "Success":
      return <CheckCircle2Icon className="h-4 w-4 text-primary" />;
    case "Failed":
    case "Cancelled":
      return <XCircleIcon className="h-4 w-4 text-destructive" />;
    case "Processing":
      return <CircleDotIcon className="h-4 w-4 text-blue-500" />;
    default:
      return <ClockIcon className="h-4 w-4 text-muted-foreground" />;
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);
}

export function TransactionDetailPane({ transactionId, isOpen, onClose }: TransactionDetailPaneProps) {
  const { data: tx, isLoading } = api.useQuery("get", "/api/fundraiser/donations/transactions/{id}", {
    params: { path: { id: transactionId } }
  });

  return (
    <SidePane isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SidePaneHeader>{tx?.name ?? t`Transaction`}</SidePaneHeader>
      <SidePaneBody>
        {isLoading ? (
          <Text className="text-muted-foreground">
            <Trans>Loading...</Trans>
          </Text>
        ) : tx ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Badge variant={statusVariant(tx.status)} className="text-sm">
                {tx.status}
              </Badge>
              <Text className="text-muted-foreground capitalize">{tx.type}</Text>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DetailField label={t`Amount`} value={formatCurrency(tx.amount)} />
              {tx.amountFee != null && <DetailField label={t`Fee`} value={formatCurrency(tx.amountFee)} />}
              {tx.amountNet != null && <DetailField label={t`Net`} value={formatCurrency(tx.amountNet)} />}
              {tx.paymentMethod && <DetailField label={t`Method`} value={tx.paymentMethod} />}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              {tx.payeeName && <DetailField label={t`Donor`} value={tx.payeeName} />}
              {tx.payeeEmail && <DetailField label={t`Email`} value={tx.payeeEmail} />}
              <DetailField label={t`Provider`} value={tx.paymentProvider} />
              {tx.gatewayPaymentId && <DetailField label={t`Gateway ID`} value={tx.gatewayPaymentId} />}
            </div>

            <Separator />

            <div>
              <Text className="mb-3 font-medium">
                <Trans>Timeline</Trans>
              </Text>
              <div className="flex flex-col gap-0">
                <TimelineEntry
                  icon={<ClockIcon className="h-4 w-4 text-muted-foreground" />}
                  label={t`Created`}
                  timestamp={tx.createdAt}
                  isFirst
                />
                {tx.processingLogs.map((log, i) => (
                  <TimelineEntry
                    key={log.id}
                    icon={statusIcon(log.newStatus)}
                    label={`${log.previousStatus} → ${log.newStatus}`}
                    timestamp={log.createdAt}
                    isLast={i === tx.processingLogs.length - 1 && !tx.completedAt}
                  />
                ))}
                {tx.completedAt && (
                  <TimelineEntry
                    icon={statusIcon(tx.status)}
                    label={t`Completed`}
                    timestamp={tx.completedAt}
                    isLast
                  />
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <DetailField label={t`Created`} value={new Date(tx.createdAt).toLocaleString()} />
              {tx.modifiedAt && <DetailField label={t`Modified`} value={new Date(tx.modifiedAt).toLocaleString()} />}
            </div>
          </div>
        ) : (
          <Text className="text-muted-foreground">
            <Trans>Transaction not found.</Trans>
          </Text>
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

function TimelineEntry({
  icon,
  label,
  timestamp,
  isFirst,
  isLast
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  timestamp: string;
  isFirst?: boolean;
  isLast?: boolean;
}>) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        {!isFirst && <div className="h-3 w-px bg-border" />}
        {icon}
        {!isLast && <div className="h-3 w-px bg-border" />}
      </div>
      <div className="flex flex-1 items-center justify-between pb-1">
        <Text className="text-sm">{label}</Text>
        <Text className="text-muted-foreground text-xs">{new Date(timestamp).toLocaleString()}</Text>
      </div>
    </div>
  );
}
