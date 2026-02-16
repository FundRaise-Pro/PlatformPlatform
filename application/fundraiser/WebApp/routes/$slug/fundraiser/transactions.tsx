import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$slug/fundraiser/transactions")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/$slug/fundraiser/transactions"!</div>;
}
