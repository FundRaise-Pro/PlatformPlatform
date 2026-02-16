import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/back-office")({
  component: () => <Outlet />
});
