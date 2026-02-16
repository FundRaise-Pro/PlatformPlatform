import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Card } from "@repo/ui/components/Card";
import { Heading } from "@repo/ui/components/Heading";
import { Separator } from "@repo/ui/components/Separator";
import { Text } from "@repo/ui/components/Text";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckIcon } from "lucide-react";
import { toast } from "sonner";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";

export const Route = createFileRoute("/$slug/fundraiser/subscription")({
  component: SubscriptionPage
});

type PlanInfo = {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
};

const plans: PlanInfo[] = [
  {
    name: "Free",
    price: "$0",
    features: ["1 campaign", "1 form", "5 blog posts", "1 branch", "100 MB storage"]
  },
  {
    name: "Starter",
    price: "$29",
    features: ["5 campaigns", "3 forms", "25 blog posts", "3 branches", "1 GB storage"]
  },
  {
    name: "Pro",
    price: "$99",
    highlighted: true,
    features: [
      "Unlimited campaigns",
      "Unlimited forms",
      "Unlimited blog posts",
      "10 branches",
      "Custom domain",
      "10 GB storage"
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Everything in Pro",
      "Unlimited branches",
      "Custom CSS",
      "Custom domain",
      "99.95% SLA",
      "Unlimited storage"
    ]
  }
];

export default function SubscriptionPage() {
  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Subscription` }]} />}
        title={t`Subscription`}
        subtitle={t`Manage your plan and billing.`}
      >
        <div className="mb-8 rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-muted-foreground text-sm">
                <Trans>Current plan</Trans>
              </Text>
              <Heading level={3} className="text-xl font-bold">
                <Trans>Free</Trans>
              </Heading>
            </div>
            <Badge variant="success">
              <Trans>Active</Trans>
            </Badge>
          </div>
        </div>

        <Heading level={3} className="mb-4 text-lg font-semibold">
          <Trans>Available plans</Trans>
        </Heading>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        <Separator className="my-8" />

        <DonorSubscriptions />
      </AppLayout>
    </>
  );
}

function PlanCard({ plan }: Readonly<{ plan: PlanInfo }>) {
  return (
    <div
      className={`flex flex-col rounded-lg border p-6 ${
        plan.highlighted ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      <Heading level={4} className="font-semibold">
        {plan.name}
      </Heading>
      <div className="mt-2 mb-4">
        <span className="font-bold text-3xl">{plan.price}</span>
        {plan.price !== "Custom" && <span className="text-muted-foreground text-sm">/mo</span>}
      </div>

      <div className="mb-6 flex flex-col gap-2">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 text-primary" />
            <Text className="text-sm">{feature}</Text>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <Button variant={plan.highlighted ? "primary" : "secondary"} className="w-full" onPress={() => {}}>
          {plan.price === "Custom" ? <Trans>Contact us</Trans> : <Trans>Upgrade</Trans>}
        </Button>
      </div>
    </div>
  );
}

function statusVariant(status: string) {
  switch (status) {
    case "Active":
      return "success";
    case "Cancelled":
    case "Expired":
      return "destructive";
    case "Paused":
      return "secondary";
    default:
      return "outline";
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);
}

function DonorSubscriptions() {
  const { data: subscriptions, isLoading } = api.useQuery("get", "/api/fundraiser/donations/subscriptions");
  const queryClient = useQueryClient();

  const cancelMutation = api.useMutation("delete", "/api/fundraiser/donations/subscriptions/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/api/fundraiser/donations/subscriptions"] });
      toast.success(t`Success`, { description: t`Subscription cancelled.` });
    }
  });

  return (
    <div>
      <Heading level={3} className="mb-2 text-lg font-semibold">
        <Trans>Donor subscriptions</Trans>
      </Heading>
      <Text className="mb-4 text-muted-foreground">
        <Trans>Recurring donation subscriptions from supporters.</Trans>
      </Text>

      {isLoading ? (
        <Text className="text-muted-foreground">
          <Trans>Loading subscriptions...</Trans>
        </Text>
      ) : subscriptions && subscriptions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => (
            <Card key={String(sub.id)} className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <Text className="font-medium">{sub.itemName}</Text>
                <Badge variant={statusVariant(sub.status)}>{sub.status}</Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-2xl">{formatCurrency(sub.recurringAmount)}</span>
                <span className="text-muted-foreground text-sm">/{sub.frequency === 6 ? t`month` : sub.frequency === 4 ? t`quarter` : t`year`}</span>
              </div>
              <Text className="text-muted-foreground text-sm">
                {sub.nextRunDate ? `${t`Next:`} ${new Date(sub.nextRunDate).toLocaleDateString()}` : t`No upcoming charge`}
              </Text>
              {sub.status === "Active" && (
                <Button
                  variant="secondary"
                  className="mt-auto"
                  onPress={() => cancelMutation.mutate({ params: { path: { id: String(sub.id) } } })}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? <Trans>Cancelling...</Trans> : <Trans>Cancel subscription</Trans>}
                </Button>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border py-8 text-center">
          <Text className="text-muted-foreground">
            <Trans>No active donor subscriptions.</Trans>
          </Text>
        </div>
      )}
    </div>
  );
}
