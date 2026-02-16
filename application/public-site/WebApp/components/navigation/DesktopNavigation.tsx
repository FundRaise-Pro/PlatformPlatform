"use client";

import { BookOpen, Calendar, Heart, Home, Mail, Megaphone } from "lucide-react";
import { usePathname } from "next/navigation";
import { NavigationMenu, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { NavigationPlainLink } from "./NavigationPlainLink";
import type { NavLink } from "./nav-config";

interface DesktopNavigationProps {
  links: NavLink[];
}

/** Icon mapping – best-effort icons per route */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "/": Home,
  "/campaigns": Megaphone,
  "/blog": BookOpen,
  "/events": Calendar,
  "/donate": Heart,
  "/contact": Mail
};

/**
 * Desktop navigation for the public storefront.
 *
 * Adapted from GOS-Dev DesktopNavigation:
 * - Removed admin dropdown, StarBorder effect, SupportUs dropdown
 * - Links are driven by tenant ContentConfig + FeatureFlags via props
 */
export function DesktopNavigation({ links }: DesktopNavigationProps) {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
      <NavigationMenu viewport={false}>
        <NavigationMenuList className="gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
            const Icon = iconMap[link.href];

            return (
              <NavigationPlainLink
                key={link.href}
                href={link.href}
                label={
                  <span className="flex items-center gap-1.5">
                    {Icon && <Icon className="size-4" />}
                    {link.label}
                  </span>
                }
                isActive={isActive}
                className={cn(
                  navigationMenuTriggerStyle(),
                  "navbar-link relative transition-all duration-300 cursor-pointer",
                  "hover:bg-accent/50 hover:text-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive && "text-primary font-semibold bg-accent/30"
                )}
              />
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
