import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TimelineItemProps {
  title: React.ReactNode;
  time?: string;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "destructive" | "muted";
  isLast?: boolean;
  className?: string;
}

export interface TimelineUser {
  name: string;
  initials: string;
  avatar?: string;
}

export interface TimelineItem {
  id: number | string;
  title: React.ReactNode;
  description?: React.ReactNode;
  user?: TimelineUser;
  date?: string;
  time?: string;
  icon?: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "destructive" | "muted";
}

export interface TimelineGroup {
  date: string;
  items: TimelineItem[];
}

export interface TimelineProps {
  children?: React.ReactNode;
  groups?: TimelineGroup[];
  className?: string;
  initialCollapsed?: boolean;
  showOlderText?: string;
}

// Timeline container component with grouped timeline items
export function Timeline({ 
  children, 
  groups = [], 
  className, 
  initialCollapsed = true,
  showOlderText = "Show older activities" 
}: TimelineProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    groups.reduce((acc, _, index) => {
      // Initially expand only the first group if initialCollapsed is true
      acc[index] = initialCollapsed ? index === 0 : true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const toggleGroup = (index: number) => {
    setExpandedGroups(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // If children are provided, use the simple timeline
  if (children) {
    return (
      <div className={cn("space-y-0", className)}>
        {children}
      </div>
    );
  }

  // Otherwise, render the grouped timeline
  return (
    <div className={cn("space-y-6", className)}>
      {groups.map((group, groupIndex) => (
        <div key={`${group.date}-${groupIndex}`} className="space-y-2">
          {/* Date header with toggle */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">{group.date}</h3>
            {groupIndex > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2"
                onClick={() => toggleGroup(groupIndex)}
              >
                {expandedGroups[groupIndex] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <><ChevronDown className="h-4 w-4" /> <span className="ml-1 text-xs">{showOlderText}</span></>
                )}
              </Button>
            )}
          </div>

          {/* Timeline items for this group */}
          {expandedGroups[groupIndex] && (
            <div className="space-y-0">
              {group.items.map((item, itemIndex) => (
                <TimelineItem
                  key={item.id}
                  title={item.title}
                  time={item.date ?? item.time}
                  icon={item.icon}
                  description={
                    <>
                      {item.description && <div>{item.description}</div>}
                      {item.user && (
                        <div className="mt-1 flex items-center">
                          <div className="flex-shrink-0 mr-2">
                            {item.user.avatar ? (
                              <img 
                                src={item.user.avatar} 
                                alt={item.user.name} 
                                className="h-5 w-5 rounded-full"
                              />
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-medium">
                                {item.user.initials}
                              </div>
                            )}
                          </div>
                          <span className="text-xs">{item.user.name}</span>
                        </div>
                      )}
                    </>
                  }
                  variant={item.variant || "default"}
                  isLast={itemIndex === group.items.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      ))}
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