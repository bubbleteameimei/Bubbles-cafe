import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [location, setLocation] = useLocation();
  const [isDataExportPage, setIsDataExportPage] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [readingMode, setReadingMode] = useState<'scroll' | 'page'>('scroll');
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  // Check if user is trying to access the removed data export page
  const [, params] = useRoute('/settings/data-export');
  
  useEffect(() => {
    // If the URL contains /settings/data-export, redirect to privacy settings
    if (location === '/settings/data-export') {
      // Show toast notification explaining the redirection
      toast({
        title: "Data Export Feature Removed",
        description: "The data export functionality has been removed for security and performance reasons. Please contact support if you need your data.",
        variant: "destructive"
      });
      
      // Redirect to privacy settings page
      setLocation('/settings/privacy');
    }
  }, [location, toast, setLocation]);

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
      </Card>
    </div>
  );
}