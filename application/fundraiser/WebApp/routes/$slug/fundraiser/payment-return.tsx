import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$slug/fundraiser/payment-return")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/$slug/fundraiser/payment-return"!</div>;
}
