import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { BookmarkIcon, SaveIcon, CheckIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ReadingProgressTrackerProps {
  postId: number;
  slug: string;
  contentRef: React.RefObject<HTMLDivElement>;
  currentProgressPercent?: number;
  onProgressUpdate?: (progress: number) => void;
}

const SAVE_INTERVAL = 5000; // Save every 5 seconds
const SAVE_THRESHOLD = 5; // Only save if progress changed by more than 5%

const ReadingProgressTracker: React.FC<ReadingProgressTrackerProps> = ({
  postId,
  slug,
  contentRef,
  currentProgressPercent = 0,
  onProgressUpdate
}) => {
  const [progress, setProgress] = useState(currentProgressPercent);
  const [lastSavedProgress, setLastSavedProgress] = useState(currentProgressPercent);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  // Store reading position in localStorage as a backup
  const localStorageKey = `reading-progress-${slug}`;
  
  const saveProgressMutation = useMutation({
    mutationFn: async (progressData: { postId: number; percentage: number }) => {
      return apiRequest('/api/reading-progress', {
        method: 'POST',
        body: JSON.stringify(progressData)
      });
    },
    onSuccess: () => {
      // Show saved indicator briefly
      setShowSavedIndicator(true);
      setTimeout(() => setShowSavedIndicator(false), 1500);
      setLastSavedProgress(progress);
    },
    onError: (error) => {
      console.error('Failed to save reading progress:', error);
      // Save to localStorage as backup even if server save fails
      localStorage.setItem(localStorageKey, JSON.stringify({
        percentage: progress,
        timestamp: new Date().toISOString(),
        postId
      }));
    }
  });
  
  const calculateProgress = useCallback(() => {
    if (!contentRef.current) return;
    
    const contentElement = contentRef.current;
    const windowHeight = window.innerHeight;
    const documentHeight = contentElement.scrollHeight;
    const scrollTop = window.scrollY;
    
    // Calculate readable area (accounting for header/footer)
    const readableHeight = documentHeight - windowHeight;
    if (readableHeight <= 0) return 100; // Content fits in screen
    
    // Calculate percentage - how far down the document we've scrolled
    const currentPercentage = Math.min(
      Math.round((scrollTop / readableHeight) * 100),
      100
    );
    
    return currentPercentage;
  }, [contentRef]);
  
  const saveProgress = useCallback(() => {
    const currentProgress = calculateProgress();
    if (currentProgress === undefined) return;
    
    // Only update if meaningful change has occurred
    if (Math.abs(currentProgress - lastSavedProgress) >= SAVE_THRESHOLD) {
      setProgress(currentProgress);
      
      if (onProgressUpdate) {
        onProgressUpdate(currentProgress);
      }
      
      saveProgressMutation.mutate({
        postId,
        percentage: currentProgress
      });
      
      // Update localStorage backup
      localStorage.setItem(localStorageKey, JSON.stringify({
        percentage: currentProgress,
        timestamp: new Date().toISOString(),
        postId
      }));
    }
  }, [calculateProgress, lastSavedProgress, onProgressUpdate, postId, saveProgressMutation]);
  
  // Load saved progress from localStorage if available
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(localStorageKey);
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        if (parsedProgress.percentage !== undefined && parsedProgress.postId === postId) {
          setProgress(parsedProgress.percentage);
          setLastSavedProgress(parsedProgress.percentage);
          
          if (onProgressUpdate) {
            onProgressUpdate(parsedProgress.percentage);
          }
          
          // If progress is very low or very high, show notification
          if (parsedProgress.percentage > 5 && parsedProgress.percentage < 95) {
            toast({
              title: 'Resume Reading',
              description: `You were ${parsedProgress.percentage}% through this story`,
              duration: 3000
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved reading progress:', error);
    }
  }, [localStorageKey, postId, onProgressUpdate, toast]);
  
  // Set up scroll listener and periodic saving
  useEffect(() => {
    const handleScroll = () => {
      const currentProgress = calculateProgress();
      if (currentProgress !== undefined) {
        setProgress(currentProgress);
      }
    };
    
    // Start periodic saving
    timerRef.current = setInterval(saveProgress, SAVE_INTERVAL);
    
    // Set up scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Save on component unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener('scroll', handleScroll);
      saveProgress(); // Final save on unmount
    };
  }, [calculateProgress, saveProgress]);
  
  // Save on component unmount or if slug changes
  useEffect(() => {
    return () => {
      saveProgress(); // Final save on unmount
    };
  }, [slug, saveProgress]);
  
  // Manually save progress button functionality
  const handleManualSave = () => {
    const currentProgress = calculateProgress();
    if (currentProgress === undefined) return;
    
    setProgress(currentProgress);
    saveProgressMutation.mutate({
      postId,
      percentage: currentProgress
    });
    
    toast({
      title: 'Progress saved',
      description: `Your reading position (${currentProgress}%) has been saved`,
      duration: 3000
    });
  };
  
  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 flex flex-col items-center gap-2">
      {/* Progress indicator */}
      <div className="w-1 h-48 bg-background/80 backdrop-blur-sm rounded-full overflow-hidden border border-border flex flex-col-reverse">
        <motion.div 
          className="bg-primary/70 w-full"
          initial={{ height: `${lastSavedProgress}%` }}
          animate={{ height: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        />
      </div>
      
      {/* Save button */}
      <button
        onClick={handleManualSave}
        className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-accent/20 transition-colors"
        title="Save reading position"
      >
        <AnimatePresence mode="wait">
          {showSavedIndicator ? (
            <motion.div
              key="saved"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CheckIcon className="w-4 h-4 text-green-500" />
            </motion.div>
          ) : (
            <motion.div
              key="save"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <BookmarkIcon className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};

export default ReadingProgressTracker;