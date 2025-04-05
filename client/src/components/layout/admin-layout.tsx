/**
 * Admin Layout Component
 * 
 * Provides a consistent layout for admin pages with sidebar navigation.
 */

import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Book, 
  Users, 
  LineChart, 
  Settings, 
  Mail, 
  FileText,
  Database,
  Globe,
  ShieldAlert
} from 'lucide-react';

// Admin navigation items with groups for better organization
const adminNavigation = [
  {
    group: 'Dashboard',
    items: [
      { name: 'Overview', href: '/admin', icon: LayoutDashboard }
    ]
  },
  {
    group: 'Content Management',
    items: [
      { name: 'Stories', href: '/admin/stories', icon: Book },
      { name: 'WordPress Sync', href: '/admin/wordpress-sync', icon: Globe }
    ]
  },
  {
    group: 'User Management',
    items: [
      { name: 'Users', href: '/admin/users', icon: Users },
      { name: 'Moderation', href: '/admin/moderation', icon: ShieldAlert }
    ]
  },
  {
    group: 'Insights & Reports',
    items: [
      { name: 'Analytics', href: '/admin/analytics', icon: LineChart },
      { name: 'Feedback', href: '/admin/feedback', icon: FileText }
    ]
  },
  {
    group: 'System',
    items: [
      { name: 'Settings', href: '/admin/settings', icon: Settings },
      { name: 'Email Services', href: '/admin/email-test', icon: Mail },
      { name: 'Database', href: '/admin/database', icon: Database }
    ]
  }
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location] = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-semibold">Bubble's Café</span>
              <span className="ml-2 text-sm text-muted-foreground">Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {/* User options could go here */}
          </div>
        </div>
      </header>
      
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar Navigation */}
        <aside className="hidden w-64 border-r bg-background md:block">
          <nav className="flex flex-col gap-2 p-4">
            {adminNavigation.map((group) => (
              <div key={group.group} className="space-y-2 pt-2 first:pt-0">
                <h3 className="px-2 text-xs font-semibold tracking-tight text-muted-foreground">
                  {group.group}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = location === item.href || 
                      (item.href !== '/admin' && location.startsWith(item.href));
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        className={`flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                          isActive 
                            ? 'bg-accent text-accent-foreground' 
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                        }`}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}