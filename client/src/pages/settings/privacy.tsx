import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserSettings } from "@/hooks/use-user-settings";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Loader2 } from "lucide-react";

type VisibilityOption = "public" | "private" | "friends";

export default function PrivacySettingsPage() {
  const { settings, updateSettings, isPending } = useUserSettings();

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleVisibilityChange = async (key: 'profileVisibility' | 'activityVisibility', value: VisibilityOption) => {
    console.log(`[Settings] Updating privacy setting ${key} to ${value}`);
    await updateSettings({
      privacy: {
        ...settings.privacy,
        [key]: value
      }
    });
  };

  const handleTwoFactorChange = async (enabled: boolean) => {
    console.log(`[Settings] Updating two-factor authentication to ${enabled}`);
    await updateSettings({
      privacy: {
        ...settings.privacy,
        twoFactorEnabled: enabled
      }
    });
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold">Privacy & Security</h1>
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Profile Visibility</Label>
              <Select
                value={settings.privacy.profileVisibility}
                onValueChange={(value: VisibilityOption) => handleVisibilityChange('profileVisibility', value)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Activity Visibility</Label>
              <Select
                value={settings.privacy.activityVisibility}
                onValueChange={(value: VisibilityOption) => handleVisibilityChange('activityVisibility', value)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                id="two-factor"
                checked={settings.privacy.twoFactorEnabled}
                onCheckedChange={handleTwoFactorChange}
                disabled={isPending}
              />
            </div>
          </div>
        </Card>
      </div>
    </ErrorBoundary>
  );
}