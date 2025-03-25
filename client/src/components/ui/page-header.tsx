import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/**
 * Page header component with mobile-responsive layout
 * Used for section headings throughout the application
 */
export function PageHeader({
  title,
  description,
  actions,
  className = '',
  children,
}: PageHeaderProps) {
  return (
    <div className={`mb-6 md:mb-8 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm sm:text-base text-muted-foreground max-w-full sm:max-w-[80ch]">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
            {actions}
          </div>
        )}
      </div>
      {children && <div className="mt-4 sm:mt-6">{children}</div>}
    </div>
  );
}

export default PageHeader;