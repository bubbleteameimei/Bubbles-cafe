import React from 'react';
import { SettingsLayout } from '@/components/layouts/SettingsLayout';
import { NotificationSettingsForm } from '@/components/forms/NotificationSettingsForm';
import { useTriggerSilentPing } from '@/utils/trigger-silent-ping';
import { Bell, BellRing, Mail, MessagesSquare, AlertCircle, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsSection } from '@/components/settings/SettingsSection';

export default function NotificationSettingsPage() {
  const triggerSilentPing = useTriggerSilentPing();
  const [activeTab, setActiveTab] = React.useState("email");

  return (
    <SettingsLayout 
      title="Notification Settings" 
      description="Control which notifications you receive and how they're delivered."
    >
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-4 md:w-auto">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </TabsTrigger>
          <TabsTrigger value="website" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Website</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <MessagesSquare className="h-4 w-4" />
            <span>Social</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Email Notifications Tab */}
        <TabsContent value="email" className="space-y-6">
          <SettingsSection 
            title="Email Notifications" 
            description="Configure email notifications for updates, recommendations, and important alerts."
            includeSeparator={false}
          >
            <Card>
              <CardContent className="pt-6">
                <NotificationSettingsForm />
              </CardContent>
            </Card>
          </SettingsSection>
        </TabsContent>
        
        {/* Website Notifications Tab */}
        <TabsContent value="website" className="space-y-6">
          <SettingsSection
            title="Browser Notifications"
            description="Manage notifications that appear in your browser while using the site."
            includeSeparator={false}
          >
            <Card>
              <CardHeader>
                <CardTitle>Browser Notifications</CardTitle>
                <CardDescription>
                  Configure which notifications appear in your browser
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Browser notifications are currently disabled for this browser. 
                  Click "Enable Notifications" to receive updates while browsing the site.
                </p>
                <div className="bg-muted p-4 rounded-md mb-4">
                  <p className="text-sm font-medium">Permission Required</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your browser requires permission to show notifications. 
                    Please accept the prompt when it appears.
                  </p>
                </div>
              </CardContent>
            </Card>
          </SettingsSection>
        </TabsContent>
        
        {/* Social Notifications Tab */}
        <TabsContent value="social" className="space-y-6">
          <SettingsSection
            title="Social Interactions"
            description="Control notifications for social interactions like comments, mentions, and follows."
            includeSeparator={false}
          >
            <Card>
              <CardHeader>
                <CardTitle>Social Activity</CardTitle>
                <CardDescription>
                  Configure notifications for social interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">Comment Notifications</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Receive notifications when someone comments on your stories
                      </p>
                    </div>
                    <div className="text-sm font-medium text-primary">
                      Enabled
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">Mention Notifications</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Receive notifications when someone mentions you in a comment
                      </p>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Disabled
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Follow Notifications</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Receive notifications when someone follows your profile
                      </p>
                    </div>
                    <div className="text-sm font-medium text-primary">
                      Enabled
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SettingsSection>
        </TabsContent>
        
        {/* Security Notifications Tab */}
        <TabsContent value="security" className="space-y-6">
          <SettingsSection
            title="Security Notifications"
            description="Configure notifications for important security events related to your account."
            includeSeparator={false}
          >
            <Card>
              <CardHeader>
                <CardTitle>Security Alerts</CardTitle>
                <CardDescription>
                  Manage notifications for account security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900/50 rounded-md mb-4">
                  <p className="font-medium flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                    <AlertCircle className="h-4 w-4" />
                    Important Notice
                  </p>
                  <p className="text-sm mt-1 text-yellow-700 dark:text-yellow-300">
                    Security notifications cannot be disabled completely as they're essential for account protection.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">Login Notifications</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get notified when your account is accessed from a new device or location
                      </p>
                    </div>
                    <div className="text-sm font-medium text-primary">
                      Always On
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">Password Changes</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Receive alerts when your password is changed
                      </p>
                    </div>
                    <div className="text-sm font-medium text-primary">
                      Always On
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Account Activity</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get a weekly summary of account activity and security status
                      </p>
                    </div>
                    <div className="text-sm font-medium text-primary">
                      Enabled
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SettingsSection>
        </TabsContent>
      </Tabs>
    </SettingsLayout>
  );
}