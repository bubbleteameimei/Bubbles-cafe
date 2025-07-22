import { useState } from 'react';
import { SettingsLayout } from '@/components/layouts/SettingsLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Monitor, Phone, Tablet, Laptop, Eye as EyeIcon, Palette, Monitor as Desktop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';

// Sample text for preview
const sampleText = {
  title: "The Whisper in the Dark",
  excerpt: "My first sip was an accident. The town's water supply had been contaminated for days, but I was too tired to notice the strange color as I gulped it down after my midnight shift. By morning, I could hear the whispers—soft, distant murmurs sliding through my thoughts like eels in murky water.",
  paragraphs: [
    "The whispers grew louder with each passing day. At first, they were indistinct, like overhearing conversations in another room. But soon, they formed words, sentences, ideas that weren't my own. They spoke of ancient things, of places beneath the surface where light had never touched.",
    "I tried to tell my wife, but she just looked at me with concern. 'You're working too hard,' she said, pressing a cool hand to my forehead. 'Maybe you should see Dr. Lawrence.' But Dr. Lawrence drank the water too. Everyone in town did.",
    "Within a week, half the residents of Millfield reported hearing voices. The other half denied it, but I saw the recognition in their eyes—the slight hesitation before answering questions, the way they'd pause mid-sentence as if listening to something no one else could hear.",
    "The town council called it mass hysteria. The news channels blamed it on environmental factors, possibly a gas leak. Scientists came in hazmat suits, took samples, and left. But none of them stayed long enough to drink the water.",
    "On the tenth day, the whispers synchronized. At exactly 3:17 AM, every person who admitted to hearing them received the same message: 'Come to the lake.' I found myself walking there in my pajamas, joining a procession of blank-faced neighbors moving silently through the pre-dawn darkness."
  ]
};

// Device frame components
const DeviceFrameDesktop = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg border-4 border-gray-300 shadow-xl max-w-4xl mx-auto bg-white dark:bg-gray-900">
    <div className="h-8 bg-gray-200 dark:bg-gray-800 flex items-center px-4">
      <div className="flex space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
      </div>
    </div>
    <div className="p-4 overflow-auto">{children}</div>
  </div>
);

const DeviceFrameTablet = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border-8 border-gray-300 shadow-xl max-w-md mx-auto bg-white dark:bg-gray-900">
    <div className="flex justify-center p-1">
      <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></div>
    </div>
    <div className="p-4 overflow-auto">{children}</div>
  </div>
);

const DeviceFrameMobile = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border-8 border-gray-300 shadow-xl max-w-xs mx-auto bg-white dark:bg-gray-900">
    <div className="h-4 flex justify-center items-center bg-gray-200 dark:bg-gray-800">
      <div className="w-16 h-1 rounded-full bg-gray-400"></div>
    </div>
    <div className="p-4 overflow-auto">{children}</div>
    <div className="h-6 flex justify-center items-center bg-gray-200 dark:bg-gray-800">
      <div className="w-10 h-1 rounded-full bg-gray-400"></div>
    </div>
  </div>
);

const DeviceFrameReader = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-sm border-4 border-gray-200 shadow-md max-w-md mx-auto bg-gray-50 dark:bg-gray-900">
    <div className="h-6 bg-gray-100 dark:bg-gray-800 flex justify-center items-center">
      <div className="text-xs text-gray-400">E-Reader</div>
    </div>
    <div className="p-6 overflow-auto font-serif">{children}</div>
    <div className="h-6 bg-gray-100 dark:bg-gray-800 flex justify-center items-center">
      <div className="w-16 h-1 rounded-full bg-gray-300"></div>
    </div>
  </div>
);

