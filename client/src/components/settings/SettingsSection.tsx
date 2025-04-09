import React from 'react';

interface SettingsSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsSection({ 
  title, 
  description, 
  children 
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
    </div>
  );
}