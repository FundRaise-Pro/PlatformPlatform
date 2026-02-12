import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/Tabs";
import { Link, useParams } from "@tanstack/react-router";

type UserTabNavigationProps = {
  activeTab: "all-users" | "recycle-bin";
};

export function UserTabNavigation({ activeTab }: UserTabNavigationProps) {
  const { slug } = useParams({ strict: false });
  return (
    <Tabs value={activeTab} className="relative z-10 mb-4 sm:mb-8">
      <TabsList aria-label={t`User tabs`}>
        <TabsTrigger
          value="all-users"
          nativeButton={false}
          render={<Link to="/$slug/admin/users" params={{ slug: slug ?? "" }} />}
        >
          <Trans>All users</Trans>
        </TabsTrigger>
        <TabsTrigger
          value="recycle-bin"
          nativeButton={false}
          render={<Link to="/$slug/admin/users/recycle-bin" params={{ slug: slug ?? "" }} />}
        >
          <Trans>Recycle bin</Trans>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