// Content to preview
const PreviewContent = () => {
  const fontSizeClass = localStorage.getItem('font-size') ? 
    `text-[${localStorage.getItem('font-size')}px]` : 'text-base';
  
  const fontFamily = localStorage.getItem('font-family') || 'sans';
  const fontFamilyClass = `font-${fontFamily}`;
  
  // Get line height and paragraph spacing from localStorage or use defaults
  const lineHeight = localStorage.getItem('line-height') || '160';
  const paragraphSpacing = localStorage.getItem('paragraph-spacing') || '16';
  
  // Determine if high contrast is enabled
  const highContrast = localStorage.getItem('high-contrast') === 'true';
  
  return (
    <div className={`${fontFamilyClass} ${highContrast ? 'high-contrast' : ''}`}>
      <h1 className="text-2xl font-bold mb-4">{sampleText.title}</h1>
      <p className="text-muted-foreground mb-6 italic">{sampleText.excerpt}</p>
      <div className="space-y-4">
        {sampleText.paragraphs.map((paragraph, index) => (
          <p 
            key={index} 
            className={fontSizeClass}
            style={{ 
              lineHeight: `${lineHeight}%`,
              marginBottom: `${paragraphSpacing}px` 
            }}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

export default function PreviewPage() {
  const [device, setDevice] = useState('desktop');
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [previewMode, setPreviewMode] = useState('device');
  
  // Toggle between light and dark mode for preview
  const toggleTheme = () => {
    const newAppearance = theme.mode === 'dark' ? 'light' : 'dark';
    setTheme({ mode: newAppearance, appearance: newAppearance });
    
    toast({
      title: `${newAppearance.charAt(0).toUpperCase() + newAppearance.slice(1)} Mode Activated`,
      description: `Previewing content in ${newAppearance} mode.`,
    });
  };
  
  return (
    <SettingsLayout
      title="Content Preview"
      description="Preview how your content will appear on different devices and with your chosen settings."
    >
      <Tabs defaultValue={previewMode} onValueChange={setPreviewMode} className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="device" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span>Device Preview</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <EyeIcon className="h-4 w-4" />
            <span>Settings Preview</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Device Preview Tab */}
      {previewMode === 'device' && (
        <>
          <div className="flex justify-center mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={device === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDevice('desktop')}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                <span>Desktop</span>
              </Button>
              <Button
                variant={device === 'laptop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDevice('laptop')}
                className="flex items-center gap-2"
              >
                <Laptop className="h-4 w-4" />
                <span>Laptop</span>
              </Button>
              <Button
                variant={device === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDevice('tablet')}
                className="flex items-center gap-2"
              >
                <Tablet className="h-4 w-4" />
                <span>Tablet</span>
              </Button>
              <Button
                variant={device === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDevice('mobile')}
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                <span>Mobile</span>
              </Button>
              <Button
                variant={device === 'reader' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDevice('reader')}
                className="flex items-center gap-2"
              >
                <Book className="h-4 w-4" />
                <span>E-Reader</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-6 mb-10">
            {device === 'desktop' && (
              <DeviceFrameDesktop>
                <PreviewContent />
              </DeviceFrameDesktop>
            )}
            {device === 'laptop' && (
              <div className="max-w-3xl mx-auto">
                <DeviceFrameDesktop>
                  <PreviewContent />
                </DeviceFrameDesktop>
              </div>
            )}
            {device === 'tablet' && (
              <DeviceFrameTablet>
                <PreviewContent />
              </DeviceFrameTablet>
            )}
            {device === 'mobile' && (
              <DeviceFrameMobile>
                <PreviewContent />
              </DeviceFrameMobile>
            )}
            {device === 'reader' && (
              <DeviceFrameReader>
                <PreviewContent />
              </DeviceFrameReader>
            )}
          </div>
        </>
      )}
      
      {/* Settings Preview Tab */}
      {previewMode === 'settings' && (
        <div className="space-y-6">
          <SettingsSection
            title="Preview with Your Settings"
            description="See how your content looks with your current accessibility and reading preferences."
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Reading Experience</CardTitle>
                  <CardDescription>Preview based on your current settings</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex items-center gap-2"
                >
                  <Palette className="h-4 w-4" />
                  <span>Toggle Theme</span>
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="border rounded-md p-6">
                  <PreviewContent />
                </div>
              </CardContent>
            </Card>
          </SettingsSection>
          
          <SettingsSection
            title="Your Current Settings"
            description="A summary of your active reading and accessibility settings."
          >
            <Card>
              <CardContent className="pt-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Theme</dt>
                    <dd className="font-medium">{theme.mode.charAt(0).toUpperCase() + theme.mode.slice(1)} Mode</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Font Family</dt>
                    <dd className="font-medium">{localStorage.getItem('font-family')?.charAt(0).toUpperCase() + (localStorage.getItem('font-family')?.slice(1) || 'Sans') || 'Sans'}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Font Size</dt>
                    <dd className="font-medium">{localStorage.getItem('font-size') || '16'}px</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Line Height</dt>
                    <dd className="font-medium">{localStorage.getItem('line-height') || '160'}%</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Paragraph Spacing</dt>
                    <dd className="font-medium">{localStorage.getItem('paragraph-spacing') || '16'}px</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">High Contrast</dt>
                    <dd className="font-medium">{localStorage.getItem('high-contrast') === 'true' ? 'Enabled' : 'Disabled'}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Reduce Motion</dt>
                    <dd className="font-medium">{localStorage.getItem('reduce-motion') === 'true' ? 'Enabled' : 'Disabled'}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Tooltips</dt>
                    <dd className="font-medium">{localStorage.getItem('tooltips-enabled') !== 'false' ? 'Enabled' : 'Disabled'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </SettingsSection>
        </div>
      )}
      
      <div className="flex justify-center mt-6">
        <Button onClick={() => window.location.href = '/settings/accessibility'} variant="outline">
          Adjust Settings
        </Button>
      </div>
    </SettingsLayout>
  );
}