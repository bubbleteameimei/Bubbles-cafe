"use client"

import { useState, useEffect, useCallback } from 'react';

interface ReadingProgressOptions {
  /**
   * Target element to track scrolling progress (defaults to document.body)
   */
  target?: React.RefObject<HTMLElement> | null;
  /**
   * Update interval in milliseconds (defaults to 100ms)
   */
  updateInterval?: number;
  /**
   * Whether to save reading progress to local storage
   */
  persistProgress?: boolean;
  /**
   * Unique key for persisting progress (required if persistProgress is true)
   */
  progressKey?: string;
  /**
   * Callback function when progress changes
   */
  onProgressChange?: (progress: number) => void;
}

/**
 * Hook to track reading progress for a given element
 */
export function useReadingProgress({
  target = null,
  updateInterval = 100,
  persistProgress = false,
  progressKey = '',
  onProgressChange
}: ReadingProgressOptions = {}) {
  const [progress, setProgress] = useState(0);
  const [startedReading, setStartedReading] = useState(false);
  const [completedReading, setCompletedReading] = useState(false);

  // Load saved progress from localStorage if persistProgress is enabled
  useEffect(() => {
    if (persistProgress && progressKey) {
      try {
        const savedProgress = localStorage.getItem(`reading_progress_${progressKey}`);
        if (savedProgress) {
          const parsed = JSON.parse(savedProgress);
          setProgress(parsed.progress || 0);
          setStartedReading(parsed.started || false);
          setCompletedReading(parsed.completed || false);
        }
      } catch (error) {
        console.error('Error loading reading progress:', error);
      }
    }
  }, [persistProgress, progressKey]);

  // Calculate scroll progress
  const calculateProgress = useCallback(() => {
    // If no target specified, use document body
    const element = target?.current || document.body;
    
    if (!element) return;
    
    // Get scroll position and dimensions
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = element.scrollHeight - window.innerHeight;
    
    if (scrollHeight <= 0) return;
    
    // Calculate progress percentage
    const currentProgress = Math.min(Math.max((scrollTop / scrollHeight) * 100, 0), 100);
    
    // Update state if progress has changed
    if (Math.abs(currentProgress - progress) > 1) {
      setProgress(currentProgress);
      
      // Call progress change callback if provided
      if (onProgressChange) {
        onProgressChange(currentProgress);
      }
      
      // Update reading states
      if (currentProgress > 5 && !startedReading) {
        setStartedReading(true);
      }
      
      if (currentProgress > 90 && !completedReading) {
        setCompletedReading(true);
      }
      
      // Persist progress if enabled
      if (persistProgress && progressKey) {
        try {
          localStorage.setItem(`reading_progress_${progressKey}`, JSON.stringify({
            progress: currentProgress,
            started: currentProgress > 5,
            completed: currentProgress > 90,
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.error('Error saving reading progress:', error);
        }
      }
    }
  }, [progress, target, persistProgress, progressKey, onProgressChange, startedReading, completedReading]);

  // Set up scroll listener
  useEffect(() => {
    // Initial calculation
    calculateProgress();
    
    // Throttled scroll listener
    let timeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(calculateProgress, updateInterval);
    };
    
    // Add event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, [calculateProgress, updateInterval]);

  // Function to reset progress
  const resetProgress = useCallback(() => {
    setProgress(0);
    setStartedReading(false);
    setCompletedReading(false);
    
    if (persistProgress && progressKey) {
      try {
        localStorage.removeItem(`reading_progress_${progressKey}`);
      } catch (error) {
        console.error('Error removing reading progress:', error);
      }
    }
  }, [persistProgress, progressKey]);

  return {
    progress,
    startedReading,
    completedReading,
    resetProgress
  };
}