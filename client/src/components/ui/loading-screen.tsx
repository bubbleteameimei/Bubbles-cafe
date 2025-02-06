import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/30 backdrop-blur-[0.5px] z-50">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Loading Text Animation */}
        <div className="loader">
          <span>L</span>
          <span>O</span>
          <span>A</span>
          <span>D</span>
          <span>I</span>
          <span>N</span>
          <span>G</span>
        </div>

        {/* ARIA live region for accessibility */}
        <div className="sr-only" role="status" aria-live="polite">
          Loading content, please wait...
        </div>

        <style>{`
          .loader {
            display: flex;
            gap: 0.5rem;
          }

          .loader span {
            font-size: 22px;
            font-family: 'Space Mono', monospace;
            font-weight: 600;
            animation: blur 2s linear infinite;
            line-height: 20px;
            transition: all 0.5s;
            letter-spacing: 0.2em;
          }

          @keyframes blur {
            0%, 90% {
              filter: blur(0);
            }

            50% {
              filter: blur(2px);
            }
          }
        `}</style>
      </motion.div>
    </div>
  );
}