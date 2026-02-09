"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Home, Heart, Mail, BookOpen, Calendar, Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { NavLink } from "./nav-config";

interface MobileMenuProps {
  orgName: string;
  links: NavLink[];
  mobileOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 },
};

/** Icon mapping – best-effort icons per route */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "/": Home,
  "/campaigns": Megaphone,
  "/blog": BookOpen,
  "/events": Calendar,
  "/donate": Heart,
  "/contact": Mail,
};

/**
 * Mobile navigation for the public storefront.
 *
 * Adapted from GOS-Dev MobileMenu:
 * - Removed auth / session / admin sections
 * - Links driven by tenant ContentConfig + FeatureFlags via props
 * - Organisation name from TenantSettings
 */
export function MobileMenu({ orgName, links, mobileOpen, onOpenChange }: MobileMenuProps) {
  const pathname = usePathname();
  const handleClose = () => onOpenChange(false);

  return (
    <div className="md:hidden">
      <Sheet open={mobileOpen} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden transition-colors duration-200 hover:bg-accent mt-2"
          >
            <nav className="border shadow-sm rounded-md p-1 border-blue-300/20">
              <Menu className="size-6" />
            </nav>
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[300px] sm:w-[400px] p-0 border-l-primary/20 flex flex-col [&>button]:hidden h-dvh"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 animate-gradient-bg opacity-15 pointer-events-none" />

          {/* Header with Custom Close */}
          <div className="relative z-10 p-6 pb-2 flex items-center justify-between border-b border-primary/10 bg-background/50 backdrop-blur-sm">
            <SheetTitle className="flex items-center space-x-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 shadow-sm">
                <Heart className="size-6 text-primary" />
              </div>
              <span className="font-bold text-lg tracking-tight">{orgName}</span>
            </SheetTitle>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary"
              >
                <X className="size-5" />
                <span className="sr-only">Close</span>
              </Button>
            </SheetClose>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1 relative z-10 min-h-0">
            <div className="p-2 flex flex-col space-y-6">
              <motion.div
                className="flex flex-col space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {/* Navigation Links */}
                <motion.div variants={itemVariants} className="space-y-1">
                  <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Menu
                  </p>
                  <div className="flex flex-col space-y-1">
                    {links.map((link) => {
                      const isActive =
                        pathname === link.href ||
                        (link.href !== "/" && pathname?.startsWith(link.href));
                      const Icon = iconMap[link.href];

                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={handleClose}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                            "hover:bg-primary/5 hover:text-primary hover:translate-x-1",
                            isActive
                              ? "bg-primary/10 text-primary font-semibold shadow-sm"
                              : "text-muted-foreground"
                          )}
                        >
                          {Icon && (
                            <Icon
                              className={cn(
                                "size-5 shrink-0",
                                isActive ? "text-primary" : "text-muted-foreground"
                              )}
                            />
                          )}
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
