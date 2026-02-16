import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useUserInfo } from "@repo/infrastructure/auth/hooks";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { CampaignDetailPane } from "./-components/CampaignDetailPane";
import { CreateCampaignDialog } from "./-components/CreateCampaignDialog";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";

export const Route = createFileRoute("/$slug/fundraiser/campaigns")({
  component: CampaignsPage
});

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);
}

export default function CampaignsPage() {
  const slug = useUserInfo()?.tenantSlug;
  const { data: campaigns, isLoading } = api.useQuery("get", "/api/fundraiser/campaigns");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Campaigns` }]} />}
        title={t`Campaigns`}
        subtitle={t`Manage your fundraising campaigns.`}
        sidePane={
          selectedCampaignId ? (
            <CampaignDetailPane
              campaignId={selectedCampaignId}
              isOpen={!!selectedCampaignId}
              onClose={() => setSelectedCampaignId(null)}
            />
          ) : undefined
        }
      >
        <div className="mb-4 flex items-center justify-between">
          <Text className="text-muted-foreground">{campaigns ? t`${campaigns.length} campaigns` : t`Loading...`}</Text>
          <Button onPress={() => setIsCreateOpen(true)}>
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
                    <Trans>Stories</Trans>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground text-sm">
                    <Trans>Raised</Trans>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground text-sm">
                    <Trans>Published</Trans>
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr
                    key={String(campaign.id)}
                    className="cursor-pointer border-border border-b last:border-b-0 hover:bg-hover-background"
                    onClick={() => setSelectedCampaignId(String(campaign.id))}
                  >
                    <td className="px-4 py-3">
                      <Text className="font-medium text-foreground">{campaign.title}</Text>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={campaign.status === "Published" ? "success" : "neutral"}>{campaign.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {(campaign.storyCount ?? 0) + (campaign.eventCount ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {formatCurrency(campaign.raisedAmount ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {campaign.publishedAt ? new Date(campaign.publishedAt).toLocaleDateString() : "-"}
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

        <CreateCampaignDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      </AppLayout>
    </>
  );
}
