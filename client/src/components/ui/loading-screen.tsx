import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[1px] z-50">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Progress Bar */}
        <div className="progress-loader">
          <div className="progress"></div>
        </div>

        {/* ARIA live region for accessibility */}
        <div className="sr-only" role="status" aria-live="polite">
          Loading content, please wait...
        </div>

        <style>{`
          .progress-loader {
            width: 200px;
            background: var(--border);
            height: 4px;
            border-radius: 7px;
            overflow: hidden;
          }

          .progress {
            content: '';
            width: 1px;
            height: 4px;
            border-radius: 7px;
            background: var(--primary);
            transition: 0.5s;
            animation: loading 2s ease infinite;
          }

          @keyframes loading {
            0% {
              width: 0%;
            }

            50% {
              width: 60%;
            }

            100% {
              width: 100%;
            }
          }
        `}</style>
      </motion.div>
    </div>
  );
}