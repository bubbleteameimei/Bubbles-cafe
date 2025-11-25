import { useEffect, useRef, useState } from 'react';

interface ReaderScrollProgressOptions {
  /**
   * Optional callback whenever the raw scroll-based progress changes.
   * Useful for consumers that want to react to progress updates.
   */
  onProgressChange?: (progress: number) => void;
}

/**
 * Reader-specific scroll progress hook with rAF-based smoothing.
 *
 * This centralises the logic that was previously embedded directly in
 * the reader page component so it can be reused and tested in isolation.
 */
export function useReaderScrollProgress(options: ReaderScrollProgressOptions = {}) {
  const { onProgressChange } = options;

  const [readingProgress, setReadingProgress] = useState(0);
  // Smooth, GPU-friendly animated progress value
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const progressCurrentRef = useRef(0);
  const progressTargetRef = useRef(0);
  const progressRAFRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    let ticking = false;
    let scrollRafId: number | null = null;

    const animate = () => {
      const target = progressTargetRef.current;
      const current = progressCurrentRef.current;
      // Direction-aware smoothing: slower when decreasing (scrolling up),
      // faster when increasing, to feel more responsive when reading forward.
      const factor = target < current ? 0.12 : 0.24;
      const next = current + (target - current) * factor;
      progressCurrentRef.current = next;
      setAnimatedProgress(next);

      if (Math.abs(target - next) > 0.08) {
        progressRAFRef.current = window.requestAnimationFrame(animate);
      } else {
        progressCurrentRef.current = target;
        setAnimatedProgress(target);
        progressRAFRef.current = null;
      }
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      const progress = Math.min(100, Math.max(0, scrollPercent));

      setReadingProgress(progress);
      progressTargetRef.current = progress;

      if (typeof onProgressChange === 'function') {
        try {
          onProgressChange(progress);
        } catch {
          // ignore consumer errors – reading should never break
        }
      }

      if (!progressRAFRef.current) {
        progressRAFRef.current = window.requestAnimationFrame(animate);
      }
    };

    // Throttle scroll events via rAF for better performance.
    const throttledHandleScroll = () => {
      if (!ticking) {
        scrollRafId = window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
          scrollRafId = null;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    // Initial calculation so progress is correct on first paint.
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (scrollRafId != null) {
        window.cancelAnimationFrame(scrollRafId);
      }
      if (progressRAFRef.current != null) {
        window.cancelAnimationFrame(progressRAFRef.current);
        progressRAFRef.current = null;
      }
    };
  }, [onProgressChange]);

  return { readingProgress, animatedProgress };
}

export default useReaderScrollProgress;