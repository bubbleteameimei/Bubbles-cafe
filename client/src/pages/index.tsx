import React, { lazy, Suspense } from "react";

// Lazily load the heavy index content to reduce the initial route chunk size
const StoriesIndexContent = lazy(() => import("@/components/home/StoriesIndexContent"));

export default function IndexView() {
  return (
    <Suspense fallback={null}>
      <StoriesIndexContent />
    </Suspense>
  );
}