import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function PrivacySettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Privacy Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Privacy Controls</CardTitle>
          <CardDescription>Manage your privacy preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="profile-visible">Public Profile Visibility</Label>
            <Switch id="profile-visible" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="reading-history">Share Reading History</Label>
            <Switch id="reading-history" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="anonymous-comments">Anonymous Commenting</Label>
            <Switch id="anonymous-comments" />
          </div>
          
          <div className="mt-6">
            <Button variant="destructive">
              Delete Account Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
