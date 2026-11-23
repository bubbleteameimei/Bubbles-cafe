import React, { useEffect, useState } from 'react';
import Navigation from './navigation';
import { useLocation } from 'wouter';

/**
 * AppNavbar component - fixed site header navigation (no auto-hide).
 *
 * Note: Navbar height CSS variables are defined in CSS (design-tokens.css),
 * avoiding layout reflow on first paint.
 */
const AppNavbar: React.FC = () => {
  // Keep minimal hooks: only track location to allow future route-aware behavior
  const [location] = useLocation();
  const [_currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(location);
  }, [location]);

  return (
    <div
      className="navbar-root fixed top-0 left-0 right-0 z-[100] w-full"
      style={{ width: "100%", margin: 0, padding: 0 }}
    >
      {/* Opaque-ish backdrop: the bar is fixed, so with a transparent background page
          content (hero title, story text) showed through behind the menu links. */}
      <div className="bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75 border-b border-border/60">
        <Navigation />
      </div>
    </div>
  );
};

export default AppNavbar;