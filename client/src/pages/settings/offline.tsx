import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

export default function OfflineSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Offline Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Offline Access</CardTitle>
          <CardDescription>Manage your offline reading preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="offline-mode">Enable Offline Mode</Label>
            <Switch id="offline-mode" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Storage Usage</Label>
              <span className="text-sm text-muted-foreground">2.1 GB / 5 GB</span>
            </div>
            <Progress value={42} />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-download">Auto-Download New Stories</Label>
            <Switch id="auto-download" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="media-download">Download Media Content</Label>
            <Switch id="media-download" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
