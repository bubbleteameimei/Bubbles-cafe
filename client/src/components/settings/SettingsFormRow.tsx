import React from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SettingsFormRowProps {
  label: string;
  description?: string;
  htmlFor?: string;
  tooltip?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function SettingsFormRow({
  label,
  description,
  htmlFor,
  tooltip,
  error,
  className,
  children
}: SettingsFormRowProps) {
  return (
    <div className={cn("grid gap-2 sm:grid-cols-3 sm:gap-4 items-start mb-6", className)}>
      <div className="sm:col-span-1">
        <div className="flex items-center gap-1.5">
          <label htmlFor={htmlFor} className="text-sm font-medium">
            {label}
          </label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-sm">
                  <p className="text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="sm:col-span-2">
        {children}
        {error && (
          <p className="text-xs text-destructive mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}