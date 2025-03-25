import React from 'react';
import { ChevronLeft, Clock, Eye, Calendar } from 'lucide-react';
import { Link } from 'wouter';
import { DeviceType } from './ResponsiveReaderLayout';
import { Badge } from '@/components/ui/badge';
import ResponsiveThemeToggle from './ResponsiveThemeToggle';

type ResponsiveReaderHeaderProps = {
  title: string;
  date?: string;
  readTime?: string;
  views?: number;
  category?: string;
  deviceType: DeviceType;
  onBack?: () => void;
  authorName?: string;
};

const ResponsiveReaderHeader: React.FC<ResponsiveReaderHeaderProps> = ({
  title,
  date,
  readTime,
  views,
  category,
  deviceType,
  onBack,
  authorName,
}) => {
  // Determine if we should use compact layout based on device type
  const isCompact = deviceType === 'mobile';
  const isMedium = deviceType === 'tablet';
  
  return (
    <div className="reader-header-container -mt-6">
      {/* Top row with back button and actions */}
      <div className="flex items-center justify-between mb-1 flex-wrap">
        <div className="flex items-center">
          <Link href="/stories">
            <a className="flex items-center mr-2 text-foreground/70 hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className={isCompact ? 'sr-only' : ''}>Back to stories</span>
            </a>
          </Link>
          
          {category && !isCompact && (
            <Badge variant="outline" className="ml-2">
              {category}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <ResponsiveThemeToggle deviceType={deviceType} />
          {/* Additional actions can be added here if needed */}
        </div>
      </div>
      
      {/* Middle row with title */}
      <h1 
        className={`reader-title font-castoro ${
          isCompact 
            ? 'text-xl mb-1' 
            : isMedium 
              ? 'text-2xl mb-2' 
              : 'text-3xl mb-3'
        } leading-tight text-foreground break-words`}
      >
        {title}
      </h1>
      
      {/* Bottom row with metadata */}
      <div 
        className={`reader-metadata flex ${
          isCompact ? 'flex-col items-start' : 'flex-row items-center justify-between'
        } text-foreground/70 text-sm mb-2`}
      >
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
          {authorName && (
            <div className="flex items-center">
              <span className="font-medium">{authorName}</span>
            </div>
          )}
          
          {date && (
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1 opacity-70" />
              <span>{date}</span>
            </div>
          )}
          
          {readTime && (
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1 opacity-70" />
              <span>{readTime}</span>
            </div>
          )}
          
          {views !== undefined && !isCompact && (
            <div className="flex items-center">
              <Eye className="h-3.5 w-3.5 mr-1 opacity-70" />
              <span>{views.toLocaleString()} views</span>
            </div>
          )}
        </div>
        
        {category && isCompact && (
          <Badge variant="outline" className="mt-2">
            {category}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ResponsiveReaderHeader;