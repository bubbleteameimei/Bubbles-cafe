import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function DisplaySettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Display Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
          <CardDescription>Customize the appearance of your horror reading experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Color Theme</Label>
            <RadioGroup defaultValue="dark">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">Dark Theme</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="blood" id="blood" />
                <Label htmlFor="blood">Blood Moon</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="haunted" id="haunted" />
                <Label htmlFor="haunted">Haunted Forest</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="ambient">Ambient Effects</Label>
            <Switch id="ambient" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="animations">Horror Animations</Label>
            <Switch id="animations" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
