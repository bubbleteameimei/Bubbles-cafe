import React, { useEffect, useState } from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  mobileLayout?: 'stack' | 'grid' | 'flex';
  tabletLayout?: 'stack' | 'grid' | 'flex';
  desktopLayout?: 'stack' | 'grid' | 'flex';
  mobileColumns?: number;
  tabletColumns?: number;
  desktopColumns?: number;
  mobileGap?: string;
  tabletGap?: string;
  desktopGap?: string;
  mobilePadding?: string;
  tabletPadding?: string;
  desktopPadding?: string;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className = '',
  mobileLayout = 'stack',
  tabletLayout = 'grid',
  desktopLayout = 'grid',
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  mobileGap = 'gap-4',
  tabletGap = 'gap-6',
  desktopGap = 'gap-8',
  mobilePadding = 'p-4',
  tabletPadding = 'p-6',
  desktopPadding = 'p-8'
}) => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
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

  const getLayoutClasses = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          display: mobileLayout === 'stack' ? 'flex flex-col' : 
                   mobileLayout === 'grid' ? `grid grid-cols-${mobileColumns}` : 'flex',
          gap: mobileGap,
          padding: mobilePadding
        };
      case 'tablet':
        return {
          display: tabletLayout === 'stack' ? 'flex flex-col' : 
                   tabletLayout === 'grid' ? `grid grid-cols-${tabletColumns}` : 'flex',
          gap: tabletGap,
          padding: tabletPadding
        };
      case 'desktop':
        return {
          display: desktopLayout === 'stack' ? 'flex flex-col' : 
                   desktopLayout === 'grid' ? `grid grid-cols-${desktopColumns}` : 'flex',
          gap: desktopGap,
          padding: desktopPadding
        };
      default:
        return {
          display: 'flex flex-col',
          gap: 'gap-4',
          padding: 'p-4'
        };
    }
  };

  const layoutClasses = getLayoutClasses();

  return (
    <div 
      className={`${layoutClasses.display} ${layoutClasses.gap} ${layoutClasses.padding} ${className}`}
      data-device-type={deviceType}
      data-layout-type={layoutClasses.display}
    >
      {children}
    </div>
  );
};

// Responsive Container Component
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  center?: boolean;
  padding?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = '7xl',
  center = true,
  padding = true
}) => {
  const containerClasses = [
    'w-full',
    center ? 'mx-auto' : '',
    padding ? 'px-4 sm:px-6 lg:px-8' : '',
    `max-w-${maxWidth}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

// Responsive Grid Component
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  mobileCols?: number;
  tabletCols?: number;
  desktopCols?: number;
  gap?: string;
  alignItems?: string;
  justifyItems?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  mobileCols = 1,
  tabletCols = 2,
  desktopCols = 3,
  gap = 'gap-4',
  alignItems = 'items-start',
  justifyItems = 'justify-items-start'
}) => {
  const gridClasses = [
    'grid',
    `grid-cols-${mobileCols}`,
    `sm:grid-cols-${tabletCols}`,
    `lg:grid-cols-${desktopCols}`,
    gap,
    alignItems,
    justifyItems,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

// Responsive Text Component
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  mobileSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  tabletSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  desktopSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className = '',
  mobileSize = 'base',
  tabletSize = 'lg',
  desktopSize = 'xl',
  weight = 'normal',
  color = 'text-foreground'
}) => {
  const textClasses = [
    `text-${mobileSize}`,
    `sm:text-${tabletSize}`,
    `lg:text-${desktopSize}`,
    `font-${weight}`,
    color,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={textClasses}>
      {children}
    </div>
  );
};

// Responsive Spacing Component
interface ResponsiveSpacingProps {
  children: React.ReactNode;
  className?: string;
  mobilePadding?: string;
  tabletPadding?: string;
  desktopPadding?: string;
  mobileMargin?: string;
  tabletMargin?: string;
  desktopMargin?: string;
}

export const ResponsiveSpacing: React.FC<ResponsiveSpacingProps> = ({
  children,
  className = '',
  mobilePadding = 'p-4',
  tabletPadding = 'p-6',
  desktopPadding = 'p-8',
  mobileMargin = 'm-0',
  tabletMargin = 'sm:m-0',
  desktopMargin = 'lg:m-0'
}) => {
  const spacingClasses = [
    mobilePadding,
    `sm:${tabletPadding}`,
    `lg:${desktopPadding}`,
    mobileMargin,
    tabletMargin,
    desktopMargin,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={spacingClasses}>
      {children}
    </div>
  );
};

// Responsive Visibility Component
interface ResponsiveVisibilityProps {
  children: React.ReactNode;
  mobile?: boolean;
  tablet?: boolean;
  desktop?: boolean;
  className?: string;
}

export const ResponsiveVisibility: React.FC<ResponsiveVisibilityProps> = ({
  children,
  mobile = true,
  tablet = true,
  desktop = true,
  className = ''
}) => {
  const visibilityClasses = [
    mobile ? 'block' : 'hidden',
    tablet ? 'sm:block' : 'sm:hidden',
    desktop ? 'lg:block' : 'lg:hidden',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={visibilityClasses}>
      {children}
    </div>
  );
};

export default ResponsiveLayout;