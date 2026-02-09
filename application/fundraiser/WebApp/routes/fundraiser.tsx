import { requireAuthentication } from "@repo/infrastructure/auth/routeGuards";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const FederatedNotFoundPage = lazy(() => import("account-management/FederatedNotFoundPage"));

export const Route = createFileRoute("/fundraiser")({
  beforeLoad: () => requireAuthentication(),
  component: FundraiserLayout,
  notFoundComponent: FederatedNotFoundPage
});

function FundraiserLayout() {
  return (
    <Suspense fallback={null}>
      <Outlet />
    </Suspense>
  );
}
