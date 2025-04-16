import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Menu } from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLoading } from '@/components/GlobalLoadingProvider';
import SearchResults from '../../components/SearchResults';

interface FloatingNavProps {
  className?: string;
  position?: 'left' | 'right';
}

const FloatingNav: React.FC<FloatingNavProps> = ({
  className = '',
  position = 'left'
}) => {
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [, navigate] = useLocation();
  const { showLoading } = useLoading();

  const toggleExpanded = () => {
    setExpanded(!expanded);
    if (expanded) {
      setShowSearch(false);
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!expanded) {
      setExpanded(true);
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSearch(false);
    }
  };

  const positionClasses = position === 'left' 
    ? 'left-4' 
    : 'right-4';

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Stories', path: '/stories' },
    { label: 'Reader', path: '/reader' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <div 
      className={cn(
        'fixed top-4 z-50',
        positionClasses,
        className
      )}
      onKeyDown={handleKeyDown}
    >
      <div className="relative">
        {/* Main button */}
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all"
          onClick={toggleExpanded}
          aria-label="Toggle navigation"
        >
          {expanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
        {/* Expanded navigation panel */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: -20, width: 0 }}
              animate={{ opacity: 1, y: 0, width: 'auto' }}
              exit={{ opacity: 0, y: -20, width: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-12 bg-background/95 backdrop-blur-lg rounded-lg shadow-lg border border-border/50 overflow-hidden"
              style={{ [position]: 0 }}
            >
              <div className="p-4 w-60">
                <div className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        showLoading(); // Show loading screen before navigation
                        navigate(item.path);
                        setExpanded(false);
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                  
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={toggleSearch}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Search overlay */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-[20vh]"
            >
              <div className="w-full max-w-xl bg-background shadow-xl rounded-lg border border-border/50 overflow-hidden">
                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search stories..."
                      className="pl-10 pr-10 py-2 h-10 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={searchQuery}
                      onChange={handleSearchInput}
                      autoFocus
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8"
                        onClick={clearSearch}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="mt-4 max-h-[60vh] overflow-y-auto">
                    <SearchResults query={searchQuery} onSelect={() => {
                      setShowSearch(false);
                      setExpanded(false);
                    }} />
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSearch(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FloatingNav;