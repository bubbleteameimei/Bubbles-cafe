import React from "react";
import { cn } from "@/lib/utils";

interface TimelineItemProps {
  title: React.ReactNode;
  time?: string;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "destructive" | "muted";
  isLast?: boolean;
  className?: string;
}

interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

// Timeline container component
export function Timeline({ children, className }: TimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {children}
    </div>
  );
}

// Timeline item component with customizable variants
export function TimelineItem({
  title,
  time,
  icon,
  description,
  variant = "default",
  isLast = false,
  className,
}: TimelineItemProps) {
  // Variant-based styles
  const iconVariants = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary text-primary-foreground",
    success: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
    destructive: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
    muted: "bg-muted text-muted-foreground",
  };

  const lineVariants = {
    default: "bg-muted",
    primary: "bg-primary/70",
    success: "bg-green-200 dark:bg-green-800",
    warning: "bg-yellow-200 dark:bg-yellow-800",
    destructive: "bg-red-200 dark:bg-red-800",
    muted: "bg-muted",
  };

  return (
    <div className={cn("relative flex gap-4", className)}>
      {/* Timeline vertical line and bullet point */}
      <div className="relative mt-1.5 flex-none">
        {/* Bullet icon */}
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", iconVariants[variant])}>
          {icon || (
            <div className="h-2 w-2 rounded-full bg-background" />
          )}
        </div>
        {/* Line connecting to next item */}
        {!isLast && (
          <div className={cn("absolute left-1/2 top-8 h-full w-0.5 -translate-x-1/2", lineVariants[variant])} />
        )}
      </div>

      {/* Timeline content */}
      <div className="pb-8">
        <div className="flex items-center gap-2">
          <div className="font-medium">{title}</div>
          {time && <div className="text-xs text-muted-foreground">{time}</div>}
        </div>
        {description && (
          <div className="mt-1 text-sm text-muted-foreground">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}