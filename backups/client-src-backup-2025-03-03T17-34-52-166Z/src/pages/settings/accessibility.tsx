import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export default function AccessibilitySettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Accessibility Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Reading Experience</CardTitle>
          <CardDescription>Customize your reading experience for better accessibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast">High Contrast Mode</Label>
            <Switch id="high-contrast" />
          </div>
          
          <div className="space-y-2">
            <Label>Text Size</Label>
            <Slider defaultValue={[16]} max={24} min={12} step={1} />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="reduce-motion">Reduce Motion</Label>
            <Switch id="reduce-motion" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="screen-reader">Screen Reader Optimization</Label>
            <Switch id="screen-reader" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
