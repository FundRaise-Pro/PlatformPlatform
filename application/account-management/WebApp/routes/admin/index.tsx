import { adminPath, loginPath } from "@repo/infrastructure/auth/constants";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/")({
  component: LegacyAdminRedirect,
});

function LegacyAdminRedirect() {
  useEffect(() => {
    const slug = import.meta.user_info_env?.tenantSlug;
    const rest = window.location.pathname.replace(/^\/admin/, "");

    if (import.meta.build_env.buildType === "development") {
      console.info("[routing] legacy redirect:", window.location.pathname);
    }

    if (slug) {
      window.location.replace(adminPath(slug, rest) + window.location.search + window.location.hash);
    } else if (!import.meta.user_info_env?.isAuthenticated) {
      const returnPath = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
      window.location.replace(`${loginPath}?returnPath=${returnPath}`);
    }
  }, []);

  return null;
}
