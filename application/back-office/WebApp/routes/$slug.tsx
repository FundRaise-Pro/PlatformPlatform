import { requireAuthentication } from "@repo/infrastructure/auth/routeGuards";
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
  "fundraiser",
  "back-office",
  "admin"
]);

export const Route = createFileRoute("/$slug")({
  beforeLoad: ({ params }) => {
    if (RESERVED_SLUGS.has(params.slug)) {
      throw notFound();
    }
    requireAuthentication();
    const userSlug = import.meta.user_info_env?.tenantSlug;
    if (userSlug && params.slug !== userSlug) {
      const match = window.location.pathname.match(/^\/[^/]+\/(fundraiser|back-office)(\/.*)?$/);
      if (match) {
        const app = match[1];
        const rest = match[2] ?? "";
        window.location.replace(`/${userSlug}/${app}${rest}${window.location.search}${window.location.hash}`);
      }
    }
  },
  component: SlugLayout
});

function SlugLayout() {
  return <Outlet />;
}
