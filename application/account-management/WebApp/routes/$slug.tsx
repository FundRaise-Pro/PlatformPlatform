import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$slug")({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/$slug"!</div>;
}
