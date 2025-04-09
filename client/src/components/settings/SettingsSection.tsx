import React from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  includeSeparator?: boolean;
  id?: string;
}

export function SettingsSection({
  title,
  description,
  children,
  className,
  actions,
  includeSeparator = true,
  id
}: SettingsSectionProps) {
  return (
    <section id={id} className={cn("py-6 first:pt-0", className)}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-6">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {actions}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        {children}
      </div>
      
      {includeSeparator && <Separator className="mt-6" />}
    </section>
  );
}