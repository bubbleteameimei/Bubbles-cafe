import { useState, useEffect } from 'react';
import { SettingsLayout } from '@/components/layouts/SettingsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/hooks/use-theme';
import { SettingsFormRow } from '@/components/settings/SettingsFormRow';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Palette, Type, MousePointer } from 'lucide-react';

export default function QuickSettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');
  
  // Theme settings
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>(
    localStorage.getItem('theme-appearance') as 'light' | 'dark' | 'system' || 'system'
  );
  
  // Font settings
  const [fontSize, setFontSize] = useState<number>(
    parseInt(localStorage.getItem('font-size') || '16')
  );
  const [fontFamily, setFontFamily] = useState<string>(
    localStorage.getItem('font-family') || 'sans'
  );
  
  // Reading preferences
  const [lineHeight, setLineHeight] = useState<number>(
    parseInt(localStorage.getItem('line-height') || '160')
  );
  const [paragraphSpacing, setParagraphSpacing] = useState<number>(
    parseInt(localStorage.getItem('paragraph-spacing') || '16')
  );
  const [highContrast, setHighContrast] = useState<boolean>(
    localStorage.getItem('high-contrast') === 'true' || false
  );
  
  // Accessibility settings
  const [reduceMotion, setReduceMotion] = useState<boolean>(
    localStorage.getItem('reduce-motion') === 'true' || false
  );
  const [tooltipsEnabled, setTooltipsEnabled] = useState<boolean>(
    localStorage.getItem('tooltips-enabled') !== 'false'
  );
  
  // Update localStorage when settings change
  useEffect(() => {
    localStorage.setItem('theme-appearance', appearance);
    localStorage.setItem('font-size', fontSize.toString());
    localStorage.setItem('font-family', fontFamily);
    localStorage.setItem('line-height', lineHeight.toString());
    localStorage.setItem('paragraph-spacing', paragraphSpacing.toString());
    localStorage.setItem('high-contrast', highContrast.toString());
    localStorage.setItem('reduce-motion', reduceMotion.toString());
    localStorage.setItem('tooltips-enabled', tooltipsEnabled.toString());
    
    // Update theme if appearance changes
    if (appearance !== 'system') {
      setTheme({ mode: appearance, appearance });
    } else {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme({ mode: systemPreference, appearance });
    }
    
    // Add class to body for font family
    document.body.classList.remove('font-sans', 'font-serif', 'font-mono');
    document.body.classList.add(`font-${fontFamily}`);
    
    // Apply font size to root element
    document.documentElement.style.fontSize = `${fontSize}px`;
    
    // Apply line height to paragraphs
    const style = document.createElement('style');
    style.innerHTML = `
      p { line-height: ${lineHeight}%; }
      article p { margin-bottom: ${paragraphSpacing}px; }
      ${highContrast ? '.high-contrast { filter: contrast(1.2); }' : ''}
      ${reduceMotion ? '* { animation-duration: 0.001s !important; transition-duration: 0.001s !important; }' : ''}
    `;
    
    // Remove previous style and add new one
    const previousStyle = document.getElementById('quick-settings-style');
    if (previousStyle) {
      previousStyle.remove();
    }
    style.id = 'quick-settings-style';
    document.head.appendChild(style);
    
  }, [appearance, fontSize, fontFamily, lineHeight, paragraphSpacing, highContrast, reduceMotion, tooltipsEnabled, theme, setTheme]);
  
  const handleReset = () => {
    // Reset to defaults
    setAppearance('system');
    setFontSize(16);
    setFontFamily('sans');
    setLineHeight(160);
    setParagraphSpacing(16);
    setHighContrast(false);
    setReduceMotion(false);
    setTooltipsEnabled(true);
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to their default values."
    });
  };
  
  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your quick settings have been applied and saved."
    });
  };
  
  return (
    <SettingsLayout
      title="Quick Settings"
      description="Quickly adjust appearance, reading, and accessibility settings all in one place."
    >
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid grid-cols-2 sm:grid-cols-3 md:w-auto">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="reading" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <span>Reading</span>
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            <span>Accessibility</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <SettingsSection
            title="Theme Settings"
            description="Customize the appearance of the application."
          >
            <Card>
              <CardContent className="pt-6 space-y-6">
                <SettingsFormRow
                  label="Theme Mode"
                  description="Choose between light, dark, or system theme"
                  htmlFor="theme-mode"
                >
                  <div className="flex items-center space-x-4">
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={appearance === 'light' ? 'default' : 'outline'}
                        className={`flex flex-col items-center justify-center h-20 px-2 py-1 gap-1 ${appearance === 'light' ? 'border-primary' : ''}`}
                        onClick={() => setAppearance('light')}
                      >
                        <Sun className="h-5 w-5" />
                        <span className="text-xs">Light</span>
                      </Button>
                      
                      <Button
                        type="button"
                        size="sm"
                        variant={appearance === 'dark' ? 'default' : 'outline'}
                        className={`flex flex-col items-center justify-center h-20 px-2 py-1 gap-1 ${appearance === 'dark' ? 'border-primary' : ''}`}
                        onClick={() => setAppearance('dark')}
                      >
                        <Moon className="h-5 w-5" />
                        <span className="text-xs">Dark</span>
                      </Button>
                      
                      <Button
                        type="button"
                        size="sm"
                        variant={appearance === 'system' ? 'default' : 'outline'}
                        className={`flex flex-col items-center justify-center h-20 px-2 py-1 gap-1 ${appearance === 'system' ? 'border-primary' : ''}`}
                        onClick={() => setAppearance('system')}
                      >
                        <div className="flex">
                          <Sun className="h-4 w-4" />
                          <Moon className="h-4 w-4 ml-1" />
                        </div>
                        <span className="text-xs">System</span>
                      </Button>
                    </div>
                  </div>
                </SettingsFormRow>
                
                <SettingsFormRow
                  label="Font Family"
                  description="Choose a font family for text throughout the application"
                  htmlFor="font-family"
                >
                  <Select
                    value={fontFamily}
                    onValueChange={(value: string) => setFontFamily(value)}
                  >
                    <SelectTrigger className="w-[180px]" id="font-family">
                      <SelectValue placeholder="Select font family" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sans">Sans-serif</SelectItem>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="mono">Monospace</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsFormRow>
              </CardContent>
            </Card>
          </SettingsSection>
        </TabsContent>
        
        {/* Reading Tab */}
        <TabsContent value="reading" className="space-y-6">
          <SettingsSection
            title="Text Settings"
            description="Adjust text appearance for easier reading."
          >
            <Card>
              <CardContent className="pt-6 space-y-6">
                <SettingsFormRow
                  label="Font Size"
                  description="Adjust the size of text throughout the application"
                  htmlFor="font-size"
                >
                  <div className="space-y-2 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Small</span>
                      <span className="font-medium">{fontSize}px</span>
                      <span className="text-sm">Large</span>
                    </div>
                    <Slider
                      id="font-size"
                      min={12}
                      max={24}
                      step={1}
                      value={[fontSize]}
                      onValueChange={(values) => setFontSize(values[0])}
                    />
                  </div>
                </SettingsFormRow>
                
                <SettingsFormRow
                  label="Line Height"
                  description="Adjust the spacing between lines of text"
                  htmlFor="line-height"
                >
                  <div className="space-y-2 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compact</span>
                      <span className="font-medium">{lineHeight}%</span>
                      <span className="text-sm">Spacious</span>
                    </div>
                    <Slider
                      id="line-height"
                      min={120}
                      max={220}
                      step={10}
                      value={[lineHeight]}
                      onValueChange={(values) => setLineHeight(values[0])}
                    />
                  </div>
                </SettingsFormRow>
                
                <SettingsFormRow
                  label="Paragraph Spacing"
                  description="Adjust the spacing between paragraphs"
                  htmlFor="paragraph-spacing"
                >
                  <div className="space-y-2 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compact</span>
                      <span className="font-medium">{paragraphSpacing}px</span>
                      <span className="text-sm">Spacious</span>
                    </div>
                    <Slider
                      id="paragraph-spacing"
                      min={8}
                      max={32}
                      step={4}
                      value={[paragraphSpacing]}
                      onValueChange={(values) => setParagraphSpacing(values[0])}
                    />
                  </div>
                </SettingsFormRow>
              </CardContent>
            </Card>
          </SettingsSection>
        </TabsContent>
        
        {/* Accessibility Tab */}
        <TabsContent value="accessibility" className="space-y-6">
          <SettingsSection
            title="Accessibility Settings"
            description="Configure options to make reading more accessible."
          >
            <Card>
              <CardContent className="pt-6 space-y-6">
                <SettingsFormRow
                  label="High Contrast"
                  description="Increases contrast to make text more readable"
                  htmlFor="high-contrast"
                >
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="high-contrast"
                      checked={highContrast}
                      onCheckedChange={setHighContrast}
                    />
                    <Label htmlFor="high-contrast">
                      {highContrast ? 'Enabled' : 'Disabled'}
                    </Label>
                  </div>
                </SettingsFormRow>
                
                <SettingsFormRow
                  label="Reduce Motion"
                  description="Reduces or eliminates animations throughout the application"
                  htmlFor="reduce-motion"
                >
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reduce-motion"
                      checked={reduceMotion}
                      onCheckedChange={setReduceMotion}
                    />
                    <Label htmlFor="reduce-motion">
                      {reduceMotion ? 'Enabled' : 'Disabled'}
                    </Label>
                  </div>
                </SettingsFormRow>
                
                <SettingsFormRow
                  label="Enable Tooltips"
                  description="Shows helpful tooltips when hovering over elements"
                  htmlFor="tooltips-enabled"
                >
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="tooltips-enabled"
                      checked={tooltipsEnabled}
                      onCheckedChange={setTooltipsEnabled}
                    />
                    <Label htmlFor="tooltips-enabled">
                      {tooltipsEnabled ? 'Enabled' : 'Disabled'}
                    </Label>
                  </div>
                </SettingsFormRow>
              </CardContent>
            </Card>
          </SettingsSection>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between mt-8 pt-4 border-t">
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </SettingsLayout>
  );
}