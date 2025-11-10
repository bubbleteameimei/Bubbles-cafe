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
      {/* Simple, robust spinner that remains visible even with reduced motion */}
      <style>{`
        .loader-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: ${minHeight};
          width: 100%;
        }
        .loader {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          /* Visible even when animations are disabled */
          border: 3px solid rgba(127, 127, 127, 0.3);
          border-top-color: currentColor;
          color: currentColor;
          animation: route_spin 0.9s linear infinite;
        }
        @keyframes route_spin {
          to { transform: rotate(360deg); }
        }
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