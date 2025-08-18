import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface VirtualScrollAreaProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactElement;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualScrollArea<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll
}: VirtualScrollAreaProps<T>) {
  const mark = useCallback((_label: string) => {}, []);
  const measure = useCallback((_name: string, _start: string, _end: string) => {}, []);
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    mark('calculate-range-start');
    
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    // Add overscan items
    const overscanStartIndex = Math.max(0, startIndex - overscan);
    const overscanEndIndex = Math.min(items.length - 1, endIndex + overscan);

    measure('calculate-range-duration', 'calculate-range-start');
    
    return {
      startIndex: overscanStartIndex,
      endIndex: overscanEndIndex,
      visibleStartIndex: startIndex,
      visibleEndIndex: endIndex
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    mark('slice-items-start');
    const sliced = items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
    measure('slice-items-duration', 'slice-items-start');
    return sliced;
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // Handle scroll with throttling
  const handleScroll = useCallback(() => {
    if (!scrollElementRef.current) return;
    
    const newScrollTop = scrollElementRef.current.scrollTop;
    setScrollTop(newScrollTop);
    
    if (onScroll) {
      onScroll(newScrollTop);
    }
  }, [onScroll]);

  // Throttled scroll handler
  const throttledScrollHandler = useMemo(() => {
    let ticking = false;
    
    return () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
  }, [handleScroll]);

  // Set up scroll listener
  useEffect(() => {
    const scrollElement = scrollElementRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener('scroll', throttledScrollHandler, { passive: true });
    
    return () => {
      scrollElement.removeEventListener('scroll', throttledScrollHandler);
    };
  }, [throttledScrollHandler]);

  // Calculate positioning
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return (
    <div
      ref={scrollElementRef}
      className={`virtual-scroll-area overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      {/* Total height spacer */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return (
              <div
                key={actualIndex}
                style={{
                  height: itemHeight,
                  overflow: 'hidden'
                }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Hook for virtual scrolling with dynamic item heights
export function useDynamicVirtualScroll<T>(
  items: T[],
  estimatedItemHeight: number,
  containerHeight: number
) {
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map());
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate item positions
  const itemPositions = useMemo(() => {
    const positions: number[] = [];
    let totalHeight = 0;

    items.forEach((_, index) => {
      positions[index] = totalHeight;
      const height = itemHeights.get(index) || estimatedItemHeight;
      totalHeight += height;
    });

    return { positions, totalHeight };
  }, [items, itemHeights, estimatedItemHeight]);

  // Find visible range with binary search
  const visibleRange = useMemo(() => {
    const { positions } = itemPositions;
    
    const findStartIndex = () => {
      let left = 0;
      let right = items.length - 1;
      
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (positions[mid] <= scrollTop) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      
      return Math.max(0, right);
    };

    const startIndex = findStartIndex();
    let endIndex = startIndex;
    let visibleHeight = 0;

    while (endIndex < items.length && visibleHeight < containerHeight) {
      const height = itemHeights.get(endIndex) || estimatedItemHeight;
      visibleHeight += height;
      endIndex++;
    }

    return {
      startIndex: Math.max(0, startIndex - 2), // Small overscan
      endIndex: Math.min(items.length - 1, endIndex + 2)
    };
  }, [scrollTop, containerHeight, items.length, itemPositions, itemHeights, estimatedItemHeight]);

  // Update item height
  const updateItemHeight = useCallback((index: number, height: number) => {
    setItemHeights(prev => {
      if (prev.get(index) === height) return prev;
      const newMap = new Map(prev);
      newMap.set(index, height);
      return newMap;
    });
  }, []);

  return {
    visibleRange,
    itemPositions,
    scrollTop,
    setScrollTop,
    updateItemHeight
  };
}

// Component for dynamic height virtual scrolling
export function DynamicVirtualScrollArea<T>({
  items,
  estimatedItemHeight,
  containerHeight,
  renderItem,
  className = '',
  onScroll
}: {
  items: T[];
  estimatedItemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number, updateHeight: (height: number) => void) => React.ReactElement;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}) {
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const {
    visibleRange,
    itemPositions,
    scrollTop,
    setScrollTop,
    updateItemHeight
  } = useDynamicVirtualScroll(items, estimatedItemHeight, containerHeight);

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (!scrollElementRef.current) return;
    
    const newScrollTop = scrollElementRef.current.scrollTop;
    setScrollTop(newScrollTop);
    
    if (onScroll) {
      onScroll(newScrollTop);
    }
  }, [setScrollTop, onScroll]);

  // Set up scroll listener
  useEffect(() => {
    const scrollElement = scrollElementRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const visibleItems = items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);

  return (
    <div
      ref={scrollElementRef}
      className={`dynamic-virtual-scroll-area overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ height: itemPositions.totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => {
          const actualIndex = visibleRange.startIndex + index;
          const position = itemPositions.positions[actualIndex];
          
          return (
            <div
              key={actualIndex}
              style={{
                position: 'absolute',
                top: position,
                left: 0,
                right: 0
              }}
            >
              {renderItem(item, actualIndex, (height) => updateItemHeight(actualIndex, height))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VirtualScrollArea;