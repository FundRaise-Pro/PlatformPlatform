import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$slug/fundraiser/donate")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/$slug/fundraiser/donate"!</div>;
}
