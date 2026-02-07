import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Table } from "@repo/ui/components/Table";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";

export const Route = createFileRoute("/fundraiser/campaigns")({
  component: CampaignsPage
});

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = api.useQuery("get", "/api/fundraiser/campaigns");

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Campaigns` }]} />}
        title={t`Campaigns`}
        subtitle={t`Manage your fundraising campaigns.`}
      >
        <div className="mb-4 flex items-center justify-between">
          <Text className="text-muted-foreground">
            {campaigns ? t`${campaigns.length} campaigns` : t`Loading...`}
          </Text>
          <Button onPress={() => window.location.href = "/fundraiser/campaigns"}>
            <PlusIcon className="mr-2 h-4 w-4" />
            <Trans>Create campaign</Trans>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Text className="text-muted-foreground">
              <Trans>Loading campaigns...</Trans>
            </Text>
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead className="border-border border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Name</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Status</Trans>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground text-sm">
                    <Trans>Goal</Trans>
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign: Record<string, unknown>) => (
                  <tr key={String(campaign.id)} className="border-border border-b last:border-b-0 hover:bg-hover-background">
                    <td className="px-4 py-3">
                      <a href={`/fundraiser/campaigns/${campaign.id}`} className="font-medium text-foreground hover:underline">
                        {String(campaign.title ?? campaign.name ?? "")}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={campaign.isPublished ? "success" : "default"}>
                        {campaign.isPublished ? t`Published` : t`Draft`}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {campaign.goalAmount ? `$${Number(campaign.goalAmount).toLocaleString()}` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <Text className="mb-2 text-muted-foreground">
              <Trans>No campaigns yet</Trans>
            </Text>
            <Text className="text-muted-foreground text-sm">
              <Trans>Create your first fundraising campaign to get started.</Trans>
            </Text>
          </div>
        )}
      </AppLayout>
    </>
  );
}
