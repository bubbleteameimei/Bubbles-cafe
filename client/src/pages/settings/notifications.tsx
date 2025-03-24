import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationSettingsForm } from '@/components/forms/NotificationSettingsForm';
import { useTriggerSilentPing } from '@/utils/trigger-silent-ping';
import { Button } from '@/components/ui/button';
import { BellRing } from 'lucide-react';

export default function NotificationSettingsPage() {
  const triggerSilentPing = useTriggerSilentPing();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Notification Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationSettingsForm />
        </CardContent>
      </Card>

      {/* Developer/test section - hidden in production */}
      {process.env.NODE_ENV !== 'production' && (
        <Card className="border-dashed border-muted-foreground/50">
          <CardHeader>
            <CardTitle className="text-muted-foreground">Developer Testing</CardTitle>
            <CardDescription>Utilities for testing notifications (development only)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="outline" 
                className="border-amber-200 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50 dark:hover:bg-amber-900/50"
                onClick={triggerSilentPing}
              >
                <BellRing className="mr-2 h-4 w-4" />
                Test Silent Ping
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}