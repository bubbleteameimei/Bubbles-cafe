import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  const [location] = useLocation();
  const [fontSize, setFontSize] = useState(16);
  const [readingMode, setReadingMode] = useState<'scroll' | 'page'>('scroll');
  const [offlineMode, setOfflineMode] = useState(false);

  // Font size handler
  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
    document.documentElement.style.setProperty('--base-font-size', `${value[0]}px`);
  };

  // Reading mode handler
  const handleReadingModeChange = (mode: 'scroll' | 'page') => {
    setReadingMode(mode);
    // Apply reading mode changes
    document.body.dataset.readingMode = mode;
  };

  // Offline mode handler
  const handleOfflineModeChange = (enabled: boolean) => {
    setOfflineMode(enabled);
    if (enabled) {
      // Enable service worker for offline support
      navigator.serviceWorker?.register('/service-worker.js');
    } else {
      // Disable service worker
      navigator.serviceWorker?.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Settings & Accessibility</h1>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Theme</h2>
          <div className="flex items-center justify-between">
            <span>Dark Mode</span>
            <ThemeToggle />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Font Size</h2>
          <div className="space-y-2">
            <Slider
              value={[fontSize]}
              onValueChange={handleFontSizeChange}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground">
              Current size: {fontSize}px
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Reading Mode</h2>
          <div className="flex gap-4">
            <Button
              variant={readingMode === 'scroll' ? 'default' : 'outline'}
              onClick={() => handleReadingModeChange('scroll')}
            >
              Scroll Mode
            </Button>
            <Button
              variant={readingMode === 'page' ? 'default' : 'outline'}
              onClick={() => handleReadingModeChange('page')}
            >
              Page Mode
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Offline Mode</h2>
          <div className="flex items-center space-x-4">
            <Switch
              checked={offlineMode}
              onCheckedChange={handleOfflineModeChange}
              id="offline-mode"
            />
            <label htmlFor="offline-mode">
              Enable offline reading
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            When enabled, stories will be available offline
          </p>
        </div>
      </Card>
    </div>
  );
}
