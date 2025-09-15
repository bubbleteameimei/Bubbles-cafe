import React from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  description,
  children,
  className
}: SettingsSectionProps) {
  return (
    <div className={cn("py-6 first:pt-0 last:pb-0", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

interface SettingsFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
  submitLabel?: string;
  resetLabel?: string;
  onReset?: () => void;
  className?: string;
  disabled?: boolean;
}

export function SettingsForm({
  children,
  onSubmit,
  isLoading = false,
  error = null,
  success = null,
  submitLabel = "Save changes",
  resetLabel = "Reset",
  onReset,
  className,
  disabled = false
}: SettingsFormProps) {
  return (
    <form 
      onSubmit={onSubmit} 
      className={cn("space-y-6", className)}
    >
      {children}
      
      <Separator />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="border-green-500 text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
        {onReset && (
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={isLoading || disabled}
          >
            {resetLabel}
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isLoading || disabled}
        >
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

interface SettingsFieldRowProps {
  label: string;
  description?: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsFieldRow({
  label,
  description,
  htmlFor,
  error,
  children,
  className
}: SettingsFieldRowProps) {
  return (
    <div className={cn("grid gap-2 sm:grid-cols-12 sm:gap-6 items-start", className)}>
      <div className="sm:col-span-4">
        <label 
          htmlFor={htmlFor} 
          className="block text-sm font-medium"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="sm:col-span-8">
        {children}
        {error && (
          <p className="text-xs text-destructive mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}

export function SettingsFormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, sectionIndex) => (
        <div key={sectionIndex} className="py-6 first:pt-0 last:pb-0">
          <div className="mb-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72 mt-1" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, fieldIndex) => (
              <div key={fieldIndex} className="grid gap-2 sm:grid-cols-12 sm:gap-6 items-start">
                <div className="sm:col-span-4">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-3 w-48 mt-1" />
                </div>
                <div className="sm:col-span-8">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <Separator />
      <div className="flex justify-end">
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}