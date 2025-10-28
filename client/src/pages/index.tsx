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
      <style>{`
        /* From Uiverse.io by Leoodaviid */
        .loader-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 50vh;
        }
        
        .loader {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% {
            transform: rotate(0deg);
            box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.4);
          }
        
          50% {
            transform: rotate(180deg);
            box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.4);
          }
        
          100% {
            transform: rotate(360deg);
            box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.4);
          }
        }
      `}</style>
      <div className="loader-container" role="status" aria-label="Loading stories">
        <div className="loader" />
      </div>
    </>
  );

  return (
    <Suspense fallback={loader}>
      <StoriesIndexContent />
    </Suspense>
  );
}