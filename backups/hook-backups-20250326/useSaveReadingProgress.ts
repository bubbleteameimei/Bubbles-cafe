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
      const parsedProgress: ReadingProgressData = JSON.parse(savedProgress);
      setReadingProgress(parsedProgress);

      // If this is the first load, restore scroll position
      if (firstLoad) {
        setTimeout(() => {
          window.scrollTo({
            top: parsedProgress.scrollPosition,
            behavior: "smooth"
          });
          setFirstLoad(false);
        }, 500); // Small delay to ensure content is rendered
      }
    }
  }, [slug, firstLoad]);

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
    forceSave
  };
};

export default useSaveReadingProgress;