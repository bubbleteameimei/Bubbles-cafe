import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FontSettingsPage() {
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("inter");

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
    // Only applying to story content via specific CSS variable
    document.documentElement.style.setProperty('--story-font-size', `${value[0]}px`);
  };

  const handleFontFamilyChange = (value: string) => {
    setFontFamily(value);
    // Only applying to story content via specific CSS variable
    document.documentElement.style.setProperty('--story-font-family', value);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Font Settings</h1>
      <p className="text-muted-foreground mb-4">These settings will only affect how story content appears, not the overall website interface.</p>

      <Card className="p-6 space-y-6">
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
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Font Family</h2>
          <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inter">Inter</SelectItem>
              <SelectItem value="roboto">Roboto</SelectItem>
              <SelectItem value="opensans">Open Sans</SelectItem>
              <SelectItem value="lora">Lora</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Story Content Preview</h2>
          <div className="space-y-4">
            <div
              style={{ fontSize: `${fontSize}px`, fontFamily: fontFamily }}
              className="p-4 border rounded-md bg-muted/50"
            >
              <h3 className="font-semibold mb-2">Story Sample</h3>
              <p>The ancient house stood silently at the end of the lane, its windows like dark eyes watching my approach.</p>
              <p className="mt-2">
                A cold breeze carried whispers through the trees as I approached the doorway, my hand trembling as I reached for the handle.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                This preview shows how story text will appear with your selected settings.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
