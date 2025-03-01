import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FontSettingsPage() {
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("inter");

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
    document.documentElement.style.setProperty('--base-font-size', `${value[0]}px`);
  };

  const handleFontFamilyChange = (value: string) => {
    setFontFamily(value);
    document.documentElement.style.setProperty('--font-family', value);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Font Settings</h1>

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
          <h2 className="text-xl font-semibold">Preview</h2>
          <div className="space-y-4">
            <div
              style={{ fontSize: `${fontSize}px`, fontFamily: fontFamily }}
              className="p-4 border rounded-md bg-muted/50"
            >
              <h3 className="font-semibold mb-2">Preview Text</h3>
              <p>The quick brown fox jumps over the lazy dog</p>
              <p className="mt-2">
                This is how your text will look with the current settings.
                Adjust the size and font to find what works best for you.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
