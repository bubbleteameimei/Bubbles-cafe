import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ResponsiveStoryPage, getDeviceType, DeviceType } from '@/components/reader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Tablet, Monitor, Laptop } from 'lucide-react';

const SAMPLE_STORY = {
  title: "The Last Sun - A Journey Through Time",
  content: `
    <p>The sun was setting over the distant mountains, casting long shadows across the valley. Maria watched from her window, counting the minutes until darkness fell. Tonight would be different, she thought. Tonight everything would change.</p>
    
    <p>Her grandfather's journal lay open on the desk, its pages yellowed with age. The formulas and calculations within had taken her months to decipher, but now she was certain she understood the old man's secret. Time wasn't linear as everyone believed; it was malleable, like clay in skilled hands.</p>
    
    <p>"Are you really going through with this?" Simon asked from the doorway. Her brother had always been the cautious one, the voice of reason when her ideas veered into dangerous territory.</p>
    
    <p>"I have to know if it works," she replied, not turning to face him. "Grandfather spent his entire life developing this theory. If I'm right, we could change everything."</p>
    
    <p>Simon stepped into the room, his reflection appearing in the window beside her own. "And if you're wrong?"</p>
    
    <p>"Then I've wasted a year of research on an old man's delusions." She forced a smile, trying to hide her doubts. "But I don't think I am."</p>
    
    <p>The device on her desk was deceptively simple: a brass sphere encircled by rings of different metals, each inscribed with symbols that predated any known language. At its center glowed a small crystal that seemed to pulse with its own inner light.</p>
    
    <p>"The alignment is almost perfect," Maria said, checking her calculations one final time. "When the last light of the sun hits the crystal, it should activate the temporal field."</p>
    
    <p>Simon's skepticism was evident in his silence. He had supported her research out of love, not belief, but she couldn't blame him. Time travel was the stuff of science fiction, not serious academic pursuit.</p>
    
    <p>"What exactly do you expect to happen?" he finally asked.</p>
    
    <p>Maria took a deep breath. "According to Grandfather's notes, the field will envelop whoever is holding the device, creating a bubble outside normal time. From there, it should be possible to move backward or forward along one's own timeline."</p>
    
    <p>"And you're just going to... what? Take a quick trip to yesterday and come right back?"</p>
    
    <p>"That's the plan." She picked up the device carefully. Its weight was reassuring in her hands. "A simple proof of concept. If it works, I'll document everything and then we can decide what to do next."</p>
    
    <p>The last sliver of sunlight crept across the floor toward them. Maria positioned the device to catch the fading rays.</p>
    
    <p>"Maria..." Simon's voice held a warning, but she was beyond caution now.</p>
    
    <p>"Just be here when I get back," she said, offering him a genuine smile this time. "Which, technically, should be the exact moment I leave."</p>
    
    <p>The sunlight touched the crystal. For a moment, nothing happened, and disappointment began to settle in Maria's chest. Then, the crystal flared with impossible brightness, and the rings began to spin, faster and faster until they blurred around the sphere.</p>
    
    <p>"It's working!" she gasped, even as the light enveloped her. She heard Simon shout something, but his voice seemed to come from very far away, stretched and distorted as if traveling across a vast distance.</p>
    
    <p>The world around her dissolved into streams of light and shadow. Maria felt herself falling through an endless moment, her body both weightless and impossibly heavy. Colors she had no names for flooded her vision, and sounds with no earthly source filled her ears.</p>
    
    <p>Then, as suddenly as it had begun, everything stopped. Maria found herself standing in her room, the device hot in her trembling hands. But something was wrong. The sun wasn't setting—it was rising. And Simon wasn't there.</p>
    
    <p>"Simon?" she called, her voice sounding strange in the morning quiet.</p>
    
    <p>She moved to the window, looking out at a world that seemed familiar yet somehow different. The trees were taller, the neighboring houses painted different colors. In the distance, where there should have been open fields, a small development of houses now stood.</p>
    
    <p>A chill ran down her spine as she realized the truth: she hadn't gone back a day. She had gone forward—perhaps years forward. And now she had to find her way home, through a future she had never imagined and dangers she couldn't predict.</p>
    
    <p>Maria clutched the device tighter, knowing it was her only hope of return. The adventure had only just begun.</p>
  `,
  date: new Date().toISOString(),
  author: "Alex Rivera",
  category: "Science Fiction",
  views: 2453,
  readTime: "8 min read"
};

