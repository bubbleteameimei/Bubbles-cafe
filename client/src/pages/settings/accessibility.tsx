import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUserSettings } from "@/hooks/use-user-settings";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Loader2 } from "lucide-react";

export default function AccessibilitySettingsPage() {
  const { settings, updateSettings, isPending } = useUserSettings();

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleAccessibilityChange = async (key: keyof typeof settings.accessibility, value: boolean) => {
    console.log(`[Settings] Updating accessibility setting ${key} to ${value}`);
    await updateSettings({
      accessibility: {
        ...settings.accessibility,
        [key]: value
      }
    });
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold">Accessibility Settings</h1>
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Increase contrast for better visibility
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={settings.accessibility.highContrast}
                onCheckedChange={(checked) => handleAccessibilityChange('highContrast', checked)}
                disabled={isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reduced-motion">Reduced Motion</Label>
                <p className="text-sm text-muted-foreground">
                  Minimize animations and transitions
                </p>
              </div>
              <Switch
                id="reduced-motion"
                checked={settings.accessibility.reducedMotion}
                onCheckedChange={(checked) => handleAccessibilityChange('reducedMotion', checked)}
                disabled={isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="screen-reader">Screen Reader Optimization</Label>
                <p className="text-sm text-muted-foreground">
                  Enhanced compatibility with screen readers
                </p>
              </div>
              <Switch
                id="screen-reader"
                checked={settings.accessibility.screenReader}
                onCheckedChange={(checked) => handleAccessibilityChange('screenReader', checked)}
                disabled={isPending}
              />
            </div>
          </div>
        </Card>
      </div>
    </ErrorBoundary>
  );
}