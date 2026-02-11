import { Trans } from "@lingui/react/macro";
import { Link, useParams } from "@tanstack/react-router";

type UserTabNavigationProps = {
  activeTab: "all-users" | "recycle-bin";
};

export function UserTabNavigation({ activeTab }: UserTabNavigationProps) {
  const { slug } = useParams({ strict: false });
  const baseTabClasses =
    "flex cursor-pointer items-center gap-2 border-b-2 px-2 py-2 text-center font-semibold text-sm transition-colors -mb-px";
  const selectedClasses = "border-primary text-foreground";
  const unselectedClasses = "border-transparent text-muted-foreground hover:text-muted-foreground/90";

  return (
    <nav className="mb-8 flex gap-4 border-border border-b" aria-label="User tabs">
      <Link
        to="/$slug/admin/users"
        params={{ slug: slug ?? "" }}
        className={`${baseTabClasses} ${activeTab === "all-users" ? selectedClasses : unselectedClasses}`}
      >
        <Trans>All users</Trans>
      </Link>
      <Link
        to="/$slug/admin/users/recycle-bin"
        params={{ slug: slug ?? "" }}
        className={`${baseTabClasses} ${activeTab === "recycle-bin" ? selectedClasses : unselectedClasses}`}
      >
        <Trans>Recycle bin</Trans>
      </Link>
    </nav>
  );
}
