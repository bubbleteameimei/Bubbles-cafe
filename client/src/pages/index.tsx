import React, { lazy, Suspense } from "react";

// Lazily load the heavy index content to reduce the initial route chunk size
const StoriesIndexContent = lazy(() => import("@/components/home/StoriesIndexContent"));

export default function IndexView() {
  return (
    <Suspense
      fallback={
        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          className="w-full flex items-center justify-center py-12 min-h-screen"
        >
          <div
            className="inline-flex items-center gap-3 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <span
              className="inline-block animate-spin rounded-full border-solid border-primary border-r-transparent align-[-0.125em] w-6 h-6 border-2"
              aria-hidden="true"
            />
            Loading stories…
          </div>
        </main>
      }
    >
      <StoriesIndexContent />
    </Suspense>
  );
}