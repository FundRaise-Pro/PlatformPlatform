import { useCallback, useEffect, useMemo, useState } from "react";
import { AppViewId, ApplyPathId, CrmTabId, PublicPageId } from "@/types";

const DEFAULT_VIEW: AppViewId = "dashboard";
const DEFAULT_CRM_TAB: CrmTabId = "donors";
const DEFAULT_PUBLIC_PAGE: PublicPageId = "landing";
const DEFAULT_APPLY_PATH: ApplyPathId = "volunteer";

export interface AppRoute {
  view: AppViewId;
  crmTab: CrmTabId;
  publicPage: PublicPageId;
  applyPath: ApplyPathId;
}

function parseRoute(hash: string): AppRoute {
  const [viewSegment, childSegment, nestedSegment] = hash.replace(/^#\/?/, "").split("/");

  if (viewSegment === "editor") {
    const publicPage: PublicPageId = isPublicPage(childSegment) ? childSegment : DEFAULT_PUBLIC_PAGE;
    const applyPath: ApplyPathId = publicPage === "apply" && isApplyPath(nestedSegment) ? nestedSegment : DEFAULT_APPLY_PATH;
    return { view: "editor", crmTab: DEFAULT_CRM_TAB, publicPage, applyPath };
  }

  if (viewSegment === "crm") {
    const crmTab: CrmTabId = childSegment === "partners" ? "partners" : DEFAULT_CRM_TAB;
    return { view: "crm", crmTab, publicPage: DEFAULT_PUBLIC_PAGE, applyPath: DEFAULT_APPLY_PATH };
  }

  if (viewSegment === "public") {
    const publicPage: PublicPageId = isPublicPage(childSegment) ? childSegment : DEFAULT_PUBLIC_PAGE;
    const applyPath: ApplyPathId = publicPage === "apply" && isApplyPath(nestedSegment) ? nestedSegment : DEFAULT_APPLY_PATH;
    return { view: "public", crmTab: DEFAULT_CRM_TAB, publicPage, applyPath };
  }

  return { view: DEFAULT_VIEW, crmTab: DEFAULT_CRM_TAB, publicPage: DEFAULT_PUBLIC_PAGE, applyPath: DEFAULT_APPLY_PATH };
}

function isPublicPage(value?: string): value is PublicPageId {
  return value === "landing" || value === "stories" || value === "events" || value === "blog" || value === "partners" || value === "apply";
}

function isApplyPath(value?: string): value is ApplyPathId {
  return value === "volunteer" || value === "help" || value === "sponsor";
}

function toHash(route: AppRoute): string {
  if (route.view === "crm") {
    return `#/crm/${route.crmTab}`;
  }

  if (route.view === "public") {
    if (route.publicPage === "apply") {
      return `#/public/${route.publicPage}/${route.applyPath}`;
    }
    return `#/public/${route.publicPage}`;
  }

  if (route.view === "editor") {
    if (route.publicPage === "apply") {
      return `#/editor/${route.publicPage}/${route.applyPath}`;
    }
    return `#/editor/${route.publicPage}`;
  }

  return `#/${route.view}`;
}

export function useHashRoute() {
  const [route, setRoute] = useState<AppRoute>(() => parseRoute(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = toHash(route);
    }
  }, [route]);

  const setView = useCallback(
    (view: AppViewId) => {
      const nextRoute: AppRoute =
        view === "crm"
          ? { ...route, view: "crm", crmTab: route.crmTab || DEFAULT_CRM_TAB }
          : view === "public"
            ? { ...route, view: "public", publicPage: route.publicPage || DEFAULT_PUBLIC_PAGE }
            : { ...route, view };

      window.location.hash = toHash(nextRoute);
    },
    [route],
  );

  const setCrmTab = useCallback(
    (crmTab: CrmTabId) => {
      const nextRoute: AppRoute = { ...route, view: "crm", crmTab };
      window.location.hash = toHash(nextRoute);
    },
    [route],
  );

  const setPublicPage = useCallback(
    (publicPage: PublicPageId) => {
      const nextRoute: AppRoute = {
        ...route,
        view: route.view === "editor" ? "editor" : "public",
        publicPage,
        applyPath: route.applyPath,
      };
      window.location.hash = toHash(nextRoute);
    },
    [route],
  );

  const setApplyPath = useCallback(
    (applyPath: ApplyPathId) => {
      const nextRoute: AppRoute = {
        ...route,
        view: route.view === "editor" ? "editor" : "public",
        publicPage: "apply",
        applyPath,
      };
      window.location.hash = toHash(nextRoute);
    },
    [route],
  );

  return useMemo(
    () => ({
      route,
      setView,
      setCrmTab,
      setPublicPage,
      setApplyPath,
    }),
    [route, setApplyPath, setCrmTab, setPublicPage, setView],
  );
}
