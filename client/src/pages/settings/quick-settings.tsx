import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useTheme } from '@/components/theme-provider';

export default function QuickSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = React.useState(16);
  const [contrast, setContrast] = React.useState(100);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Quick Adjustments</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Settings</CardTitle>
          <CardDescription>Quickly adjust common display settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Font Size</Label>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground">
              Font size: {fontSize}px
            </div>
          </div>

          <div className="space-y-4">
            <Label>Contrast</Label>
            <Slider
              value={[contrast]}
              onValueChange={(value) => setContrast(value[0])}
              min={50}
              max={200}
              step={10}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground">
              Contrast: {contrast}%
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Dark Mode</Label>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              size="md"
            />
          </div>

          <div
            style={{ fontSize: `${fontSize}px`, filter: `contrast(${contrast}%)` }}
            className="p-4 border rounded-md mt-4"
          >
            <h3 className="font-semibold mb-2">Live Preview</h3>
            <p>This text shows how your content will look with the current settings.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
