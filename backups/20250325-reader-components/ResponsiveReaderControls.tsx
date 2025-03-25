import React from 'react';
import { Minus, Plus, Share2, Bookmark, BookmarkX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { DeviceType } from './ResponsiveReaderLayout';

type ResponsiveReaderControlsProps = {
  fontSizeValue: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  deviceType: DeviceType;
};

const ResponsiveReaderControls: React.FC<ResponsiveReaderControlsProps> = ({
  fontSizeValue,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onShare,
  onBookmark,
  isBookmarked = false,
  deviceType,
}) => {
  // Determine if we should use compact controls based on device type
  const isCompact = deviceType === 'mobile';
  
  // Animate the controls
  const containerVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  };
  
  return (
    <AnimatePresence>
      <motion.div
        className={`reader-controls-container fixed ${isCompact ? 'bottom-4 right-4' : 'bottom-8 right-8'} z-50 flex ${isCompact ? 'flex-col-reverse' : 'flex-col'} gap-2`}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={containerVariants}
        transition={{ 
          type: 'spring', 
          stiffness: 260, 
          damping: 20,
          staggerChildren: 0.1 
        }}
      >
        {/* Font size controls */}
        <div className={`font-controls ${isCompact ? 'mb-1' : 'mb-2'} flex ${isCompact ? 'flex-col' : 'flex-row'} gap-1 backdrop-blur-sm bg-background/80 border rounded-lg shadow-md overflow-visible`}>
          <Button
            size={isCompact ? 'sm' : 'default'}
            variant="ghost"
            onClick={onDecreaseFontSize}
            className="aspect-square rounded-md hover:bg-accent/60 w-8 h-8"
            aria-label="Decrease font size"
            title="Decrease font size"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className={`font-size-display flex items-center justify-center text-xs font-medium px-2 ${isCompact ? 'py-1' : ''}`}>
            {fontSizeValue}px
          </div>
          
          <Button
            size={isCompact ? 'sm' : 'default'}
            variant="ghost"
            onClick={onIncreaseFontSize}
            className="aspect-square rounded-md hover:bg-accent/60 w-8 h-8"
            aria-label="Increase font size"
            title="Increase font size"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Action buttons */}
        <div className={`action-buttons flex ${isCompact ? 'flex-col' : 'flex-row'} gap-2 overflow-visible`}>
          {/* Share button */}
          {onShare && (
            <Button
              variant="secondary"
              onClick={onShare}
              className={`${isCompact ? 'h-9 w-9' : 'h-10 w-10'} min-h-[36px] min-w-[36px] p-0 rounded-full shadow-md hover:shadow-lg transition-shadow overflow-visible`}
              aria-label="Share story"
              title="Share story"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
          
          {/* Bookmark button */}
          {onBookmark && (
            <Button
              variant={isBookmarked ? "default" : "secondary"}
              onClick={onBookmark}
              className={`${isCompact ? 'h-9 w-9' : 'h-10 w-10'} min-h-[36px] min-w-[36px] p-0 rounded-full shadow-md hover:shadow-lg transition-shadow overflow-visible`}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark story"}
              title={isBookmarked ? "Remove bookmark" : "Bookmark story"}
            >
              {isBookmarked ? (
                <BookmarkX className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResponsiveReaderControls;