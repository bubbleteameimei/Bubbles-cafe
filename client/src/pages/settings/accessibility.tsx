import React, { useState, useEffect } from 'react';
import { SettingsLayout } from '@/components/layouts/SettingsLayout';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { SettingsFormRow } from '@/components/settings/SettingsFormRow';
import { TooltipsHighlighting } from '@/components/accessibility/TooltipsHighlighting';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, ZoomIn, MousePointer, Volume2, Sparkles, MonitorSmartphone, AlignVerticalSpaceBetween, Text, Baseline } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function ReadingPreferencesPage() {
  const [activeTab, setActiveTab] = useState("text");
  const [highContrast, setHighContrast] = useState<boolean>(
    localStorage.getItem('high-contrast') === 'true' || false
  );
  const [textSize, setTextSize] = useState<number>(
    parseInt(localStorage.getItem('text-size') || '16')
  );
  const [reduceMotion, setReduceMotion] = useState<boolean>(
    localStorage.getItem('reduce-motion') === 'true' || false
  );
  const [screenReader, setScreenReader] = useState<boolean>(
    localStorage.getItem('screen-reader') === 'true' || false
  );
  const [lineHeight, setLineHeight] = useState<number>(
    parseInt(localStorage.getItem('line-height') || '160')
  );
  const [fontFamily, setFontFamily] = useState<string>(
    localStorage.getItem('font-family') || 'sans'
  );
  const [paragraphSpacing, setParagraphSpacing] = useState<number>(
    parseInt(localStorage.getItem('paragraph-spacing') || '16')
  );

  const handleReset = () => {
    // Reset to defaults
    setHighContrast(false);
    setTextSize(16);
    setReduceMotion(false);
    setScreenReader(false);
    setLineHeight(160);
    setFontFamily('sans');
    setParagraphSpacing(16);

    toast.success("Settings reset to defaults", {
      description: "Your accessibility settings have been reset to their default values."
    });
  };

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('high-contrast', highContrast.toString());
    localStorage.setItem('text-size', textSize.toString());
    localStorage.setItem('reduce-motion', reduceMotion.toString());
    localStorage.setItem('screen-reader', screenReader.toString());
    localStorage.setItem('line-height', lineHeight.toString());
    localStorage.setItem('font-family', fontFamily);
    localStorage.setItem('paragraph-spacing', paragraphSpacing.toString());

    // Apply settings to document
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    document.documentElement.style.setProperty('--base-text-size', `${textSize}px`);
    document.documentElement.style.setProperty('--line-height', `${lineHeight}%`);
    document.documentElement.style.setProperty('--paragraph-spacing', `${paragraphSpacing}px`);
    document.documentElement.style.setProperty('--font-family', getFontFamilyValue(fontFamily));
    
    if (screenReader) {
      document.documentElement.setAttribute('role', 'application');
      document.documentElement.setAttribute('aria-label', 'Stories Reading Application');
    } else {
      document.documentElement.removeAttribute('role');
      document.documentElement.removeAttribute('aria-label');
    }
  }, [highContrast, textSize, reduceMotion, screenReader, lineHeight, fontFamily, paragraphSpacing]);

  // Helper function to get font family CSS value
  const getFontFamilyValue = (fontFamily: string): string => {
    switch (fontFamily) {
      case 'serif':
        return 'Georgia, Times New Roman, serif';
      case 'mono':
        return 'Courier New, monospace';
      case 'dyslexic':
        return 'OpenDyslexic, Arial, sans-serif';
      case 'sans':
      default:
        return 'system-ui, sans-serif';
    }
  };

  return (
    <SettingsLayout 
      title="Accessibility Settings" 
      description="Customize your reading experience for better accessibility and comfort."
    >
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid grid-cols-2 sm:grid-cols-3 md:w-auto">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <ZoomIn className="h-4 w-4" />
            <span>Text & Reading</span>
          </TabsTrigger>
          <TabsTrigger value="interaction" className="flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            <span>Interaction</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            <span>Media</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Text & Reading Tab */}
        <TabsContent value="text" className="space-y-6">
          <SettingsSection
            title="Text Display"
            description="Customize how text appears on the screen for easier reading."
          >
            <Card>
              <CardContent className="pt-6 space-y-6">
                <SettingsFormRow 
                  label="Text Size" 
                  description="Adjust the size of text throughout the application"
                  htmlFor="text-size"
                >
                  <div className="space-y-2 w-full">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current: {textSize}px</span>
                      <span className="text-sm text-muted-foreground">Range: 12-24px</span>
                    </div>
                    <Slider 
                      id="text-size"
                      value={[textSize]} 
                      max={24} 
                      min={12} 
                      step={1} 
                      onValueChange={(value) => setTextSize(value[0])}
                      aria-label="Adjust text size"
                    />
                    <div style={{ fontSize: `${textSize}px` }} className="p-3 border rounded-md bg-muted/50 mt-2">
                      Sample text at {textSize}px
                    </div>
                  </div>
                </SettingsFormRow>
                
                <SettingsFormRow
                  label="Font Family"
                  description="Choose a font that's easier for you to read"
                  htmlFor="font-family"
                >
                  <Select
                    value={fontFamily}
                    onValueChange={setFontFamily}
                  >
                    <SelectTrigger id="font-family" className="w-full">
                      <SelectValue placeholder="Select font type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sans">Sans-serif (System UI)</SelectItem>
                      <SelectItem value="serif">Serif (Georgia)</SelectItem>
                      <SelectItem value="mono">Monospace (Courier)</SelectItem>
                      <SelectItem value="dyslexic">OpenDyslexic</SelectItem>
                    </SelectContent>
                  </Select>
                  <div style={{ fontFamily: getFontFamilyValue(fontFamily) }} className="p-3 border rounded-md bg-muted/50 mt-2">
                    This is how your text will look with the {fontFamily} font family.
                  </div>
                </SettingsFormRow>
                
                <SettingsFormRow
                  label="Line Height"
                  description="Adjust spacing between lines of text"
                  htmlFor="line-height"
                >
                  <div className="space-y-2 w-full">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current: {lineHeight}%</span>
                      <span className="text-sm text-muted-foreground">Range: 120-220%</span>
                    </div>
                    <Slider 
                      id="line-height"
                      value={[lineHeight]} 
                      max={220} 
                      min={120} 
                      step={10} 
                      onValueChange={(value) => setLineHeight(value[0])}
                      aria-label="Adjust line height"
                    />
                    <div style={{ lineHeight: `${lineHeight}%` }} className="p-3 border rounded-md bg-muted/50 mt-2">
                      This is an example paragraph showing how text will appear with the current line height. 
                      Line height affects readability by adding space between lines, which can make text easier to follow.
                    </div>
                  </div>
                </SettingsFormRow>
                
                <SettingsFormRow
                  label="Paragraph Spacing"
                  description="Adjust space between paragraphs"
                  htmlFor="paragraph-spacing"
                >
                  <div className="space-y-2 w-full">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current: {paragraphSpacing}px</span>
                      <span className="text-sm text-muted-foreground">Range: 8-32px</span>
                    </div>
                    <Slider 
                      id="paragraph-spacing"
                      value={[paragraphSpacing]} 
                      max={32} 
                      min={8} 
                      step={4} 
                      onValueChange={(value) => setParagraphSpacing(value[0])}
                      aria-label="Adjust paragraph spacing"
                    />
                    <div className="space-y-4 border rounded-md bg-muted/50 p-3 mt-2">
                      <p>This is the first paragraph of example text. The spacing between this paragraph and the next is set to {paragraphSpacing}px.</p>
                      <style>{`.example-spacing { margin-top: ${paragraphSpacing}px; }`}</style>
                      <p className="example-spacing">This is the second paragraph. Notice the spacing above. Proper paragraph spacing improves readability and helps distinguish between sections of text.</p>
                    </div>
                  </div>
                </SettingsFormRow>
                
                <SettingsFormRow
                  label="High Contrast Mode"
                  description="Increases contrast for better readability"
                  htmlFor="high-contrast"
                >
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="high-contrast" 
                      checked={highContrast}
                      onCheckedChange={setHighContrast}
                      aria-label="Toggle high contrast mode"
                    />
                    <Label htmlFor="high-contrast">
                      {highContrast ? 'Enabled' : 'Disabled'}
                    </Label>
                  </div>
                </SettingsFormRow>
              </CardContent>
            </Card>
          </SettingsSection>
          
          <TooltipsHighlighting />
        </TabsContent>
        
        {/* Interaction Tab */}
        <TabsContent value="interaction" className="space-y-6">
          <SettingsSection
            title="Motion & Interaction"
            description="Control how the interface responds to your interactions."
          >
            <Card>
              <CardContent className="pt-6 space-y-6">
                <SettingsFormRow
                  label="Reduce Motion"
                  description="Minimize animations and transitions"
                  htmlFor="reduce-motion"
                  tooltip="This setting reduces or eliminates animations that might cause discomfort or disorientation"
                >
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="reduce-motion" 
                      checked={reduceMotion}
                      onCheckedChange={setReduceMotion}
                      aria-label="Toggle reduced motion"
                    />
                    <Label htmlFor="reduce-motion">
                      {reduceMotion ? 'Enabled' : 'Disabled'}
                    </Label>
                  </div>
                </SettingsFormRow>
                
                <SettingsFormRow
                  label="Screen Reader Optimization"
                  description="Improve compatibility with screen readers"
                  htmlFor="screen-reader"
                >
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="screen-reader" 
                      checked={screenReader}
                      onCheckedChange={setScreenReader}
                      aria-label="Toggle screen reader optimization"
                    />
                    <Label htmlFor="screen-reader">
                      {screenReader ? 'Enabled' : 'Disabled'}
                    </Label>
                  </div>
                </SettingsFormRow>
                
                <SettingsFormRow
                  label="Autoplay Media"
                  description="Control whether media plays automatically"
                  htmlFor="autoplay-media"
                >
                  <Select defaultValue="never">
                    <SelectTrigger id="autoplay-media" className="w-full max-w-sm">
                      <SelectValue placeholder="Select autoplay preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Always autoplay</SelectItem>
                      <SelectItem value="wifi-only">Only on Wi-Fi</SelectItem>
                      <SelectItem value="never">Never autoplay</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsFormRow>
              </CardContent>
            </Card>
          </SettingsSection>
        </TabsContent>
        
        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <SettingsSection
            title="Media Preferences"
            description="Control how images, videos, and audio are displayed and played."
            includeSeparator={false}
          >
            <Card>
              <CardContent className="pt-6 space-y-6">
                <SettingsFormRow
                  label="Image Descriptions"
                  description="Show alt text descriptions for images"
                  htmlFor="image-descriptions"
                >
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="image-descriptions" 
                      defaultChecked={true}
                      aria-label="Toggle image descriptions"
                    />
                    <Label htmlFor="image-descriptions">Enabled</Label>
                  </div>
                </SettingsFormRow>
                
                <SettingsFormRow
                  label="Audio Transcripts"
                  description="Show transcripts for audio content when available"
                  htmlFor="audio-transcripts"
                >
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="audio-transcripts" 
                      defaultChecked={true}
                      aria-label="Toggle audio transcripts"
                    />
                    <Label htmlFor="audio-transcripts">Enabled</Label>
                  </div>
                </SettingsFormRow>
                
                <SettingsFormRow
                  label="Video Captions"
                  description="Show captions for video content"
                  htmlFor="video-captions"
                >
                  <Select defaultValue="auto">
                    <SelectTrigger id="video-captions" className="w-full max-w-sm">
                      <SelectValue placeholder="Select caption preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Always show</SelectItem>
                      <SelectItem value="auto">Automatic (follow system setting)</SelectItem>
                      <SelectItem value="never">Never show</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsFormRow>
              </CardContent>
            </Card>
          </SettingsSection>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end mt-6">
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
      </div>
    </SettingsLayout>
  );
}