type DeviceSimulation = {
  type: DeviceType;
  icon: React.ComponentType<any>;
  label: string;
  width: string;
  height: string;
};

const DEVICE_SIMULATIONS: DeviceSimulation[] = [
  {
    type: 'mobile',
    icon: Phone,
    label: 'Mobile',
    width: '375px',
    height: '667px'
  },
  {
    type: 'tablet',
    icon: Tablet,
    label: 'Tablet',
    width: '768px',
    height: '1024px'
  },
  {
    type: 'laptop',
    icon: Laptop,
    label: 'Laptop',
    width: '1280px',
    height: '800px'
  },
  {
    type: 'desktop',
    icon: Monitor,
    label: 'Desktop',
    width: '1920px',
    height: '1080px'
  }
];

const DeviceFrame: React.FC<{
  children: React.ReactNode;
  device: DeviceSimulation;
}> = ({ children, device }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <device.icon className="mr-2 h-5 w-5" />
        {device.label} View
      </h3>
      <div
        className={`border-2 border-primary/30 rounded-lg overflow-hidden bg-white dark:bg-gray-900`}
        style={{
          width: device.width,
          height: device.height,
          maxWidth: '100%',
          maxHeight: '80vh',
          transform: 'scale(0.7)',
          transformOrigin: 'top center'
        }}
      >
        <div
          className="w-full h-full overflow-auto"
          style={{
            width: device.width,
            height: device.height
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const ResponsiveDemoPage: React.FC = () => {
  const [activeDevice, setActiveDevice] = useState<DeviceType>('desktop');
  const [actualDeviceType, setActualDeviceType] = useState<DeviceType>(getDeviceType());
  
  // Update actual device type on window resize
  useEffect(() => {
    const handleResize = () => {
      setActualDeviceType(getDeviceType());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Responsive Story Reader Demo</h1>
        <p className="text-lg text-muted-foreground mb-6">
          This demonstration shows how the story reader adapts to different device types.
          Your current device type is detected as: <strong>{actualDeviceType}</strong>
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {DEVICE_SIMULATIONS.map((device) => (
            <Button
              key={device.type}
              onClick={() => setActiveDevice(device.type)}
              variant={activeDevice === device.type ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <device.icon className="h-4 w-4" />
              {device.label}
            </Button>
          ))}
        </div>
      </div>
      
      <Tabs defaultValue={activeDevice} value={activeDevice} onValueChange={(value) => setActiveDevice(value as DeviceType)}>
        <TabsList className="hidden">
          {DEVICE_SIMULATIONS.map((device) => (
            <TabsTrigger key={device.type} value={device.type}>
              {device.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {DEVICE_SIMULATIONS.map((device) => (
          <TabsContent key={device.type} value={device.type} className="mt-0">
            <DeviceFrame device={device}>
              <ResponsiveStoryPage
                title={SAMPLE_STORY.title}
                content={SAMPLE_STORY.content}
                date={SAMPLE_STORY.date}
                author={SAMPLE_STORY.author}
                category={SAMPLE_STORY.category}
                views={SAMPLE_STORY.views}
                readTime={SAMPLE_STORY.readTime}
              >
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: SAMPLE_STORY.content }}
                />
              </ResponsiveStoryPage>
            </DeviceFrame>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="mt-8 pt-6 border-t text-center">
        <p className="text-muted-foreground">
          All responsive components are built with device-specific optimizations for typography, spacing, and layout.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
          Back to Main Site
        </Button>
      </div>
    </div>
  );
};

export default ResponsiveDemoPage;