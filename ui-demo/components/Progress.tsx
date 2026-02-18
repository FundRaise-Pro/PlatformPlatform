"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "../utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-slate-100",
      className
    )}
    value={value}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-indigo-600 transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

const ProgressTrack = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("relative h-4 w-full overflow-hidden rounded-full bg-slate-100", className)} {...props} />
)

const ProgressIndicator = ({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement> & { value?: number }) => (
  <div
    className={cn("h-full bg-indigo-600 transition-all", className)}
    style={{ width: `${props.value || 0}%`, ...style }}
    {...props}
  />
)

export { Progress, ProgressTrack, ProgressIndicator }
