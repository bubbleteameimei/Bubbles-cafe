import * as React from "react";

interface PageHeaderProps {
  heading: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  heading,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2 w-full sm:w-auto">{children}</div>}
    </div>
  );
}