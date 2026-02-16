import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { tenantPath } from "@repo/infrastructure/auth/constants";
import { useUserInfo } from "@repo/infrastructure/auth/hooks";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";

export const Route = createFileRoute("/$slug/fundraiser/campaigns")({
  component: CampaignsPage
});

export default function CampaignsPage() {
  const slug = useUserInfo()?.tenantSlug;
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
          <Text className="text-muted-foreground">{campaigns ? t`${campaigns.length} campaigns` : t`Loading...`}</Text>
          <Button onPress={() => (window.location.href = tenantPath(slug, "fundraiser", "campaigns"))}>
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
                    <Trans>Published</Trans>
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr
                    key={String(campaign.id)}
                    className="border-border border-b last:border-b-0 hover:bg-hover-background"
                  >
                    <td className="px-4 py-3">
                      <a
                        href={tenantPath(slug, "fundraiser", `campaigns/${campaign.id}`)}
                        className="font-medium text-foreground hover:underline"
                      >
                        {campaign.title}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={campaign.status === "Published" ? "success" : "neutral"}>{campaign.status}</Badge>
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
      </AppLayout>
    </>
  );
}
