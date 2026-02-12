import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Card } from "@repo/ui/components/Card";
import { Heading } from "@repo/ui/components/Heading";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { CheckIcon } from "lucide-react";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";

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
