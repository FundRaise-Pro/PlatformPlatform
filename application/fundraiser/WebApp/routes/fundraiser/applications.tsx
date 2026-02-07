import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Badge } from "@repo/ui/components/Badge";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";

export const Route = createFileRoute("/fundraiser/applications")({
  component: ApplicationsPage
});

export default function ApplicationsPage() {
  const { data: applications, isLoading } = api.useQuery("get", "/api/fundraiser/applications");

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Applications` }]} />}
        title={t`Applications`}
        subtitle={t`Review and manage beneficiary applications.`}
      >
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
                    <Trans>Applicant</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Status</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Submitted</Trans>
                  </th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application: Record<string, unknown>) => (
                  <tr key={String(application.id)} className="border-border border-b last:border-b-0 hover:bg-hover-background">
                    <td className="px-4 py-3 font-medium">
                      {String(application.applicantName ?? application.id ?? "")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{String(application.status ?? t`Pending`)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {application.submittedAt
                        ? new Date(String(application.submittedAt)).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <Text className="mb-2 text-muted-foreground">
              <Trans>No applications yet</Trans>
            </Text>
            <Text className="text-muted-foreground text-sm">
              <Trans>Applications will appear here once beneficiaries submit forms.</Trans>
            </Text>
          </div>
        )}
      </AppLayout>
    </>
  );
}
