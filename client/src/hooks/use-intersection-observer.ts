
import { useEffect, useState, useRef, RefObject } from 'react';

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
}

export function useIntersectionObserver<T extends Element>({
  root = null,
  rootMargin = '0px',
  threshold = 0,
  triggerOnce = false,
}: IntersectionObserverOptions = {}): [RefObject<T>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<T>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Save current ref value for cleanup
    const currentElement = elementRef.current;
    
    // Disconnect previous observer
    if (observer.current) {
      observer.current.disconnect();
    }

    // Skip if element is not available
    if (!currentElement) return;

    // Create new observer
    observer.current = new IntersectionObserver(
      (entries) => {
        // We're only observing one element, so we can use the first entry
        const isElementVisible = entries[0]?.isIntersecting || false;
        
        setIsIntersecting(isElementVisible);
        
        // Unobserve if element is visible and triggerOnce is true
        if (isElementVisible && triggerOnce && observer.current && currentElement) {
          observer.current.unobserve(currentElement);
        }
      },
      { root, rootMargin, threshold }
    );

    // Start observing
    observer.current.observe(currentElement);

    // Cleanup on unmount
    return () => {
      if (observer.current && currentElement) {
        observer.current.unobserve(currentElement);
        observer.current.disconnect();
      }
    };
  }, [root, rootMargin, threshold, triggerOnce]);

  return [elementRef, isIntersecting];
}
