import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { ClipboardListIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { ApplicationDetailPane } from "./-components/ApplicationDetailPane";
import { CreateApplicationDialog } from "./-components/CreateApplicationDialog";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";

export const Route = createFileRoute("/$slug/fundraiser/applications")({
  component: ApplicationsPage
});

function applicationStatusVariant(status: string) {
  switch (status) {
    case "Incomplete": return "neutral";
    case "Submitted": return "info";
    case "Reviewed": return "secondary";
    case "Approved": return "success";
    case "RequiresInfo": return "outline";
    case "Denied": return "destructive";
    case "Paid": return "success";
    default: return "outline";
  }
}

export default function ApplicationsPage() {
  const { data: applications, isLoading } = api.useQuery("get", "/api/fundraiser/applications");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Applications` }]} />}
        title={t`Applications`}
        subtitle={t`Review and manage beneficiary applications.`}
        sidePane={
          selectedId ? (
            <ApplicationDetailPane
              applicationId={selectedId}
              isOpen={!!selectedId}
              onClose={() => setSelectedId(null)}
            />
          ) : undefined
        }
      >
        <div className="mb-4 flex items-center justify-between">
          <Text className="text-muted-foreground">
            {applications ? t`${applications.length} applications` : t`Loading...`}
          </Text>
          <Button onPress={() => setIsCreateOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            <Trans>New application</Trans>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Text className="text-muted-foreground">
              <Trans>Loading applications...</Trans>
            </Text>
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead className="border-border border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Campaign</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Status</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Priority</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Submitted</Trans>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground text-sm">
                    <Trans>Reviews</Trans>
                  </th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr
                    key={String(application.id)}
                    className="cursor-pointer border-border border-b last:border-b-0 hover:bg-hover-background"
                    onClick={() => setSelectedId(String(application.id))}
                  >
                    <td className="px-4 py-3 font-medium">{String(application.campaignId)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={applicationStatusVariant(application.status)}>
                        {application.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{application.priority}/10</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {application.submittedAt ? new Date(String(application.submittedAt)).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {application.reviewsCompletedCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <ClipboardListIcon className="mb-3 h-8 w-8 text-muted-foreground" />
            <Text className="mb-2 text-muted-foreground">
              <Trans>No applications yet</Trans>
            </Text>
            <Text className="text-muted-foreground text-sm">
              <Trans>Applications will appear here once beneficiaries submit forms.</Trans>
            </Text>
          </div>
        )}

        <CreateApplicationDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      </AppLayout>
    </>
  );
}
