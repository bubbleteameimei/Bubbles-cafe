import React from 'react';
import { SettingsNavigation, SettingsNavigationCompact } from './SettingsNavigation';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/toaster';

interface SettingsLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function SettingsLayout({
  children,
  title,
  description,
  actions
}: SettingsLayoutProps) {
  return (
    <div className="container max-w-screen-xl mx-auto p-4 sm:p-6">
      {/* Page header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {actions}
          </div>
        )}
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden">
        <SettingsNavigationCompact />
      </div>

      {/* Desktop navigation and content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="hidden md:block md:col-span-3 lg:col-span-3">
          <div className="sticky top-24">
            <SettingsNavigation />
          </div>
        </div>
        <div className="col-span-1 md:col-span-9 lg:col-span-9">
          <Card className="p-4 sm:p-6">
            <ScrollArea className="h-full">
              {children}
            </ScrollArea>
          </Card>
        </div>
      </div>
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}