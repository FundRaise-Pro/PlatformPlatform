import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { FileTextIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { CreateFormVersionDialog } from "./-components/CreateFormVersionDialog";
import { FormVersionDetailPane } from "./-components/FormVersionDetailPane";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";

export const Route = createFileRoute("/$slug/fundraiser/forms")({
  component: FormsPage
});

export default function FormsPage() {
  const { data: formVersions, isLoading } = api.useQuery("get", "/api/fundraiser/forms/versions");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Forms` }]} />}
        title={t`Forms`}
        subtitle={t`Design and manage application forms.`}
        sidePane={
          selectedId ? (
            <FormVersionDetailPane
              formVersionId={selectedId}
              isOpen={!!selectedId}
              onClose={() => setSelectedId(null)}
            />
          ) : undefined
        }
      >
        <div className="mb-4 flex items-center justify-between">
          <Text className="text-muted-foreground">
            {formVersions ? t`${formVersions.length} form versions` : t`Loading...`}
          </Text>
          <Button onPress={() => setIsCreateOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            <Trans>New form</Trans>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Text className="text-muted-foreground">
              <Trans>Loading forms...</Trans>
            </Text>
          </div>
        ) : formVersions && formVersions.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead className="border-border border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Form name</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Version</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Status</Trans>
                  </th>
                </tr>
              </thead>
              <tbody>
                {formVersions.map((form) => (
                  <tr
                    key={String(form.id)}
                    className="cursor-pointer border-border border-b last:border-b-0 hover:bg-hover-background"
                    onClick={() => setSelectedId(String(form.id))}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                          <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground">{form.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">v{form.versionNumber}</td>
                    <td className="px-4 py-3">
                      <Badge variant={form.isActive ? "success" : "neutral"}>
                        {form.isActive ? t`Active` : t`Inactive`}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <FileTextIcon className="mb-3 h-8 w-8 text-muted-foreground" />
            <Text className="mb-2 text-muted-foreground">
              <Trans>No forms yet</Trans>
            </Text>
            <Text className="text-muted-foreground text-sm">
              <Trans>Create application forms for beneficiaries to fill out.</Trans>
            </Text>
          </div>
        )}

        <CreateFormVersionDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      </AppLayout>
    </>
  );
}
