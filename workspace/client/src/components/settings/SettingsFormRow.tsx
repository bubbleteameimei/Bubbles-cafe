import React from 'react';
import { HelpCircle } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SettingsFormRowProps {
  label: string;
  description?: string;
  htmlFor?: string;
  tooltip?: string;
  children: React.ReactNode;
}

export function SettingsFormRow({ 
  label, 
  description, 
  htmlFor, 
  tooltip, 
  children 
}: SettingsFormRowProps) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <label 
            htmlFor={htmlFor}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
          
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger type="button">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {description && (
          <p className="text-[0.8rem] text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      
      <div className="flex justify-end md:w-[260px] lg:w-[350px]">
        {children}
      </div>
    </div>
  );
}