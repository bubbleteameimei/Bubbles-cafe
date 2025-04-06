import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  heading: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ heading, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4", className)}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children && <div className="ml-auto">{children}</div>}
    </div>
  );
}