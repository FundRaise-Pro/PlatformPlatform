import type React from "react";
import { NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";

interface NavigationPlainLinkProps {
  href: string;
  label: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

export const NavigationPlainLink: React.FC<NavigationPlainLinkProps> = ({ href, label, isActive, className }) => (
  <NavigationMenuItem>
    <NavigationMenuLink className={className} href={href} active={isActive}>
      {label}
    </NavigationMenuLink>
  </NavigationMenuItem>
);
