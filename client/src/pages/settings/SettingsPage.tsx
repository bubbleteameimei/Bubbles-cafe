import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Moon, Sun, Trash2 } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const [location] = useLocation();
  const [fontSize, setFontSize] = useState(16);
  const [readingMode, setReadingMode] = useState<'scroll' | 'page'>('scroll');
  const [offlineMode, setOfflineMode] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logoutMutation } = useAuth();

  // Font size handler
  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
    document.documentElement.style.setProperty('--base-font-size', `${value[0]}px`);
  };

  // Reading mode handler
  const handleReadingModeChange = (mode: 'scroll' | 'page') => {
    setReadingMode(mode);
    document.body.dataset.readingMode = mode;
  };

  // Offline mode handler
  const handleOfflineModeChange = (enabled: boolean) => {
    setOfflineMode(enabled);
    if (enabled) {
      navigator.serviceWorker?.register('/service-worker.js');
    } else {
      navigator.serviceWorker?.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }
  };

  // Account deletion handler
  const handleAccountDeletion = async () => {
    try {
      const response = await fetch('/api/users/me', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Log out after successful deletion
      if (logoutMutation) {
        await logoutMutation.mutateAsync();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Settings & Accessibility</h1>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Theme</h2>
          <div className="flex items-center justify-between gap-4">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              className="w-full"
              onClick={() => setTheme('light')}
            >
              <Sun className="h-4 w-4 mr-2" />
              Light Mode
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              className="w-full"
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-4 w-4 mr-2" />
              Dark Mode
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Font Size</h2>
          <div className="space-y-4">
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
            <div style={{ fontSize: `${fontSize}px` }} className="p-4 border rounded-md bg-muted/50">
              Preview Text: The quick brown fox jumps over the lazy dog
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Reading Mode</h2>
          <div className="flex gap-4">
            <Button
              variant={readingMode === 'scroll' ? 'default' : 'outline'}
              onClick={() => handleReadingModeChange('scroll')}
              className="w-full"
            >
              Scroll Mode
            </Button>
            <Button
              variant={readingMode === 'page' ? 'default' : 'outline'}
              onClick={() => handleReadingModeChange('page')}
              className="w-full"
            >
              Page Mode
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Offline Mode</h2>
          <div className="flex items-center space-x-4 p-4 border rounded-md bg-card">
            <Switch
              checked={offlineMode}
              onCheckedChange={handleOfflineModeChange}
              id="offline-mode"
            />
            <label htmlFor="offline-mode" className="flex-grow cursor-pointer">
              <div className="font-medium">Enable offline reading</div>
              <p className="text-sm text-muted-foreground mt-1">
                When enabled, stories will be available offline
              </p>
            </label>
          </div>
        </div>

        {user && (
          <div className="space-y-4 pt-6 border-t">
            <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <h3 className="font-medium mb-2">Delete Account</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Your Account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account and remove all your data, including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>All your stories and drafts</li>
                        <li>Your reading history and preferences</li>
                        <li>Your profile information</li>
                        <li>Your achievements and statistics</li>
                      </ul>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleAccountDeletion}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Yes, Delete My Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}