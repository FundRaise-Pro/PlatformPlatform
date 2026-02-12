import { loginPath, tenantPath } from "@repo/infrastructure/auth/constants";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/back-office/$")({
  component: LegacySplatRedirect
});

function LegacySplatRedirect() {
  useEffect(() => {
    const slug = import.meta.user_info_env?.tenantSlug;
    const rest = window.location.pathname.replace(/^\/back-office/, "");

    if (import.meta.build_env.buildType === "development") {
      // biome-ignore lint/suspicious/noConsole: intentional dev-only routing debug log
      console.info("[routing] legacy redirect:", window.location.pathname);
    }

    if (slug) {
      window.location.replace(tenantPath(slug, "back-office", rest) + window.location.search + window.location.hash);
    } else if (!import.meta.user_info_env?.isAuthenticated) {
      const returnPath = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
      window.location.replace(`${loginPath}?returnPath=${returnPath}`);
    }
  }, []);

  return null;
}
