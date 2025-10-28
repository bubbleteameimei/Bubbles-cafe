import React, { lazy, Suspense } from "react";
import RouteLoader from "@/components/ui/RouteLoader";

// Lazily load the heavy index content to reduce the initial route chunk size
const StoriesIndexContent = lazy(() => import("@/components/home/StoriesIndexContent"));

export default function IndexView() {
  return (
    <Suspense fallback={<RouteLoader label="Loading stories" minHeight="50vh" />}>
      <StoriesIndexContent />
    </Suspense>
  );
}