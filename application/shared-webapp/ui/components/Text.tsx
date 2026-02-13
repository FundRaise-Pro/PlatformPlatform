import type * as React from "react";
import { cn } from "../utils";

export function Text({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="text" className={cn(className)} {...props} />;
}