import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { useFontSize } from "@/hooks/use-font-size";
import { useFontFamily } from "@/hooks/use-font-family";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";
import { 
  Settings as SettingsIcon, 
  User, 
  Palette, 
  Type,
  Volume2,
  Bell,
  Shield,
  Database,
  Download
} from "lucide-react";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  const { theme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const { fontFamily, setFontFamily } = useFontFamily();
  const { toast } = useToast();
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleExportData = () => {
    toast({
      title: "Data Export",
      description: "Your data export will be available shortly.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid gap-6">
        {/* User Profile Settings */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Username</Label>
                  <p className="text-muted-foreground">{user.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Separator />
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-toggle">Theme</Label>
              <ThemeToggleButton />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <Label className="text-sm font-medium">Font Size</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                >
                  A-
                </Button>
                <span className="text-sm min-w-16 text-center">{fontSize}px</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                >
                  A+
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-medium">Font Family</Label>
              <div className="grid grid-cols-2 gap-2">
                {['inter', 'openSans', 'crimsonText', 'playfair'].map((font) => (
                  <Button
                    key={font}
                    variant={fontFamily === font ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFontFamily(font as any)}
                    className="capitalize"
                  >
                    {font.replace(/([A-Z])/g, ' $1')}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reading Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Reading Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save">Auto-save Reading Progress</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save your reading position
                </p>
              </div>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound-effects">Sound Effects</Label>
                <p className="text-sm text-muted-foreground">
                  Enable audio feedback for interactions
                </p>
              </div>
              <Switch
                id="sound-effects"
                checked={soundEffects}
                onCheckedChange={setSoundEffects}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about new stories and updates
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analytics">Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve the platform by sharing usage data
                </p>
              </div>
              <Switch
                id="analytics"
                checked={analytics}
                onCheckedChange={setAnalytics}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">
                  Download a copy of your reading data and bookmarks
                </p>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}