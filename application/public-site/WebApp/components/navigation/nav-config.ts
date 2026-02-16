/**
 * Navigation configuration for the public storefront.
 *
 * Unlike the GOS-Dev admin nav, this config is derived from tenant ContentConfig
 * labels and FeatureFlags so it adapts per-tenant.
 */

export interface NavLink {
  href: string;
  label: string;
}

/**
 * Build public navigation links using tenant content labels.
 * Feature flags control which sections appear.
 */
export function getPublicNavLinks(
  content: { campaignLabel: string; branchLabel: string },
  featureFlags: Record<string, boolean>
): NavLink[] {
  const links: NavLink[] = [{ href: "/", label: "Home" }];

  links.push({ href: "/campaigns", label: `${content.campaignLabel}s` });

  if (featureFlags["blog"] !== false) {
    links.push({ href: "/blog", label: "Blog" });
  }

  if (featureFlags["events"] !== false) {
    links.push({ href: "/events", label: "Events" });
  }

  links.push({ href: "/donate", label: "Donate" });
  links.push({ href: "/contact", label: "Contact" });

  return links;
}
