import React, { lazy, Suspense } from "react";
import { LoadingScreen } from "@/components/ui/loading-screen";

// Lazily load the heavy index content to reduce the initial route chunk size
const StoriesIndexContent = lazy(() => import("@/components/home/StoriesIndexContent"));

export default function IndexView() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <StoriesIndexContent />
    </Suspense>
  );
}