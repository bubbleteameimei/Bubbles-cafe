import React, { useState, useEffect } from 'react';
import { ResponsiveReaderLayout, ResponsiveReaderHeader, ResponsiveReaderControls, getDeviceType } from './index';
import { Button } from '@/components/ui/button';
import { Bookmark, Share2 } from 'lucide-react';
import { format } from 'date-fns';

interface ResponsiveStoryPageProps {
  children: React.ReactNode;
  title: string;
  content: string;
  date: string;
  author?: string;
  category?: string;
  views?: number;
  onShare?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  readTime?: string;
  className?: string;
}

/**
 * ResponsiveStoryPage - A wrapper component that enhances story display
 * with responsive layouts optimized for different device types
 */
const ResponsiveStoryPage: React.FC<ResponsiveStoryPageProps> = ({
  children,
  title,
  content,
  date,
  author,
  category,
  views,
  onShare,
  onBookmark,
  isBookmarked = false,
  readTime,
  className = '',
}) => {
  // Get the current device type for responsive adjustments
  const [deviceType, setDeviceType] = useState(getDeviceType());
  
  // Initialize font size state
  const [fontSize, setFontSize] = useState(18);
  
  // Update device type on window resize
  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Format date if needed
  const formattedDate = typeof date === 'string' ? date : format(new Date(date), 'MMM d, yyyy');
  
  // Calculate reading time if not provided
  const calculatedReadTime = readTime || (() => {
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]+>/g, '');
    const words = textContent.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  })();
  
  // Handlers for font size adjustment
  const handleIncreaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 1, 24));
  };
  
  const handleDecreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 1, 12));
  };
  
  // Default share handler if none provided
  const handleShare = onShare || (() => {
    console.log('[ResponsiveStoryPage] Share story');
    if (navigator.share) {
      navigator.share({
        title,
        text: `Check out this story: ${title}`,
        url: window.location.href,
      }).catch(err => console.error('[ResponsiveStoryPage] Error sharing:', err));
    } else {
      alert('Share functionality not available on this device/browser');
    }
  });
  
  // Default bookmark handler if none provided
  const handleBookmark = onBookmark || (() => {
    console.log('[ResponsiveStoryPage] Toggle bookmark');
  });
  
  return (
    <ResponsiveReaderLayout
      className={`responsive-story-page ${className}`}
      header={
        <ResponsiveReaderHeader
          title={title}
          date={formattedDate}
          readTime={calculatedReadTime}
          views={views}
          category={category}
          deviceType={deviceType}
          authorName={author}
        />
      }
      controls={
        <ResponsiveReaderControls
          fontSizeValue={fontSize}
          onIncreaseFontSize={handleIncreaseFontSize}
          onDecreaseFontSize={handleDecreaseFontSize}
          onShare={handleShare}
          onBookmark={handleBookmark}
          isBookmarked={isBookmarked}
          deviceType={deviceType}
        />
      }
    >
      {/* Main content area with proper styling for different device types */}
      <div 
        className="story-content prose dark:prose-invert mx-auto"
        style={{ 
          fontSize: `${fontSize}px`,
          maxWidth: deviceType === 'mobile' ? '100%' : 
                    deviceType === 'tablet' ? '95%' : 
                    deviceType === 'laptop' ? '90%' : '85%'
        }}
      >
        {children}
      </div>
    </ResponsiveReaderLayout>
  );
};

export default ResponsiveStoryPage;