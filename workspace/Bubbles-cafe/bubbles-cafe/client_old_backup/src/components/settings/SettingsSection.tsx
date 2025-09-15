import React from 'react';

export interface SettingsSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  includeSeparator?: boolean;
}

export function SettingsSection({ 
  title, 
  description, 
  children,
  includeSeparator = true
}: SettingsSectionProps) {
  return (
    <div className="space-y-4">
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-medium tracking-tight">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
      {includeSeparator && <div className="border-b my-6" />}
    </div>
  );
}