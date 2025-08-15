import React, { useState, useEffect } from 'react';
import { ResponsiveLayout, ResponsiveContainer, ResponsiveGrid, ResponsiveText, ResponsiveSpacing, ResponsiveVisibility } from '../layout/ResponsiveLayout';

export const ResponsiveTest: React.FC = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      
      if (width < 640) {
        setDeviceType('mobile');
      } else if (width >= 640 && width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const testCards = [
    { title: 'Responsive Card 1', content: 'This card adapts to different screen sizes', color: 'bg-blue-100 dark:bg-blue-900' },
    { title: 'Responsive Card 2', content: 'Mobile-first design approach', color: 'bg-green-100 dark:bg-green-900' },
    { title: 'Responsive Card 3', content: 'Tablet and desktop optimizations', color: 'bg-purple-100 dark:bg-purple-900' },
    { title: 'Responsive Card 4', content: 'Touch-friendly interactions', color: 'bg-orange-100 dark:bg-orange-900' },
    { title: 'Responsive Card 5', content: 'Adaptive layouts and spacing', color: 'bg-pink-100 dark:bg-pink-900' },
    { title: 'Responsive Card 6', content: 'Enhanced user experience', color: 'bg-indigo-100 dark:bg-indigo-900' },
  ];

  return (
    <ResponsiveContainer maxWidth="7xl" className="py-8">
      {/* Device Information */}
      <div className="mb-8 p-4 bg-muted rounded-lg">
        <ResponsiveText 
          mobileSize="lg" 
          tabletSize="xl" 
          desktopSize="2xl" 
          weight="semibold"
          className="mb-4"
        >
          Responsive Design Test Dashboard
        </ResponsiveText>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-background rounded border">
            <div className="text-sm text-muted-foreground">Device Type</div>
            <div className="font-semibold capitalize">{deviceType}</div>
          </div>
          <div className="p-3 bg-background rounded border">
            <div className="text-sm text-muted-foreground">Screen Width</div>
            <div className="font-semibold">{windowSize.width}px</div>
          </div>
          <div className="p-3 bg-background rounded border">
            <div className="text-sm text-muted-foreground">Screen Height</div>
            <div className="font-semibold">{windowSize.height}px</div>
          </div>
          <div className="p-3 bg-background rounded border">
            <div className="text-sm text-muted-foreground">Breakpoint</div>
            <div className="font-semibold">
              {windowSize.width < 640 ? 'Mobile' : 
               windowSize.width < 1024 ? 'Tablet' : 'Desktop'}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Layout Test */}
      <ResponsiveLayout
        mobileLayout="stack"
        tabletLayout="grid"
        desktopLayout="grid"
        mobileColumns={1}
        tabletColumns={2}
        desktopColumns={3}
        mobileGap="gap-4"
        tabletGap="gap-6"
        desktopGap="gap-8"
        mobilePadding="p-4"
        tabletPadding="p-6"
        desktopPadding="p-8"
        className="mb-8"
      >
        <ResponsiveText 
          mobileSize="xl" 
          tabletSize="2xl" 
          desktopSize="3xl" 
          weight="bold"
          className="col-span-full text-center mb-6"
        >
          Responsive Layout Test
        </ResponsiveText>
        
        {testCards.map((card, index) => (
          <div 
            key={index}
            className={`${card.color} p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow touch-friendly`}
          >
            <ResponsiveText 
              mobileSize="lg" 
              tabletSize="xl" 
              desktopSize="2xl" 
              weight="semibold"
              className="mb-2"
            >
              {card.title}
            </ResponsiveText>
            <ResponsiveText 
              mobileSize="sm" 
              tabletSize="base" 
              desktopSize="lg"
              className="text-muted-foreground"
            >
              {card.content}
            </ResponsiveText>
          </div>
        ))}
      </ResponsiveLayout>

      {/* Responsive Grid Test */}
      <div className="mb-8">
        <ResponsiveText 
          mobileSize="xl" 
          tabletSize="2xl" 
          desktopSize="3xl" 
          weight="bold"
          className="text-center mb-6"
        >
          Responsive Grid Test
        </ResponsiveText>
        
        <ResponsiveGrid
          mobileCols={1}
          tabletCols={2}
          desktopCols={4}
          gap="gap-4"
          alignItems="items-stretch"
          justifyItems="justify-items-stretch"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <div 
              key={i}
              className="bg-accent/20 p-4 rounded-lg border min-h-[120px] flex flex-col justify-center items-center text-center"
            >
              <ResponsiveText 
                mobileSize="lg" 
                tabletSize="xl" 
                desktopSize="2xl" 
                weight="semibold"
                className="mb-2"
              >
                Grid Item {i + 1}
              </ResponsiveText>
              <ResponsiveText 
                mobileSize="xs" 
                tabletSize="sm" 
                desktopSize="base"
                className="text-muted-foreground"
              >
                Responsive grid layout
              </ResponsiveText>
            </div>
          ))}
        </ResponsiveGrid>
      </div>

      {/* Responsive Spacing Test */}
      <ResponsiveSpacing
        mobilePadding="p-4"
        tabletPadding="p-6"
        desktopPadding="p-8"
        className="mb-8"
      >
        <ResponsiveText 
          mobileSize="xl" 
          tabletSize="2xl" 
          desktopSize="3xl" 
          weight="bold"
          className="text-center mb-6"
        >
          Responsive Spacing Test
        </ResponsiveText>
        
        <div className="bg-muted/50 rounded-lg p-4">
          <ResponsiveText 
            mobileSize="base" 
            tabletSize="lg" 
            desktopSize="xl"
            className="text-center"
          >
            This section demonstrates responsive spacing that adapts to different screen sizes.
            The padding and margins automatically adjust for mobile, tablet, and desktop viewports.
          </ResponsiveText>
        </div>
      </ResponsiveSpacing>

      {/* Responsive Visibility Test */}
      <div className="mb-8">
        <ResponsiveText 
          mobileSize="xl" 
          tabletSize="2xl" 
          desktopSize="3xl" 
          weight="bold"
          className="text-center mb-6"
        >
          Responsive Visibility Test
        </ResponsiveText>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ResponsiveVisibility mobile={true} tablet={false} desktop={false}>
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg border text-center">
              <ResponsiveText mobileSize="lg" weight="semibold">Mobile Only</ResponsiveText>
              <ResponsiveText mobileSize="sm" className="text-muted-foreground">
                Visible on mobile devices
              </ResponsiveText>
            </div>
          </ResponsiveVisibility>
          
          <ResponsiveVisibility mobile={false} tablet={true} desktop={false}>
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg border text-center">
              <ResponsiveText tabletSize="lg" weight="semibold">Tablet Only</ResponsiveText>
              <ResponsiveText tabletSize="sm" className="text-muted-foreground">
                Visible on tablet devices
              </ResponsiveText>
            </div>
          </ResponsiveVisibility>
          
          <ResponsiveVisibility mobile={false} tablet={false} desktop={true}>
            <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg border text-center">
              <ResponsiveText desktopSize="lg" weight="semibold">Desktop Only</ResponsiveText>
              <ResponsiveText desktopSize="sm" className="text-muted-foreground">
                Visible on desktop devices
              </ResponsiveText>
            </div>
          </ResponsiveVisibility>
        </div>
      </div>

      {/* Touch Target Test */}
      <div className="mb-8">
        <ResponsiveText 
          mobileSize="xl" 
          tabletSize="2xl" 
          desktopSize="3xl" 
          weight="bold"
          className="text-center mb-6"
        >
          Touch Target Test
        </ResponsiveText>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <button className="touch-friendly bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors">
            Touch Friendly Button
          </button>
          <button className="touch-friendly-large bg-secondary text-secondary-foreground px-6 py-4 rounded-lg hover:bg-secondary/90 transition-colors">
            Large Touch Target
          </button>
        </div>
      </div>

      {/* Responsive Animation Test */}
      <div className="mb-8">
        <ResponsiveText 
          mobileSize="xl" 
          tabletSize="2xl" 
          desktopSize="3xl" 
          weight="bold"
          className="text-center mb-6"
        >
          Responsive Animation Test
        </ResponsiveText>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="animate-fade-in-mobile bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg border text-center">
            <ResponsiveText mobileSize="lg" weight="semibold">Mobile Animation</ResponsiveText>
            <ResponsiveText mobileSize="sm" className="text-muted-foreground">
              Fade in animation for mobile
            </ResponsiveText>
          </div>
          
          <div className="animate-fade-in-tablet bg-orange-100 dark:bg-orange-900 p-4 rounded-lg border text-center">
            <ResponsiveText tabletSize="lg" weight="semibold">Tablet Animation</ResponsiveText>
            <ResponsiveText tabletSize="sm" className="text-muted-foreground">
              Fade in animation for tablet
            </ResponsiveText>
          </div>
          
          <div className="animate-fade-in-desktop bg-red-100 dark:bg-red-900 p-4 rounded-lg border text-center">
            <ResponsiveText desktopSize="lg" weight="semibold">Desktop Animation</ResponsiveText>
            <ResponsiveText desktopSize="sm" className="text-muted-foreground">
              Fade in animation for desktop
            </ResponsiveText>
          </div>
        </div>
      </div>

      {/* Responsive Container Test */}
      <div className="mb-8">
        <ResponsiveText 
          mobileSize="xl" 
          tabletSize="2xl" 
          desktopSize="3xl" 
          weight="bold"
          className="text-center mb-6"
        >
          Responsive Container Test
        </ResponsiveText>
        
        <ResponsiveContainer maxWidth="5xl" className="bg-muted/30 rounded-lg p-6">
          <ResponsiveText 
            mobileSize="base" 
            tabletSize="lg" 
            desktopSize="xl"
            className="text-center"
          >
            This container demonstrates responsive max-width and padding. 
            It automatically centers content and adjusts spacing for different screen sizes.
          </ResponsiveText>
        </ResponsiveContainer>
      </div>
    </ResponsiveContainer>
  );
};

export default ResponsiveTest;