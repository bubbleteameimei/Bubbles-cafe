import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function NotificationSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Notification Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Story Notifications</CardTitle>
          <CardDescription>Manage your horror story notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="new-stories">New Story Alerts</Label>
            <Switch id="new-stories" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="comments">Comment Notifications</Label>
            <Switch id="comments" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="author-updates">Author Updates</Label>
            <Switch id="author-updates" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="achievements">Achievement Unlocks</Label>
            <Switch id="achievements" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
