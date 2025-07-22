import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  UserCircle, 
  Bell, 
  ShieldAlert, 
  Cookie, 
  Type, 
  Accessibility, 
  Link2, 
  Settings2,
  ChevronRight
} from 'lucide-react';

type SettingsNavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
};

const settingsNavItems: SettingsNavItem[] = [
  {
    name: 'Profile',
    href: '/settings/profile',
    icon: <UserCircle className="h-5 w-5" />,
    description: 'Manage your personal information and account preferences'
  },
  {
    name: 'Privacy',
    href: '/settings/privacy',
    icon: <ShieldAlert className="h-5 w-5" />,
    description: 'Control how your data is used and who can see your activity'
  },
  {
    name: 'Notifications',
    href: '/settings/notifications',
    icon: <Bell className="h-5 w-5" />,
    description: 'Set notification preferences for emails and alerts'
  },
  {
    name: 'Connected Accounts',
    href: '/settings/connected-accounts',
    icon: <Link2 className="h-5 w-5" />,
    description: 'Link and manage your connected social accounts'
  },
  {
    name: 'Cookie Management',
    href: '/settings/cookie-management',
    icon: <Cookie className="h-5 w-5" />,
    description: 'Control cookie settings and manage your privacy preferences'
  },
  {
    name: 'Typography',
    href: '/settings/fonts',
    icon: <Type className="h-5 w-5" />,
    description: 'Customize font styles and reading preferences'
  },
  {
    name: 'Accessibility',
    href: '/settings/accessibility',
    icon: <Accessibility className="h-5 w-5" />,
    description: 'Control accessibility features and reading assistance'
  },
  {
    name: 'Quick Settings',
    href: '/settings/quick-settings',
    icon: <Settings2 className="h-5 w-5" />,
    description: 'Access frequently used settings in one place'
  }
];

interface SettingsLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function SettingsLayout({ 
  children, 
  title = "Settings", 
  description 
}: SettingsLayoutProps) {
  const [location] = useLocation();

  // Get the current active section
  const activeSection = settingsNavItems.find(item => item.href === location);
  
  return (
    <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
      {/* Sidebar navigation for larger screens */}
      <aside className="lg:w-64 xl:w-72 flex-shrink-0 hidden lg:block">
        <div className="sticky top-20">
          <div className="space-y-1 mb-8">
            <h2 className="text-lg font-semibold tracking-tight">Settings</h2>
            <p className="text-sm text-muted-foreground">
              Manage your account preferences
            </p>
          </div>
          
          <nav className="flex flex-col space-y-1">
            {settingsNavItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  location === item.href 
                    ? "bg-accent text-accent-foreground" 
                    : "hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground"
                )}
              >
                <span className={cn(
                  location === item.href ? "text-foreground" : "text-muted-foreground"
                )}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      
      {/* Mobile navigation dropdown */}
      <div className="lg:hidden w-full mb-4">
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <Link 
            href="/settings"
            className="flex items-center justify-between px-4 py-3 border-b"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Settings</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          
          <div className="px-4 py-3 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="p-1.5 bg-accent/50 rounded-md">
                  {activeSection?.icon || <Settings2 className="h-4 w-4" />}
                </span>
                <span className="font-medium">{activeSection?.name || "Settings"}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeSection?.description || "Manage your account settings and preferences"}
            </p>
          </div>
          
          <div className="px-2 py-2 max-h-52 overflow-y-auto">
            {settingsNavItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors my-1",
                  location === item.href 
                    ? "bg-accent text-accent-foreground" 
                    : "hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground"
                )}
              >
                <span className={cn(
                  location === item.href ? "text-foreground" : "text-muted-foreground"
                )}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-1">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {title || activeSection?.name || "Settings"}
            </h1>
            {description ? (
              <p className="text-muted-foreground mt-2">{description}</p>
            ) : activeSection?.description ? (
              <p className="text-muted-foreground mt-2">{activeSection.description}</p>
            ) : null}
          </div>
          
          <div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SettingsLayout;