import React, { useState, useCallback, memo, Suspense, lazy } from 'react';
import { SettingsLayout } from '@/components/layouts/SettingsLayout';
import { useTriggerSilentPing } from '@/utils/trigger-silent-ping';
import { Bell, BellRing, Mail, MessagesSquare, AlertCircle, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsSection } from '@/components/settings/SettingsSection';

// Lazy load components for tabs that aren't immediately visible
const NotificationSettingsForm = lazy(() => 
  import('@/components/forms/NotificationSettingsForm').then(mod => ({
    default: mod.NotificationSettingsForm
  }))
);

// Load tab content lazily - using relative paths to avoid module resolution issues
const WebsiteTabContent = lazy(() => import('../../components/settings/notification-tabs/WebsiteTabContent').then(
  module => ({ default: module.default })
));
const SocialTabContent = lazy(() => import('../../components/settings/notification-tabs/SocialTabContent').then(
  module => ({ default: module.default })
));
const SecurityTabContent = lazy(() => import('../../components/settings/notification-tabs/SecurityTabContent').then(
  module => ({ default: module.default })
));

// Create simple loading fallback
const TabLoadingFallback = memo(() => (
  <div className="w-full py-8 flex justify-center">
    <div className="animate-pulse flex flex-col space-y-4 w-full max-w-md">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
    </div>
  </div>
));
TabLoadingFallback.displayName = 'TabLoadingFallback';

// Memoized tab trigger component to reduce renders
const NotificationTabTrigger = memo(({ value, icon, label }: { 
  value: string; 
  icon: React.ReactNode; 
  label: string; 
}) => (
  <TabsTrigger value={value} className="flex items-center gap-2">
    {icon}
    <span>{label}</span>
  </TabsTrigger>
));
NotificationTabTrigger.displayName = 'NotificationTabTrigger';

// Memoized email tab content (primary tab)
const EmailTabContent = memo(() => (
  <TabsContent value="email" className="space-y-6">
    <SettingsSection 
      title="Email Notifications" 
      description="Configure email notifications for updates, recommendations, and important alerts."
      includeSeparator={false}
    >
      <Card>
        <CardContent className="pt-6">
          <Suspense fallback={<TabLoadingFallback />}>
            <NotificationSettingsForm />
          </Suspense>
        </CardContent>
      </Card>
    </SettingsSection>
  </TabsContent>
));
EmailTabContent.displayName = 'EmailTabContent';

export default function NotificationSettingsPage() {
  // Use useCallback for event handlers to prevent unnecessary re-renders
  const [activeTab, setActiveTab] = useState("email");
  
  // Track which tabs have been rendered for performance optimization
  const [renderedTabs, setRenderedTabs] = useState<Record<string, boolean>>({
    email: true, // Always render the default tab
  });
  
  // Optimize tab change handler
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    // Mark this tab as rendered so we keep it in the DOM
    setRenderedTabs(prev => ({
      ...prev,
      [value]: true
    }));
  }, []);

  return (
    <SettingsLayout 
      title="Notification Settings" 
      description="Control which notifications you receive and how they're delivered."
    >
      <Tabs 
        defaultValue={activeTab} 
        onValueChange={handleTabChange} 
        className="w-full"
      >
        <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-4 md:w-auto">
          <NotificationTabTrigger 
            value="email" 
            icon={<Mail className="h-4 w-4" />} 
            label="Email" 
          />
          <NotificationTabTrigger 
            value="website" 
            icon={<Bell className="h-4 w-4" />} 
            label="Website" 
          />
          <NotificationTabTrigger 
            value="social" 
            icon={<MessagesSquare className="h-4 w-4" />} 
            label="Social" 
          />
          <NotificationTabTrigger 
            value="security" 
            icon={<AlertCircle className="h-4 w-4" />} 
            label="Security" 
          />
        </TabsList>
        
        {/* Always render the initial tab */}
        <EmailTabContent />
        
        {/* Only render other tabs once they've been visited */}
        {renderedTabs.website && (
          <TabsContent value="website" className="space-y-6">
            <Suspense fallback={<TabLoadingFallback />}>
              <WebsiteTabContent />
            </Suspense>
          </TabsContent>
        )}
        
        {renderedTabs.social && (
          <TabsContent value="social" className="space-y-6">
            <Suspense fallback={<TabLoadingFallback />}>
              <SocialTabContent />
            </Suspense>
          </TabsContent>
        )}
        
        {renderedTabs.security && (
          <TabsContent value="security" className="space-y-6">
            <Suspense fallback={<TabLoadingFallback />}>
              <SecurityTabContent />
            </Suspense>
          </TabsContent>
        )}
      </Tabs>
    </SettingsLayout>
  );
}