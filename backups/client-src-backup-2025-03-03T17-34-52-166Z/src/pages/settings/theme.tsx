import { useTheme } from "@/lib/theme-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sun, Moon } from "lucide-react";

export default function ThemeSettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Theme Settings</h1>

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

        {/* Preview section showing how the theme looks */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Preview</h2>
          <div className="space-y-4 rounded-lg border p-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Sample Content</h3>
              <p className="text-muted-foreground">
                This is how your content will look with the selected theme.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
