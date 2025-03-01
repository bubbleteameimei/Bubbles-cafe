import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useUserSettings } from "@/hooks/use-user-settings";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Loader2 } from "lucide-react";

export default function OfflineSettingsPage() {
  const { settings, updateSettings, isPending } = useUserSettings();

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleOfflineChange = async (key: keyof typeof settings.offlineAccess, value: boolean | number) => {
    console.log(`[Settings] Updating offline access setting ${key} to ${value}`);
    await updateSettings({
      offlineAccess: {
        ...settings.offlineAccess,
        [key]: value
      }
    });
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold">Offline Access</h1>
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="offline-access">Enable Offline Access</Label>
                <p className="text-sm text-muted-foreground">
                  Access content when you're offline
                </p>
              </div>
              <Switch
                id="offline-access"
                checked={settings.offlineAccess.enabled}
                onCheckedChange={(checked) => handleOfflineChange('enabled', checked)}
                disabled={isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-sync">Auto Sync</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync content when online
                </p>
              </div>
              <Switch
                id="auto-sync"
                checked={settings.offlineAccess.autoSync}
                onCheckedChange={(checked) => handleOfflineChange('autoSync', checked)}
                disabled={isPending || !settings.offlineAccess.enabled}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Storage Limit (MB)</Label>
                <span className="text-sm text-muted-foreground">
                  {settings.offlineAccess.storageLimit} MB
                </span>
              </div>
              <Slider
                value={[settings.offlineAccess.storageLimit]}
                onValueChange={([value]) => handleOfflineChange('storageLimit', value)}
                min={50}
                max={500}
                step={50}
                disabled={isPending || !settings.offlineAccess.enabled}
              />
            </div>
          </div>
        </Card>
      </div>
    </ErrorBoundary>
  );
}