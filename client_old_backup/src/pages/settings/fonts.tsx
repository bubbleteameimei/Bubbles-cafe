import { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFontSize } from "@/hooks/use-font-size";
import { useFontFamily, FontFamilyKey, FONT_FAMILIES } from "@/hooks/use-font-family";
import { SettingsLayout } from '@/components/layouts/SettingsLayout';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Type, AlignLeft, LayoutGrid, AlignVerticalSpaceBetween, Text, Baseline, Check, BookOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function FontSettingsPage() {
  const { fontSize, updateFontSize } = useFontSize();
  const { fontFamily, updateFontFamily, availableFonts } = useFontFamily();
  const [activeTab, setActiveTab] = useState("fonts");
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [paragraphSpacing, setParagraphSpacing] = useState(1.2);
  const [textAlignment, setTextAlignment] = useState("left");
  const [isLoading, setIsLoading] = useState(false);

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
    
    // Apply custom line spacing
    document.documentElement.style.setProperty('--reader-line-spacing', lineSpacing.toString());
    
    // Apply paragraph spacing
    document.documentElement.style.setProperty('--reader-paragraph-spacing', `${paragraphSpacing}em`);
  }, [lineSpacing, paragraphSpacing]);

  const handleFontSizeChange = (value: number[]) => {
    updateFontSize(value[0]);
  };

  const handleFontFamilyChange = (value: string) => {
    if (Object.keys(FONT_FAMILIES).includes(value)) {
      updateFontFamily(value as FontFamilyKey);
    }
  };
  
  const handleLineSpacingChange = (value: number[]) => {
    setLineSpacing(value[0]);
    document.documentElement.style.setProperty('--reader-line-spacing', value[0].toString());
  };
  
  const handleParagraphSpacingChange = (value: number[]) => {
    setParagraphSpacing(value[0]);
    document.documentElement.style.setProperty('--reader-paragraph-spacing', `${value[0]}em`);
  };
  
  const saveReaderSettings = async () => {
    setIsLoading(true);
    
    // Simulate saving settings to the server
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Typography settings saved", {
        description: "Your reading preferences have been updated."
      });
    } catch (error) {
      toast.error("Failed to save settings", {
        description: "Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsLayout title="Typography Settings" description="Customize your reading experience with fonts and text display options">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 w-full md:w-auto">
          <TabsTrigger value="fonts" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <span>Fonts</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <AlignVerticalSpaceBetween className="h-4 w-4" />
            <span>Spacing</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Preview</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Fonts Tab */}
        <TabsContent value="fonts">
          <Card>
            <CardHeader>
              <CardTitle className="uppercase tracking-wider text-sm font-semibold">Font Settings</CardTitle>
              <CardDescription>
                Choose your preferred font family and size for a customized reading experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2 uppercase tracking-wider">Font Size</h3>
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Small</span>
                      <span className="text-sm font-medium">{fontSize}px</span>
                      <span className="text-sm text-muted-foreground">Large</span>
                    </div>
                    <Slider
                      value={[fontSize]}
                      onValueChange={handleFontSizeChange}
                      min={12}
                      max={24}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>12px</span>
                      <span>16px</span>
                      <span>20px</span>
                      <span>24px</span>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div>
                  <h3 className="text-sm font-medium mb-2 uppercase tracking-wider">Font Family</h3>
                  <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a font" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="grid gap-2 p-2">
                        <h4 className="text-xs font-semibold text-muted-foreground">Serif Fonts</h4>
                        {Object.entries(availableFonts)
                          .filter(([_, info]) => info.type === 'serif')
                          .map(([key, info]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center justify-between w-full">
                                <span style={{ fontFamily: info.family }}>{info.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">Serif</span>
                              </div>
                            </SelectItem>
                          ))}
                        
                        <Separator className="my-1" />
                        
                        <h4 className="text-xs font-semibold text-muted-foreground">Sans-Serif Fonts</h4>
                        {Object.entries(availableFonts)
                          .filter(([_, info]) => info.type === 'sans-serif')
                          .map(([key, info]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center justify-between w-full">
                                <span style={{ fontFamily: info.family }}>{info.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">Sans</span>
                              </div>
                            </SelectItem>
                          ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="bg-muted/40 rounded-lg p-4 mt-2">
                  <div className="mb-2 flex items-center gap-2">
                    <Text className="h-4 w-4 text-primary/70" />
                    <h3 className="text-sm font-medium uppercase tracking-wider">Selected Font: {availableFonts[fontFamily as FontFamilyKey].name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {availableFonts[fontFamily as FontFamilyKey].description}
                  </p>
                  <div
                    style={{ 
                      fontSize: `${fontSize}px`, 
                      fontFamily: availableFonts[fontFamily as FontFamilyKey].family
                    }}
                    className="py-2"
                  >
                    <span>Sample: </span>
                    <span className="font-normal">Normal, </span>
                    <span className="font-bold">Bold, </span>
                    <span className="italic">Italic</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button 
                variant="outline"
                onClick={() => {
                  // Reset to defaults
                  updateFontSize(16);
                  updateFontFamily('merriweather');
                }}
              >
                Reset to Defaults
              </Button>
              <Button 
                onClick={saveReaderSettings}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    <span>Save Settings</span>
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Layout Tab */}
        <TabsContent value="layout">
          <Card>
            <CardHeader>
              <CardTitle className="uppercase tracking-wider text-sm font-semibold">Text Layout</CardTitle>
              <CardDescription>
                Adjust spacing and alignment for optimal reading comfort
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlignVerticalSpaceBetween className="h-4 w-4 text-primary/70" />
                    <h3 className="text-sm font-medium uppercase tracking-wider">Line Spacing</h3>
                  </div>
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Compact</span>
                      <span className="text-sm font-medium">{lineSpacing.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">Spacious</span>
                    </div>
                    <Slider
                      value={[lineSpacing]}
                      onValueChange={handleLineSpacingChange}
                      min={1}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Baseline className="h-4 w-4 text-primary/70" />
                    <h3 className="text-sm font-medium uppercase tracking-wider">Paragraph Spacing</h3>
                  </div>
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tight</span>
                      <span className="text-sm font-medium">{paragraphSpacing.toFixed(1)}em</span>
                      <span className="text-sm text-muted-foreground">Loose</span>
                    </div>
                    <Slider
                      value={[paragraphSpacing]}
                      onValueChange={handleParagraphSpacingChange}
                      min={0.8}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlignLeft className="h-4 w-4 text-primary/70" />
                    <h3 className="text-sm font-medium uppercase tracking-wider">Text Alignment</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={textAlignment === "left" ? "default" : "outline"}
                      className="flex gap-2 items-center"
                      onClick={() => setTextAlignment("left")}
                    >
                      <AlignLeft className="h-4 w-4" />
                      <span>Left</span>
                    </Button>
                    <Button
                      type="button"
                      variant={textAlignment === "center" ? "default" : "outline"}
                      className="flex gap-2 items-center"
                      onClick={() => setTextAlignment("center")}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <line x1="21" x2="3" y1="6" y2="6"></line>
                        <line x1="17" x2="7" y1="12" y2="12"></line>
                        <line x1="19" x2="5" y1="18" y2="18"></line>
                      </svg>
                      <span>Center</span>
                    </Button>
                    <Button
                      type="button"
                      variant={textAlignment === "justify" ? "default" : "outline"}
                      className="flex gap-2 items-center"
                      onClick={() => setTextAlignment("justify")}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <line x1="21" x2="3" y1="6" y2="6"></line>
                        <line x1="21" x2="3" y1="12" y2="12"></line>
                        <line x1="21" x2="3" y1="18" y2="18"></line>
                      </svg>
                      <span>Justify</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button 
                variant="outline"
                onClick={() => {
                  // Reset to defaults
                  setLineSpacing(1.5);
                  setParagraphSpacing(1.2);
                  setTextAlignment("left");
                }}
              >
                Reset to Defaults
              </Button>
              <Button 
                onClick={saveReaderSettings}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    <span>Save Settings</span>
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="uppercase tracking-wider text-sm font-semibold">Reading Preview</CardTitle>
              <CardDescription>
                Preview how stories will appear with your chosen typography settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                style={{ 
                  fontSize: `${fontSize}px`, 
                  fontFamily: availableFonts[fontFamily as FontFamilyKey].family,
                  lineHeight: lineSpacing,
                  textAlign: textAlignment as any,
                }}
                className="rounded-md bg-muted/20 border p-6 md:p-8 max-w-3xl mx-auto"
              >
                <h2 className="text-2xl font-bold mb-4" style={{ textAlign: "center" }}>The Last House on the Hill</h2>
                <p className="mb-4" style={{ marginBottom: `${paragraphSpacing}em` }}>
                  The ancient house stood silently at the end of the lane, its windows like dark eyes watching my approach. A forgotten sentinel, it had weathered countless seasons in solitude, collecting secrets like dust on its weathered sills.
                </p>
                <p className="mb-4" style={{ marginBottom: `${paragraphSpacing}em` }}>
                  A cold breeze carried whispers through the trees as I approached the doorway, my hand trembling as I reached for the handle. <em>Why had I come back after all these years?</em> The door creaked open on its own, as if inviting me to enter.
                </p>
                <p className="mb-4" style={{ marginBottom: `${paragraphSpacing}em` }}>
                  <strong>Inside, shadows danced across the walls</strong> as shafts of dying sunlight filtered through cracked windowpanes. The air was thick with the scent of old books and forgotten memories. I stood in the same entryway where, as a child, I had first glimpsed the strange painting on the wall—the one that seemed to change every time I looked at it.
                </p>
                <p style={{ marginBottom: `${paragraphSpacing}em` }}>
                  <em>The memories of that night still haunt my dreams, echoing in the shadows of my mind.</em> But I needed answers, and this house, with all its unsettling history, was the only place I could find them.
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <p className="text-sm text-muted-foreground">
                This preview shows how stories will appear with your selected typography settings.
                Make adjustments in the Fonts and Spacing tabs to customize your reading experience.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </SettingsLayout>
  );
}
