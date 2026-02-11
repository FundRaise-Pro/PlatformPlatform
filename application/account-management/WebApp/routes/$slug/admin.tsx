import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$slug/admin")({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/$slug/admin"!</div>;
}
