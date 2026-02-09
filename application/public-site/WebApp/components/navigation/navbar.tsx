"use client";

import { useState } from "react";
import Link from "next/link";
import { useTenant } from "@/providers/tenant-provider";
import { getPublicNavLinks } from "./nav-config";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileMenu } from "./MobileMenu";

/**
 * Main navigation bar – tenant-aware.
 *
 * Ported from GOS-Dev Navbar but simplified:
 * - No auth / admin links (public storefront only)
 * - Organisation name + logo from TenantSettings
 * - Nav links driven by ContentConfig labels + FeatureFlags
 */
export function Navbar() {
  const { brand, content, featureFlags } = useTenant();
  const [mobileOpen, setMobileOpen] = useState(false);
  const orgName = brand.organizationName ?? "Home";
  const navLinks = getPublicNavLinks(content, featureFlags);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg backdrop-saturate-150 shadow-sm border-b border-border/40 transition-all duration-300">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Logo / Org name */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight transition-transform duration-200 hover:scale-105"
        >
          <span className="text-primary">{orgName}</span>
        </Link>

        {/* Desktop Navigation */}
        <DesktopNavigation links={navLinks} />

        {/* Mobile Menu */}
        <MobileMenu
          orgName={orgName}
          links={navLinks}
          mobileOpen={mobileOpen}
          onOpenChange={setMobileOpen}
        />
      </nav>
    </header>
  );
}
