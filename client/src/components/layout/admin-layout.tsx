/**
 * Admin Layout Component
 * 
 * This component provides a consistent layout for all admin pages with sidebar navigation.
 */

import React, { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Book, 
  Users, 
  BarChart, 
  Settings, 
  Mail,
  Server,
  Sparkles,
  Database,
  Bell,
  FileText
} from 'lucide-react';

type AdminLayoutProps = {
  children: ReactNode;
};

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  current?: boolean;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Only admins can access this layout
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold">Access Denied</h1>
          <p className="mt-2">You must be an admin to access this page.</p>
          <Link href="/">
            <a className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md">Back to Home</a>
          </Link>
        </div>
      </div>
    );
  }
  
  // Define navigation items
  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/admin', icon: Home, current: location === '/admin' || location === '/admin/dashboard' },
    { name: 'Content Management', href: '/admin/posts', icon: Book, current: location.startsWith('/admin/post') || location === '/admin/content-management' },
    { name: 'User Management', href: '/admin/users', icon: Users, current: location.startsWith('/admin/user') },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart, current: location.startsWith('/admin/analytics') || location === '/admin/site-statistics' },
    { name: 'WordPress Sync', href: '/admin/wordpress-sync', icon: Sparkles, current: location === '/admin/wordpress-sync' },
    { name: 'System', href: '/admin/settings', icon: Settings, current: location === '/admin/settings' },
    { name: 'Email Services', href: '/admin/email-test', icon: Mail, current: location === '/admin/email-test' },
    { name: 'Server Status', href: '/admin/server-status', icon: Server, current: location === '/admin/server-status' },
    { name: 'Database', href: '/admin/database', icon: Database, current: location === '/admin/database' },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell, current: location === '/admin/notifications' },
    { name: 'Feedback', href: '/admin/feedback', icon: FileText, current: location === '/admin/feedback' || location === '/admin/feedback-review' },
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-full">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow border-r border-border bg-card pt-5">
            <div className="flex items-center flex-shrink-0 px-4">
              <h2 className="text-lg font-bold">Admin Panel</h2>
            </div>
            
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 pb-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                  >
                    <a
                      className={cn(
                        item.current
                          ? 'bg-secondary text-secondary-foreground'
                          : 'text-muted-foreground hover:bg-secondary/50',
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                      )}
                    >
                      <item.icon
                        className={cn(
                          item.current 
                            ? 'text-secondary-foreground' 
                            : 'text-muted-foreground',
                          'mr-3 flex-shrink-0 h-5 w-5'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </a>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
        
        {/* Mobile header */}
        <div className="md:hidden">
          <div className="flex items-center justify-between border-b border-border py-4 px-6">
            <h2 className="text-lg font-bold">Admin Panel</h2>
            {/* Mobile menu button - could expand to show a drawer */}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex flex-col flex-1">
          {/* Page content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}