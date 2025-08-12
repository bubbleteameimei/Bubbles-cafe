import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFontSize } from "@/hooks/use-font-size";
import { useFontFamily, FontFamilyKey } from "@/hooks/use-font-family";
import { useTheme } from "@/components/theme-provider"; // setTheme provided via useThemeContext alias
import { 
  Type, 
  Palette, 
  Settings, 
  BookOpen,
  Minus,
  Plus,
  Moon,
  Sun
} from "lucide-react";

interface ReaderControlsProps {
  onShare?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

export function ReaderControls({ onShare, onBookmark, isBookmarked }: ReaderControlsProps) {
  const [fontDialogOpen, setFontDialogOpen] = useState(false);
  const { fontSize, increaseFontSize, decreaseFontSize, resetFontSize } = useFontSize();
  const { fontFamily, setFontFamily } = useFontFamily();
  const { theme, setTheme } = useTheme();

  const handleFontFamilyChange = useCallback((value: string) => {
    setFontFamily(value as FontFamilyKey);
  }, [setFontFamily]);

  const handleThemeToggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const fontOptions = [
    { value: 'system', label: 'System Font' },
    { value: 'serif', label: 'Serif' },
    { value: 'sans', label: 'Sans Serif' },
    { value: 'crimson', label: 'Crimson Text' },
    { value: 'fell', label: 'IM Fell English' }
  ];

  return (
    <div className="reader-controls">
      {/* Floating Action Bar */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
        {/* Font Settings Dialog */}
        <Dialog open={fontDialogOpen} onOpenChange={setFontDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
              aria-label="Font settings"
            >
              <Type className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reading Preferences</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Font Size */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Font Size</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decreaseFontSize}
                    disabled={fontSize <= 12}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Slider
                    value={[fontSize]}
                    onValueChange={([value]) => {
                      // Update font size through hook
                      const diff = value - fontSize;
                      if (diff > 0) {
                        for (let i = 0; i < Math.abs(diff); i++) increaseFontSize();
                      } else {
                        for (let i = 0; i < Math.abs(diff); i++) decreaseFontSize();
                      }
                    }}
                    min={12}
                    max={24}
                    step={1}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={increaseFontSize}
                    disabled={fontSize >= 24}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  {fontSize}px
                </div>
              </div>

              {/* Font Family */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Font Family</label>
                <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Theme Toggle */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Theme</label>
                <Button
                  variant="outline"
                  onClick={handleThemeToggle}
                  className="w-full justify-start"
                >
                  {theme === 'dark' ? (
                    <>
                      <Moon className="h-4 w-4 mr-2" />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4 mr-2" />
                      Light Mode
                    </>
                  )}
                </Button>
              </div>

              {/* Reset Button */}
              <Button
                variant="outline"
                onClick={resetFontSize}
                className="w-full"
              >
                Reset to Defaults
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Theme Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleThemeToggle}
          className="rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Bookmark Button */}
        {onBookmark && (
          <Button
            variant={isBookmarked ? "default" : "outline"}
            size="icon"
            onClick={onBookmark}
            className="rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <BookOpen className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Top Controls Bar */}
      <div className="fixed top-4 right-4 flex gap-2 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={onShare}
          className="bg-background/80 backdrop-blur-sm"
        >
          Share
        </Button>
      </div>
    </div>
  );
}

export default ReaderControls;