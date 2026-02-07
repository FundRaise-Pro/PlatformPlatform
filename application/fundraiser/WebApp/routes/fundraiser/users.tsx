import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Button } from "@repo/ui/components/Button";
import { Text } from "@repo/ui/components/Text";
import { createFileRoute } from "@tanstack/react-router";
import { FundraiserSideMenu } from "@/shared/components/FundraiserSideMenu";
import { TopMenu } from "@/shared/components/topMenu";
import { api } from "@/shared/lib/api/client";

export const Route = createFileRoute("/fundraiser/users")({
  component: UsersPage
});

export default function UsersPage() {
  const { data: users, isLoading } = api.useQuery("get", "/api/fundraiser/tenant-users");

  return (
    <>
      <FundraiserSideMenu />
      <AppLayout
        topMenu={<TopMenu breadcrumbs={[{ label: t`Users` }]} />}
        title={t`Team members`}
        subtitle={t`Manage users and their roles within your organization.`}
      >
        <div className="mb-4 flex items-center justify-end">
          <Button onPress={() => {}}>
            <Trans>Invite user</Trans>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Text className="text-muted-foreground">
              <Trans>Loading users...</Trans>
            </Text>
          </div>
        ) : users && users.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead className="border-border border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Name</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Email</Trans>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
                    <Trans>Roles</Trans>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={String(user.id)} className="border-border border-b last:border-b-0 hover:bg-hover-background">
                    <td className="px-4 py-3 font-medium">
                      {user.displayName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.userId}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.roles.map((r) => r.role).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <Text className="mb-2 text-muted-foreground">
              <Trans>No team members yet</Trans>
            </Text>
            <Text className="text-muted-foreground text-sm">
              <Trans>Invite team members to help manage your organization.</Trans>
            </Text>
          </div>
        )}
      </AppLayout>
    </>
  );
}
