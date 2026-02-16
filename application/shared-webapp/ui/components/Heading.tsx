import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type HeadingProps = ComponentPropsWithoutRef<"h1"> & {
  level?: HeadingLevel;
};

export function Heading({ level = 1, className, ...props }: HeadingProps) {
  const headingProps = { ...props, "data-slot": "heading", className: cn(className) };

  if (level === 1) return <h1 {...headingProps} />;
  if (level === 2) return <h2 {...headingProps} />;
  if (level === 3) return <h3 {...headingProps} />;
  if (level === 4) return <h4 {...headingProps} />;
  if (level === 5) return <h5 {...headingProps} />;
  return <h6 {...headingProps} />;
}