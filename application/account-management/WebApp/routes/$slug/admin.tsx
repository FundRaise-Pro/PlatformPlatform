import { adminPath } from "@repo/infrastructure/auth/constants";
import { requireAuthentication } from "@repo/infrastructure/auth/routeGuards";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import FederatedNotFoundPage from "@/federated-modules/errorPages/FederatedNotFoundPage";

export const Route = createFileRoute("/$slug/admin")({
  beforeLoad: ({ params }) => {
    requireAuthentication();
    const userSlug = import.meta.user_info_env?.tenantSlug;
    if (userSlug && params.slug !== userSlug) {
      const rest = window.location.pathname.replace(new RegExp(`^/${params.slug}/admin`), "");
      window.location.replace(adminPath(userSlug, rest) + window.location.search + window.location.hash);
    }
  },
  component: AdminLayout,
  notFoundComponent: FederatedNotFoundPage,
});

function AdminLayout() {
  return <Outlet />;
}
