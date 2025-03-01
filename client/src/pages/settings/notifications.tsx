import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUserSettings } from "@/hooks/use-user-settings";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Loader2 } from "lucide-react";

export default function NotificationSettingsPage() {
  const { settings, updateSettings, isPending } = useUserSettings();

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleNotificationChange = async (key: keyof typeof settings.notifications, value: boolean) => {
    console.log(`[Settings] Updating notification setting ${key} to ${value}`);
    await updateSettings({
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    });
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold">Notification Preferences</h1>
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates and alerts via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.notifications.email}
                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                disabled={isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications on your device
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.notifications.push}
                onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                disabled={isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="insite-notifications">In-Site Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications while browsing
                </p>
              </div>
              <Switch
                id="insite-notifications"
                checked={settings.notifications.inSite}
                onCheckedChange={(checked) => handleNotificationChange('inSite', checked)}
                disabled={isPending}
              />
            </div>
          </div>
        </Card>
      </div>
    </ErrorBoundary>
  );
}