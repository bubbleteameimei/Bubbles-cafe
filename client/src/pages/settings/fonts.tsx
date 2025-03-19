import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FontSettingsPage() {
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("newsreader");

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
    // Only applying to story content via specific CSS variable
    document.documentElement.style.setProperty('--story-font-size', `${value[0]}px`);
  };

  const handleFontFamilyChange = (value: string) => {
    setFontFamily(value);
    
    // Map the selected value to the actual font-family CSS
    const fontFamilyValue = 
      value === 'newsreader' ? "'Newsreader', serif" : 
      value === 'castoro' ? "'Castoro Titling', serif" :
      value === 'gilda' ? "'Gilda Display', serif" : 
      "'Dancing Script', cursive";
    
    // Only applying to story content via specific CSS variable
    document.documentElement.style.setProperty('--story-font-family', fontFamilyValue);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Typography Settings</h1>
      <p className="text-muted-foreground mb-4">Select from our carefully curated typography system featuring Castoro Titling for headlines, Gilda Display for subheadings, Newsreader for body text, and Dancing Script for italics. These settings let you customize your reading experience.</p>

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
              <SelectItem value="newsreader">Newsreader (Body Text)</SelectItem>
              <SelectItem value="castoro">Castoro Titling (H1)</SelectItem>
              <SelectItem value="gilda">Gilda Display (H2-H3)</SelectItem>
              <SelectItem value="dancing">Dancing Script (Italics)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Story Content Preview</h2>
          <div className="space-y-4">
            <div
              style={{ 
                fontSize: `${fontSize}px`, 
                fontFamily: fontFamily === 'newsreader' ? "'Newsreader', serif" : 
                            fontFamily === 'castoro' ? "'Castoro Titling', serif" :
                            fontFamily === 'gilda' ? "'Gilda Display', serif" : 
                            "'Dancing Script', cursive"
              }}
              className="p-4 border rounded-md bg-muted/50"
            >
              <h3 className="font-semibold mb-2">Story Sample</h3>
              <p>The ancient house stood silently at the end of the lane, its windows like dark eyes watching my approach.</p>
              <p className="mt-2">
                A cold breeze carried whispers through the trees as I approached the doorway, my hand trembling as I reached for the handle.
              </p>
              <p className="mt-2">
                <em>The memories of that night still haunt my dreams, echoing in the shadows of my mind.</em>
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
