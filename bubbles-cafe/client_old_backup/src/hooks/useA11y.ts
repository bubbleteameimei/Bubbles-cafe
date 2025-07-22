
import { useEffect } from 'react';

export function useA11y() {
  useEffect(() => {
    // Find all interactive elements without proper attributes
    const interactiveElements = document.querySelectorAll(
      'button:not([aria-label]):not([aria-labelledby]), a:not([aria-label]):not([aria-labelledby])'
    );
    
    // Add missing attributes based on content
    interactiveElements.forEach(el => {
      if (!el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) {
        const text = el.textContent?.trim();
        if (text) {
          el.setAttribute('aria-label', text);
        }
      }
    });
    
    // Ensure all images have alt text
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach(img => {
      const parent = img.parentElement;
      if (parent) {
        const nearbyText = parent.textContent?.trim();
        if (nearbyText) {
          img.setAttribute('alt', nearbyText);
        } else {
          img.setAttribute('alt', 'Image');
        }
      } else {
        img.setAttribute('alt', 'Image');
      }
    });
    
    // Check for keyboard navigation
    document.addEventListener('keydown', handleTabKey);
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, []);
}

function handleTabKey(e: KeyboardEvent) {
  // Add focus styles when using keyboard navigation
  if (e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing');
    
    document.removeEventListener('keydown', handleTabKey);
    document.addEventListener('mousedown', handleMouseDown);
  }
}

function handleMouseDown() {
  // Remove focus styles when using mouse
  document.body.classList.remove('user-is-tabbing');
  
  document.removeEventListener('mousedown', handleMouseDown);
  document.addEventListener('keydown', handleTabKey);
}
