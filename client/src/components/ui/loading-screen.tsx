import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <motion.div
        className="flex flex-col items-center gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Text Loading Animation */}
        <div className="loader">
          <span>L</span>
          <span>O</span>
          <span>A</span>
          <span>D</span>
          <span>I</span>
          <span>N</span>
          <span>G</span>
        </div>

        {/* Progress Bar */}
        <div className="progress-loader">
          <div className="progress"></div>
        </div>

        {/* ARIA live region for accessibility */}
        <div className="sr-only" role="status" aria-live="polite">
          Loading content, please wait...
        </div>

        <style>{`
          .loader {
            display: flex;
            gap: 0.5em;
          }

          .loader span {
            font-size: 22px;
            font-family: var(--font-sans);
            font-weight: 600;
            animation: blur 3s linear infinite;
            line-height: 20px;
            transition: all 0.5s;
            letter-spacing: 0.2em;
            color: var(--primary);
          }

          @keyframes blur {
            0%, 90% {
              filter: blur(0);
            }

            50% {
              filter: blur(10px);
            }
          }

          .progress-loader {
            width: 150px;
            background: var(--border);
            height: 3px;
            border-radius: 7px;
            overflow: hidden;
          }

          .progress {
            content: '';
            width: 1px;
            height: 3px;
            border-radius: 7px;
            background: var(--primary);
            transition: 0.5s;
            animation: loading1274 2s ease infinite;
          }

          @keyframes loading1274 {
            0% {
              width: 0%;
            }

            10% {
              width: 10%;
            }

            50% {
              width: 40%;
            }

            60% {
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