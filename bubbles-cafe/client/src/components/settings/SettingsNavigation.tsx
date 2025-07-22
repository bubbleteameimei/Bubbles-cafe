import React from 'react';
import { useLocation, Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  User,
  Link2,
  Type,
  Sparkles,
  Bell,
  Shield,
  Cookie,
  Zap,
  Eye
} from 'lucide-react';

interface SettingsNavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  description: string;
}

const settingsNavItems: SettingsNavItem[] = [
  {
    label: 'Profile',
    path: '/settings/profile',
    icon: <User className="h-5 w-5" />,
    description: 'Manage your personal information and account settings'
  },
  {
    label: 'Connected Accounts',
    path: '/settings/connected-accounts',
    icon: <Link2 className="h-5 w-5" />,
    description: 'Link your profile with other services and platforms'
  },
  {
    label: 'Fonts',
    path: '/settings/fonts',
    icon: <Type className="h-5 w-5" />,
    description: 'Customize your reading experience with font preferences'
  },
  {
    label: 'Accessibility',
    path: '/settings/accessibility',
    icon: <Sparkles className="h-5 w-5" />,
    description: 'Adjust settings for improved reading and navigation'
  },
  {
    label: 'Notifications',
    path: '/settings/notifications',
    icon: <Bell className="h-5 w-5" />,
    description: 'Control which notifications you receive and how'
  },
  {
    label: 'Privacy',
    path: '/settings/privacy',
    icon: <Shield className="h-5 w-5" />,
    description: 'Manage your privacy settings and data preferences'
  },
  {
    label: 'Cookie Management',
    path: '/settings/cookie-management',
    icon: <Cookie className="h-5 w-5" />,
    description: 'Control how cookies are used across the site'
  },
  {
    label: 'Quick Settings',
    path: '/settings/quick-settings',
    icon: <Zap className="h-5 w-5" />,
    description: 'Access frequently used settings in one place'
  },
  {
    label: 'Preview',
    path: '/settings/preview',
    icon: <Eye className="h-5 w-5" />,
    description: 'Preview how your content appears to others'
  }
];

export function SettingsNavigation() {
  const [location] = useLocation();

  return (
    <Card className="p-4 mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account preferences</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {settingsNavItems.map((item) => (
          <Link 
            href={item.path} 
            key={item.path}
          >
            <a 
              className={cn(
                "flex items-start space-x-3 p-3 rounded-md transition-colors hover:bg-muted",
                location === item.path ? "bg-muted" : ""
              )}
            >
              <div className={cn(
                "mt-0.5 rounded-md p-1.5",
                location === item.path ? "bg-primary text-primary-foreground" : "bg-muted-foreground/10 text-muted-foreground"
              )}>
                {item.icon}
              </div>
              <div>
                <p className={cn(
                  "font-medium",
                  location === item.path ? "text-primary" : ""
                )}>
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {item.description}
                </p>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </Card>
  );
}

// Alternative compact view for mobile screens
export function SettingsNavigationCompact() {
  const [location] = useLocation();

  return (
    <div className="mb-6 overflow-x-auto pb-2">
      <div className="flex space-x-2">
        {settingsNavItems.map((item) => (
          <Link 
            href={item.path} 
            key={item.path}
          >
            <a 
              className={cn(
                "flex flex-col items-center space-y-1 p-2 min-w-[80px] rounded-md transition-colors whitespace-nowrap",
                location === item.path 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              <div>
                {item.icon}
              </div>
              <p className="text-xs font-medium">
                {item.label}
              </p>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}