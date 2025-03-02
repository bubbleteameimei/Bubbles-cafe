import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationSettingsForm } from '@/components/forms/NotificationSettingsForm';

export default function NotificationSettingsPage() {
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
    </div>
  );
}