import { memo } from "react";

/**
 * Global loading screen component for use with Suspense
 * Shows a fullscreen loading experience during code-splitting and lazy loading
 */
export const LoadingScreen = memo(() => {
  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-primary/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-1">Horror Stories</h2>
          <p className="text-lg font-medium text-foreground/80 animate-pulse">Loading...</p>
        </div>
      </div>
    </div>
  );
});

LoadingScreen.displayName = "LoadingScreen";