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

      {/* Developer testing section removed per user request */}
    </div>
  );
}