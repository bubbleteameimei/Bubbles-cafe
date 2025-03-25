import React, { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Define the props for our responsive reader layout
type ResponsiveReaderLayoutProps = {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  controls?: ReactNode;
  className?: string;
};

// Device types for targeted styling
export type DeviceType = 'mobile' | 'tablet' | 'laptop' | 'desktop';

// Layout styles for different device types
const LAYOUT_STYLES = {
  mobile: {
    contentWidth: '100%',
    fontSize: 'clamp(16px, calc(1rem + 0.2vw), 18px)',
    lineHeight: '1.7',
    paragraphSpacing: '1.25rem',
    padding: '0.5rem 1rem',
    maxWidth: 'none'
  },
  tablet: {
    contentWidth: '95%',
    fontSize: 'clamp(17px, calc(1.05rem + 0.25vw), 19px)',
    lineHeight: '1.75',
    paragraphSpacing: '1.5rem',
    padding: '1rem 1.5rem',
    maxWidth: '60rem'
  },
  laptop: {
    contentWidth: '90%',
    fontSize: 'clamp(18px, calc(1.1rem + 0.3vw), 20px)',
    lineHeight: '1.8',
    paragraphSpacing: '1.75rem',
    padding: '1.5rem 2rem',
    maxWidth: '70rem'
  },
  desktop: {
    contentWidth: '85%',
    fontSize: 'clamp(19px, calc(1.15rem + 0.35vw), 22px)',
    lineHeight: '1.85',
    paragraphSpacing: '2rem',
    padding: '2rem 2.5rem',
    maxWidth: '80rem'
  }
};

export const ResponsiveReaderLayout: React.FC<ResponsiveReaderLayoutProps> = ({
  children,
  header,
  sidebar,
  footer,
  controls,
  className = '',
}) => {
  // State to track device type for responsive adjustments
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  
  // Effect to detect and update device type based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDeviceType('mobile');
      } else if (width >= 640 && width < 1024) {
        setDeviceType('tablet');
      } else if (width >= 1024 && width < 1280) {
        setDeviceType('laptop');
      } else {
        setDeviceType('desktop');
      }
    };
    
    // Initial call
    handleResize();
    
    // Setup resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Apply the appropriate styles based on device type
  const layoutStyle = LAYOUT_STYLES[deviceType];

  // Generate styles for the content
  const contentStyle = {
    '--reader-font-size': layoutStyle.fontSize,
    '--reader-line-height': layoutStyle.lineHeight,
    '--reader-paragraph-spacing': layoutStyle.paragraphSpacing,
    '--reader-content-width': layoutStyle.contentWidth,
    '--reader-content-padding': layoutStyle.padding,
    '--reader-content-max-width': layoutStyle.maxWidth,
  } as React.CSSProperties;

  return (
    <div 
      className={`responsive-reader-layout ${className}`}
      data-device-type={deviceType}
      style={contentStyle}
    >
      {/* Header section - fixed at the top */}
      {header && (
        <header className="reader-header sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <div className="container mx-auto py-2">
            {header}
          </div>
        </header>
      )}

      {/* Main layout container */}
      <div className="reader-layout-container flex flex-row min-h-[calc(100vh-3.5rem)]">
        {/* Sidebar - only visible on larger screens */}
        {sidebar && deviceType !== 'mobile' && (
          <aside className={`reader-sidebar ${deviceType === 'tablet' ? 'w-1/4' : 'w-1/5'} hidden md:block p-4 border-r`}>
            {sidebar}
          </aside>
        )}

        {/* Main content area */}
        <main 
          className={`reader-content flex-1 py-4 ${deviceType === 'mobile' ? 'px-2' : 'px-4'}`}
          style={{
            width: deviceType === 'mobile' ? '100%' : deviceType === 'tablet' ? '75%' : '80%',
            maxWidth: layoutStyle.maxWidth !== 'none' ? layoutStyle.maxWidth : undefined,
            margin: '0 auto',
          }}
        >
          <motion.div 
            className="content-wrapper mx-auto"
            style={{ 
              width: layoutStyle.contentWidth,
              maxWidth: layoutStyle.maxWidth !== 'none' ? layoutStyle.maxWidth : undefined,
              fontSize: layoutStyle.fontSize,
              lineHeight: layoutStyle.lineHeight,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>

          {/* Fixed controls - e.g., navigation buttons at screen edges */}
          {controls && (
            <div className="reader-controls fixed bottom-6 right-6 z-50 flex flex-col gap-2">
              {controls}
            </div>
          )}
        </main>
      </div>

      {/* Footer section */}
      {footer && (
        <footer className="reader-footer mt-auto py-6 border-t">
          <div className="container mx-auto">
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
};

// Export some helper functions and constants for use in the parent component
export const getDeviceType = (): DeviceType => {
  if (typeof window === 'undefined') return 'desktop'; // Server-side rendering fallback
  
  const width = window.innerWidth;
  if (width < 640) {
    return 'mobile';
  } else if (width >= 640 && width < 1024) {
    return 'tablet';
  } else if (width >= 1024 && width < 1280) {
    return 'laptop';
  } else {
    return 'desktop';
  }
};

export default ResponsiveReaderLayout;