import { useEffect, useRef, useCallback, useState } from 'react';

interface UseFocusManagementOptions {
  trapFocus?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  onEscape?: () => void;
  escapeDeactivates?: boolean;
}

interface FocusableElement extends HTMLElement {
  focus(options?: FocusOptions): void;
}

export function useFocusManagement(options: UseFocusManagementOptions = {}) {
  const {
    trapFocus = false,
    autoFocus = false,
    restoreFocus = true,
    onEscape,
    escapeDeactivates = true
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const [isActive, setIsActive] = useState(false);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback((): FocusableElement[] => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      'audio[controls]',
      'video[controls]',
      'details > summary',
      'iframe'
    ].join(',');

    const elements = Array.from(
      containerRef.current.querySelectorAll(focusableSelectors)
    ) as FocusableElement[];

    return elements.filter(element => {
      // Filter out elements that are not visible or have display: none
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0 &&
        !element.hasAttribute('disabled') &&
        element.getAttribute('aria-hidden') !== 'true'
      );
    });
  }, []);

  // Focus the first focusable element
  const focusFirst = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus({ preventScroll: false });
    }
  }, [getFocusableElements]);

  // Focus the last focusable element
  const focusLast = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus({ preventScroll: false });
    }
  }, [getFocusableElements]);

  // Handle keydown events for focus management
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive) return;

    const { key, shiftKey } = event;
    const focusableElements = getFocusableElements();

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as FocusableElement;

    switch (key) {
      case 'Tab':
        if (trapFocus) {
          if (shiftKey) {
            // Shift + Tab: focus previous element
            if (activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus({ preventScroll: false });
            }
          } else {
            // Tab: focus next element
            if (activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus({ preventScroll: false });
            }
          }
        }
        break;

      case 'Escape':
        if (escapeDeactivates) {
          event.preventDefault();
          onEscape?.();
        }
        break;

      case 'Home':
        if (event.ctrlKey) {
          event.preventDefault();
          focusFirst();
        }
        break;

      case 'End':
        if (event.ctrlKey) {
          event.preventDefault();
          focusLast();
        }
        break;
    }
  }, [isActive, trapFocus, escapeDeactivates, onEscape, getFocusableElements, focusFirst, focusLast]);

  // Activate focus management
  const activate = useCallback(() => {
    if (isActive) return;

    // Store the currently active element to restore later
    (previousActiveElement as unknown as { current: Element | null }).current = document.activeElement;
    
    setIsActive(true);

    // Auto-focus the first element if enabled
    if (autoFocus) {
      // Use setTimeout to ensure the element is rendered
      setTimeout(() => {
        focusFirst();
      }, 0);
    }
  }, [isActive, autoFocus, focusFirst]);

  // Deactivate focus management
  const deactivate = useCallback(() => {
    if (!isActive) return;

    setIsActive(false);

    // Restore focus to the previously active element
    if (restoreFocus && previousActiveElement.current) {
      const elementToFocus = previousActiveElement.current as FocusableElement;
      if (elementToFocus.focus) {
        elementToFocus.focus({ preventScroll: false });
      }
      (previousActiveElement as unknown as { current: Element | null }).current = null;
    }
  }, [isActive, restoreFocus]);

  // Set up event listeners
  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isActive, handleKeyDown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActive) {
        deactivate();
      }
    };
  }, [isActive, deactivate]);

  return {
    containerRef,
    isActive,
    activate,
    deactivate,
    focusFirst,
    focusLast,
    getFocusableElements
  };
}

// Hook for managing announcements to screen readers
export function useScreenReaderAnnouncement() {
  const announcementRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcementRef.current) {
      // Create the announcement element if it doesn't exist
      const element = document.createElement('div');
      element.setAttribute('aria-live', priority);
      element.setAttribute('aria-atomic', 'true');
      element.className = 'sr-only';
      element.id = 'screen-reader-announcements';
      document.body.appendChild(element);
      (announcementRef as unknown as { current: HTMLDivElement | null }).current = element;
    }

    // Update aria-live attribute if priority changed
    announcementRef.current.setAttribute('aria-live', priority);
    
    // Clear previous message
    if (announcementRef.current) {
      announcementRef.current.textContent = '';
    }
    
    // Set new message after a brief delay to ensure screen readers pick it up
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = message;
      }
    }, 100);

    // Clear the message after it's been announced
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = '';
      }
    }, 1000);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (announcementRef.current?.parentNode) {
        announcementRef.current.parentNode.removeChild(announcementRef.current);
      }
    };
  }, []);

  return { announce };
}

// Hook for managing reduced motion preferences
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Hook for managing high contrast preferences
export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
}

// Hook for keyboard navigation patterns
export function useKeyboardNavigation(items: any[], options: {
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  onSelect?: (index: number) => void;
} = {}) {
  const { orientation = 'vertical', loop = true, onSelect } = options;
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!items.length) return;

    const { key } = event;
    let newIndex = activeIndex;

    switch (key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          newIndex = activeIndex < items.length - 1 ? activeIndex + 1 : loop ? 0 : activeIndex;
        }
        break;

      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          newIndex = activeIndex > 0 ? activeIndex - 1 : loop ? items.length - 1 : activeIndex;
        }
        break;

      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          newIndex = activeIndex < items.length - 1 ? activeIndex + 1 : loop ? 0 : activeIndex;
        }
        break;

      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          newIndex = activeIndex > 0 ? activeIndex - 1 : loop ? items.length - 1 : activeIndex;
        }
        break;

      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelect?.(activeIndex);
        break;
    }

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  }, [activeIndex, items.length, orientation, loop, onSelect]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  return {
    containerRef,
    activeIndex,
    setActiveIndex,
    handleKeyDown
  };
}