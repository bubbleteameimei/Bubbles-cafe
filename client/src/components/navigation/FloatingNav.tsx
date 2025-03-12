import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from '../SearchBar';

interface FloatingNavProps {
  categories?: string[];
  className?: string;
}

const FloatingNav: React.FC<FloatingNavProps> = ({ 
  categories, 
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Close the search bar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (isExpanded && !target.closest('.floating-nav-container')) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div className={`fixed top-4 right-4 z-50 floating-nav-container ${className}`}>
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3 }}
            className="flex bg-background/80 backdrop-blur-sm border border-border rounded-full shadow-md"
          >
            <div className="p-2 w-full max-w-[320px]">
              <SearchBar 
                animate={false} 
                showIcon={false} 
                compact={false} 
                categories={categories}
              />
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="my-1 mr-1 rounded-full hover:bg-accent/20"
              onClick={() => setIsExpanded(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <Button 
              onClick={() => setIsExpanded(true)}
              variant="outline"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-accent/20 w-10 h-10"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingNav;