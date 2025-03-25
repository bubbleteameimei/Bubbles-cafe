import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFontSize } from "@/hooks/use-font-size";
import { useFontFamily, FontFamilyKey, FONT_FAMILIES } from "@/hooks/use-font-family";

export default function FontSettingsPage() {
  const { fontSize, updateFontSize } = useFontSize();
  const { fontFamily, updateFontFamily, availableFonts } = useFontFamily();

  // Load fonts on component mount
  useEffect(() => {
    // Preload all fonts for preview
    const fontUrls = {
      'cormorant': 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap',
      'merriweather': 'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&display=swap',
      'lora': 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap',
      'roboto': 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap',
      'opensans': 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap',
      'literata': 'https://fonts.googleapis.com/css2?family=Literata:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap',
    };
    
    Object.entries(fontUrls).forEach(([font, url]) => {
      const existingLink = document.querySelector(`link[href="${url}"]`);
      if (!existingLink) {
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = url;
        document.head.appendChild(fontLink);
      }
    });
  }, []);

  const handleFontSizeChange = (value: number[]) => {
    updateFontSize(value[0]);
  };

  const handleFontFamilyChange = (value: string) => {
    if (Object.keys(FONT_FAMILIES).includes(value)) {
      updateFontFamily(value as FontFamilyKey);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Typography Settings</h1>
      <p className="text-muted-foreground mb-4">Customize your reading experience with our expanded font options. Choose from a collection of carefully selected typefaces for different reading preferences, from traditional serif fonts to modern sans-serif options. Your font selections will be applied to all stories throughout the site.</p>

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
              {Object.entries(availableFonts).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <span>{info.name}</span>
                    <span className="text-xs text-muted-foreground">({info.type})</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Story Content Preview</h2>
          <div className="space-y-4">
            <div
              style={{ 
                fontSize: `${fontSize}px`, 
                fontFamily: availableFonts[fontFamily as FontFamilyKey].family
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
