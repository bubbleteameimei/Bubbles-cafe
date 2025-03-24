import { useEffect, useState } from "react";
import { useLocation } from "wouter";

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
}

/**
 * Hook to automatically save and restore reading progress
 */
const useSaveReadingProgress = ({
  slug,
  saveInterval = 5000, // Save every 5 seconds by default
  saveToServer = false,
  apiEndpoint = "/api/reading-progress"
}: UseSaveReadingProgressOptions) => {
  const [, setLocation] = useLocation();
  const [readingProgress, setReadingProgress] = useState<ReadingProgressData | null>(null);
  const [firstLoad, setFirstLoad] = useState(true);

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

    const saveProgress = () => {
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
    };

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
  }, [slug, saveInterval, saveToServer, apiEndpoint]);

  // Function to continue reading where left off for listing pages
  const continueReading = () => {
    if (slug) {
      setLocation(`/reader/${slug}`);
    }
  };

  return {
    progress: readingProgress?.percentRead || 0,
    lastRead: readingProgress?.lastRead ? new Date(readingProgress.lastRead) : null,
    continueReading
  };
};

export default useSaveReadingProgress;