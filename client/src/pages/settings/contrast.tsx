import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export default function ContrastSettingsPage() {
  const [contrast, setContrast] = React.useState(100);
  const [highContrastMode, setHighContrastMode] = React.useState(false);

  const handleContrastChange = (value: number[]) => {
    setContrast(value[0]);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Contrast Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Display Contrast</CardTitle>
          <CardDescription>Adjust visibility settings for better readability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast">High Contrast Mode</Label>
            <Switch 
              id="high-contrast"
              checked={highContrastMode}
              onCheckedChange={setHighContrastMode}
            />
          </div>
          
          <div className="space-y-4">
            <Label>Contrast Level</Label>
            <Slider
              value={[contrast]}
              onValueChange={handleContrastChange}
              min={50}
              max={200}
              step={10}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground">
              Current contrast: {contrast}%
            </div>
          </div>

          <div className="p-4 border rounded-md">
            <h3 className="font-semibold mb-2">Preview Text</h3>
            <p style={{ filter: `contrast(${contrast}%)` }} className={highContrastMode ? "text-primary" : ""}>
              This text shows how your content will look with the current contrast settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
