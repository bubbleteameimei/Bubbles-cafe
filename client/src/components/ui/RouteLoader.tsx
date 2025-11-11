import React from "react";

export default function RouteLoader({
  label = "Loading",
  minHeight = "50vh",
}: {
  label?: string;
  minHeight?: string;
}) {
  return (
    <>
      {/* Simple loader from Uiverse.io by Leoodaviid, adapted for React and accessibility */}
      <style>{`
        .loader-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: ${minHeight};
          width: 100%;
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

        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .loader {
            animation: none;
          }
        }
      `}</style>
      <div className="loader-container" role="status" aria-live="polite" aria-busy="true" aria-label={label}>
        <div className="loader" />
      </div>
    </>
  );
}