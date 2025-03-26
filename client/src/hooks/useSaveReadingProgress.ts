import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import useInactivityDetection from "./use-inactivity-detection";
import { useToast } from "@/hooks/use-toast";

interface ReadingProgressData {
  slug: string;
  scrollPosition: number;
  percentRead: number;
  lastRead: string; // ISO date string
}

interface UseSaveReadingProgressOptions {
  slug: string;
  saveInterval?: number; // milliseconds
  saveToServer?: boolean;
  apiEndpoint?: string;
  showSavedNotification?: boolean;
  inactivityTimeout?: number; // milliseconds
}

/**
 * Hook to automatically save and restore reading progress
 * Enhanced with speed-based auto-save when user stops scrolling
 * Returns positionRestored flag to indicate if the position was restored
 * 
 * @returns {Object} Reading progress data and methods
 * @returns {number} progress - Current reading progress percentage
 * @returns {Date|null} lastRead - Date of last reading activity
 * @returns {Function} continueReading - Navigate to the story and restore position
 * @returns {Function} forceSave - Manually trigger progress save
 * @returns {boolean} positionRestored - Whether the reading position has been restored
 */
const useSaveReadingProgress = ({
  slug,
  saveInterval = 10000, // Save every 10 seconds by default (increased from 5s)
  saveToServer = false,
  apiEndpoint = "/api/reading-progress",
  showSavedNotification = true,
  inactivityTimeout = 2000 // 2 seconds of inactivity triggers save
}: UseSaveReadingProgressOptions) => {
  const [, setLocation] = useLocation();
  const [readingProgress, setReadingProgress] = useState<ReadingProgressData | null>(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const lastSaveTimeRef = useRef<number>(0);
  const { toast } = useToast();
  
  // Configure inactivity detection to auto-save when scrolling stops
  const { isInactive } = useInactivityDetection({ 
    inactivityTimeout,
    scrollSpeedThreshold: 5, // 5px/s is considered "stopped"
    minimumInactiveTime: 500 // Must be inactive for at least 0.5s
  });
  
  // Save progress implementation
  const saveProgress = useCallback(() => {
    if (!slug) return;
    
    const now = Date.now();
    // Don't save too frequently (at least 1 second between saves)
    if (now - lastSaveTimeRef.current < 1000) return;
    
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollPercent = Math.min(
      Math.max((scrollTop / (docHeight - winHeight)) * 100, 0),
      100
    );

    // Only save if we've scrolled some amount
    if (scrollTop > 10) {
      const progressData: ReadingProgressData = {
        slug,
        scrollPosition: scrollTop,
        percentRead: scrollPercent,
        lastRead: new Date().toISOString()
      };

      // Save to localStorage
      localStorage.setItem(`readingProgress_${slug}`, JSON.stringify(progressData));
      setReadingProgress(progressData);
      lastSaveTimeRef.current = now;

      // Show notification if enabled and progress is 10% or more
      if (showSavedNotification && scrollPercent >= 10) {
        // Show toast only once per 30 seconds to avoid annoyance
        const lastToastTime = parseInt(sessionStorage.getItem(`lastSaveToast_${slug}`) || '0', 10);
        if (now - lastToastTime > 30000) {
          toast({
            title: "Progress Saved",
            description: `Your reading spot has been saved (${Math.round(scrollPercent)}%).`,
            duration: 2000,
            variant: "default"
          });
          sessionStorage.setItem(`lastSaveToast_${slug}`, now.toString());
        }
      }

      // Save to server if enabled
      if (saveToServer) {
        try {
          fetch(apiEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              postSlug: slug,
              percentCompleted: scrollPercent,
              lastPosition: scrollTop
            })
          }).catch(err => console.error("Error saving reading progress:", err));
        } catch (error) {
          console.error("Error saving reading progress:", error);
        }
      }
    }
  }, [slug, saveToServer, apiEndpoint, showSavedNotification, toast]);

  // Load saved progress when component mounts
  useEffect(() => {
    if (!slug) return;

    // Try to get saved progress from localStorage
    const savedProgress = localStorage.getItem(`readingProgress_${slug}`);
    if (savedProgress) {
      try {
        const parsedProgress: ReadingProgressData = JSON.parse(savedProgress);
        setReadingProgress(parsedProgress);

        // If this is the first load, restore scroll position with gentle animation
        if (firstLoad) {
          // Detect if this is likely a refresh by checking the navigation type
          const isRefresh = window.performance && 
                           (window.performance.navigation?.type === 1 || // Old API
                            performance.getEntriesByType('navigation').some(
                              nav => (nav as PerformanceNavigationTiming).type === 'reload'
                            ));
          
          // Position restoration indicator removed for cleaner UX
          const createRestorationIndicator = () => {
            // Return an empty dummy object with the necessary structure to maintain compatibility
            return {
              style: {
                opacity: ''
              },
              parentNode: null
            };
          };
          
          // Perform a staged scroll with visual feedback
          setTimeout(() => {
            // Skip restoration for very small scroll positions (less than 100px)
            if (parsedProgress.scrollPosition < 100) {
              setFirstLoad(false);
              return;
            }
            
            // Create and show the indicator first
            const indicator = createRestorationIndicator();
            
            // For refresh cases, use a faster transition to avoid user disorientation
            const initialDelay = isRefresh ? 100 : 300;
            const maxScrollDuration = isRefresh ? 800 : 1200;
            
            // Start with a very quick partial scroll to give immediate response
            // For refresh, jump to a position closer to the final one
            if (parsedProgress.scrollPosition > 500) {
              window.scrollTo({
                top: Math.min(
                  isRefresh ? parsedProgress.scrollPosition * 0.7 : 500, 
                  parsedProgress.scrollPosition * (isRefresh ? 0.7 : 0.3)
                ),
                behavior: "auto"
              });
            }
            
            // Then, after a brief pause, gently scroll to the actual position
            setTimeout(() => {
              // Calculate optimal duration based on distance (faster for small jumps, slower for big ones)
              // Make it faster on refresh
              const scrollDistance = Math.abs(parsedProgress.scrollPosition - window.scrollY);
              const scrollDuration = Math.min(
                maxScrollDuration, 
                (isRefresh ? 200 : 300) + scrollDistance / (isRefresh ? 3 : 2)
              );
              
              // Use smooth scrolling animation without visual indicators
              animateScroll(parsedProgress.scrollPosition, scrollDuration, () => {
                // Mark position as restored
                setFirstLoad(false);
              });
            }, initialDelay);
          }, isRefresh ? 200 : 500); // Shorter initial delay for refresh
        }
      } catch (error) {
        console.error("Error parsing saved reading progress:", error);
        setFirstLoad(false);
      }
    } else {
      setFirstLoad(false);
    }
  }, [slug, firstLoad]);
  
  // Enhanced smooth scrolling animation with better easing and visual indicators
  const animateScroll = (targetPosition: number, duration: number, callback?: () => void) => {
    // If the distance is very small, just jump there
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    
    // Target highlighting has been removed for cleaner UX
    const addTargetHighlight = () => {
      // No-op function for API compatibility
      return;
    };
    
    // For tiny distances, just jump there
    if (Math.abs(distance) < 50) {
      window.scrollTo(0, targetPosition);
      addTargetHighlight(); // Still highlight the target, even for small jumps
      if (callback) callback();
      return;
    }
    
    let startTime: number | null = null;
    let lastPosition = startPosition;
    let animationFrameId: number | null = null;
    
    // Check if the browser is having performance issues
    const performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const longTasks = entries.filter(entry => entry.duration > 50);
      
      // If we have long tasks, abort the smooth scroll and jump directly
      if (longTasks.length > 0 && animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        window.scrollTo(0, targetPosition);
        if (callback) callback();
      }
    });
    
    try {
      // Only observe long tasks if the browser supports it
      if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
        performanceObserver.observe({ entryTypes: ['longtask'] });
      }
    } catch (e) {
      // Ignore errors if the browser doesn't fully support this
      console.warn("PerformanceObserver for longtask not supported", e);
    }
    
    // Better easing function: cubic bezier approximation of ease-out-cubic
    const easeOutCubic = (t: number): number => {
      // More natural feel for scrolling back to position
      return 1 - Math.pow(1 - t, 3);
    };
    
    // Alternative easing: easeInOutQuint (smoother than quad)
    const easeInOutQuint = (t: number): number => {
      return t < 0.5 
        ? 16 * t * t * t * t * t
        : 1 - Math.pow(-2 * t + 2, 5) / 2;
    };
    
    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Choose easing based on scroll direction (down vs up)
      const eased = distance > 0 ? easeInOutQuint(progress) : easeOutCubic(progress);
      const nextPosition = startPosition + distance * eased;
      
      // Detect if the browser isn't scrolling (stuck)
      if (progress > 0.1 && Math.abs(nextPosition - lastPosition) < 1 && Math.abs(nextPosition - targetPosition) > 10) {
        // Browser seems stuck, jump to target
        window.scrollTo(0, targetPosition);
        if (callback) callback();
        if (performanceObserver) performanceObserver.disconnect();
        return;
      }
      
      window.scrollTo(0, nextPosition);
      lastPosition = nextPosition;
      
      if (elapsedTime < duration) {
        animationFrameId = requestAnimationFrame(animation);
      } else {
        // Ensure we end exactly at the target position
        window.scrollTo(0, targetPosition);
        
        // Apply highlight to target element 
        if (progress === 1) addTargetHighlight();
        
        if (callback) callback();
        if (performanceObserver) performanceObserver.disconnect();
      }
    };
    
    animationFrameId = requestAnimationFrame(animation);
    
    // Return a cleanup function
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      if (performanceObserver) {
        performanceObserver.disconnect();
      }
    };
  };

  // Set up interval to save progress periodically
  useEffect(() => {
    if (!slug) return;

    // Save progress when user is about to leave the page
    const handleBeforeUnload = () => {
      saveProgress();
    };

    // Set interval for periodically saving progress
    const intervalId = setInterval(saveProgress, saveInterval);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Clean up
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      saveProgress(); // Save on unmount
    };
  }, [slug, saveInterval, saveProgress]);

  // Add effect to save progress when inactivity is detected
  useEffect(() => {
    if (isInactive && slug) {
      saveProgress();
    }
  }, [isInactive, slug, saveProgress]);

  // Function to continue reading where left off for listing pages
  const continueReading = () => {
    if (slug) {
      setLocation(`/reader/${slug}`);
    }
  };

  // Force save progress programmatically (for external triggers)
  const forceSave = () => {
    saveProgress();
  };

  return {
    progress: readingProgress?.percentRead || 0,
    lastRead: readingProgress?.lastRead ? new Date(readingProgress.lastRead) : null,
    continueReading,
    forceSave,
    positionRestored: !firstLoad
  };
};

export default useSaveReadingProgress;