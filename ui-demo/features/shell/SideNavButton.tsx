import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface SideNavButtonProps {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function SideNavButton({ icon, label, isActive, onClick }: SideNavButtonProps) {
  return (
    <Button
      type="button"
      variant={isActive ? "secondary" : "ghost"}
      size="icon"
      className="group relative size-12 rounded-2xl"
      onClick={onClick}
    >
      {icon}
      <span className="pointer-events-none absolute left-full ml-2 hidden rounded-lg bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
        {label}
      </span>
    </Button>
  );
}
