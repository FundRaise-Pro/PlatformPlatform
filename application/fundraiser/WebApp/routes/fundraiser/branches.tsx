import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Button } from "@repo/ui/components/Button";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";

export const Route = createFileRoute("/fundraiser/branches")({
  component: BranchesPage
});

export default function BranchesPage() {
  const { data: branches, isLoading } = api.useQuery("get", "/api/fundraiser/branches");

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Branches` }]} />}
        title={t`Branches`}
        subtitle={t`Manage your organization's locations and branches.`}
      >
        <div className="mb-4 flex items-center justify-between">
          <Text className="text-muted-foreground">
            {branches ? t`${branches.length} branches` : t`Loading...`}
          </Text>
          <Button onPress={() => {}}>
            <PlusIcon className="mr-2 h-4 w-4" />
            <Trans>Add branch</Trans>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Text className="text-muted-foreground">
              <Trans>Loading branches...</Trans>
            </Text>
          </div>
        ) : branches && branches.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch) => (
              <div key={String(branch.id)} className="rounded-lg border border-border p-4">
                <Text className="font-medium">{branch.name}</Text>
                <Text className="mt-1 text-muted-foreground text-sm">
                  {[branch.city, branch.state, branch.postalCode].filter(Boolean).join(", ")}
                </Text>
                <Text className="mt-1 text-muted-foreground text-sm">
                  {t`${String(branch.serviceCount)} services`}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <Text className="mb-2 text-muted-foreground">
              <Trans>No branches yet</Trans>
            </Text>
            <Text className="text-muted-foreground text-sm">
              <Trans>Add your first branch or location.</Trans>
            </Text>
          </div>
        )}
      </AppLayout>
    </>
  );
}
