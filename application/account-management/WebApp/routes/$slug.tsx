import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

const RESERVED_SLUGS = new Set([
  "login",
  "signup",
  "legal",
  "error",
  "api",
  "assets",
  "static",
  "public",
  "images",
  "health",
  "metrics",
  "well-known",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

export const Route = createFileRoute("/$slug")({
  beforeLoad: ({ params }) => {
    if (RESERVED_SLUGS.has(params.slug)) {
      throw notFound();
    }
  },
  component: SlugLayout,
});

function SlugLayout() {
  return <Outlet />;
}
