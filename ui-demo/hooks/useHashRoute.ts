import { useCallback, useEffect, useMemo, useState } from "react";
import { AppViewId, ApplyPathId, CrmTabId, PublicPageId } from "@/types";

const DEFAULT_VIEW: AppViewId = "dashboard";
const DEFAULT_CRM_TAB: CrmTabId = "donors";
const DEFAULT_PUBLIC_PAGE: PublicPageId = "landing";
const DEFAULT_APPLY_PATH: ApplyPathId = "volunteer";
const DEFAULT_CAMPAIGN_SLUG = "urban-water-resilience-2024";
const DEFAULT_FUNDRAISER_SLUG = "guguletu-water-grid";

export interface AppRoute {
  view: AppViewId;
  crmTab: CrmTabId;
  publicPage: PublicPageId;
  applyPath: ApplyPathId;
  campaignSlug: string;
  fundraiserSlug: string;
}

function parseRoute(hash: string): AppRoute {
  const segments = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const [viewSegment] = segments;

  if (viewSegment === "dashboard") {
    if (segments[1] === "campaigns") {
      return {
        view: "dashboard",
        crmTab: DEFAULT_CRM_TAB,
        publicPage: "fundraisers",
        applyPath: DEFAULT_APPLY_PATH,
        campaignSlug: segments[2] || DEFAULT_CAMPAIGN_SLUG,
        fundraiserSlug: segments[4] || DEFAULT_FUNDRAISER_SLUG,
      };
    }

    return {
      view: "dashboard",
      crmTab: DEFAULT_CRM_TAB,
      publicPage: DEFAULT_PUBLIC_PAGE,
      applyPath: DEFAULT_APPLY_PATH,
      campaignSlug: DEFAULT_CAMPAIGN_SLUG,
      fundraiserSlug: DEFAULT_FUNDRAISER_SLUG,
    };
  }

  if (viewSegment === "crm") {
    const crmTab: CrmTabId = segments[1] === "partners" ? "partners" : DEFAULT_CRM_TAB;
    return {
      view: "crm",
      crmTab,
      publicPage: DEFAULT_PUBLIC_PAGE,
      applyPath: DEFAULT_APPLY_PATH,
      campaignSlug: DEFAULT_CAMPAIGN_SLUG,
      fundraiserSlug: DEFAULT_FUNDRAISER_SLUG,
    };
  }

  if (viewSegment === "public" || viewSegment === "editor") {
    const view: AppViewId = viewSegment;
    if (segments[1] === "campaigns") {
      const campaignSlug = segments[2] || DEFAULT_CAMPAIGN_SLUG;
      const pageSegment = segments[3];

      if (pageSegment === "fundraisers") {
        return {
          view,
          crmTab: DEFAULT_CRM_TAB,
          publicPage: "fundraisers",
          applyPath: DEFAULT_APPLY_PATH,
          campaignSlug,
          fundraiserSlug: segments[4] || DEFAULT_FUNDRAISER_SLUG,
        };
      }

      if (pageSegment === "apply") {
        return {
          view,
          crmTab: DEFAULT_CRM_TAB,
          publicPage: "apply",
          applyPath: isApplyPath(segments[4]) ? segments[4] : DEFAULT_APPLY_PATH,
          campaignSlug,
          fundraiserSlug: DEFAULT_FUNDRAISER_SLUG,
        };
      }

      return {
        view,
        crmTab: DEFAULT_CRM_TAB,
        publicPage: isPublicPage(pageSegment) ? pageSegment : DEFAULT_PUBLIC_PAGE,
        applyPath: DEFAULT_APPLY_PATH,
        campaignSlug,
        fundraiserSlug: DEFAULT_FUNDRAISER_SLUG,
      };
    }

    const childSegment = segments[1];
    return {
      view,
      crmTab: DEFAULT_CRM_TAB,
      publicPage: isLegacyStories(childSegment) ? "fundraisers" : isPublicPage(childSegment) ? childSegment : DEFAULT_PUBLIC_PAGE,
      applyPath: DEFAULT_APPLY_PATH,
      campaignSlug: DEFAULT_CAMPAIGN_SLUG,
      fundraiserSlug: DEFAULT_FUNDRAISER_SLUG,
    };
  }

  return {
    view: DEFAULT_VIEW,
    crmTab: DEFAULT_CRM_TAB,
    publicPage: DEFAULT_PUBLIC_PAGE,
    applyPath: DEFAULT_APPLY_PATH,
    campaignSlug: DEFAULT_CAMPAIGN_SLUG,
    fundraiserSlug: DEFAULT_FUNDRAISER_SLUG,
  };
}

function isPublicPage(value?: string): value is PublicPageId {
  return (
    value === "landing" ||
    value === "fundraisers" ||
    value === "events" ||
    value === "blog" ||
    value === "partners" ||
    value === "apply"
  );
}

function isLegacyStories(value?: string): boolean {
  return value === "stories";
}

function isApplyPath(value?: string): value is ApplyPathId {
  return value === "volunteer" || value === "help" || value === "sponsor";
}

function toHash(route: AppRoute): string {
  if (route.view === "crm") {
    return `#/crm/${route.crmTab}`;
  }

  if (route.view === "public" || route.view === "editor") {
    if (route.publicPage === "fundraisers") {
      return `#/${route.view}/campaigns/${route.campaignSlug}/fundraisers/${route.fundraiserSlug}`;
    }

    if (route.publicPage === "apply") {
      return `#/${route.view}/campaigns/${route.campaignSlug}/apply/${route.applyPath}`;
    }

    return `#/${route.view}/campaigns/${route.campaignSlug}/${route.publicPage}`;
  }

  if (route.view === "dashboard") {
    return `#/dashboard/campaigns/${route.campaignSlug}/fundraisers/${route.fundraiserSlug}`;
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
            ? { ...route, view: "public" }
            : view === "editor"
              ? { ...route, view: "editor" }
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

  const setCampaignSlug = useCallback(
    (campaignSlug: string) => {
      const nextRoute: AppRoute = { ...route, campaignSlug };
      window.location.hash = toHash(nextRoute);
    },
    [route],
  );

  const setFundraiserSlug = useCallback(
    (fundraiserSlug: string, campaignSlug?: string) => {
      const nextRoute: AppRoute = {
        ...route,
        view: route.view === "editor" || route.view === "public" ? route.view : "dashboard",
        publicPage: "fundraisers",
        campaignSlug: campaignSlug ?? route.campaignSlug,
        fundraiserSlug,
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
      setCampaignSlug,
      setFundraiserSlug,
    }),
    [route, setApplyPath, setCampaignSlug, setCrmTab, setFundraiserSlug, setPublicPage, setView],
  );
}
