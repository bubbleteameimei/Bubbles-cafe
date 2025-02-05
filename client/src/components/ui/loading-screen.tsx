import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <motion.div
        className="flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="loader">
          <span className="loader-text">loading</span>
          <span className="load"></span>
        </div>

        {/* ARIA live region for accessibility */}
        <div className="sr-only" role="status" aria-live="polite">
          Loading content, please wait...
        </div>

        <style>{`
          .loader {
            width: 80px;
            height: 50px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .loader-text {
            position: absolute;
            top: 0;
            padding: 0;
            margin: 0;
            color: var(--primary);
            animation: text_713 3.5s ease both infinite;
            font-size: .8rem;
            letter-spacing: 1px;
            text-transform: lowercase;
            font-family: var(--font-mono);
          }

          .load {
            background-color: var(--primary);
            border-radius: 50px;
            display: block;
            height: 16px;
            width: 16px;
            bottom: 0;
            position: absolute;
            transform: translateX(64px);
            animation: loading_713 3.5s ease both infinite;
            box-shadow: 0 0 10px var(--primary);
          }

          .load::before {
            position: absolute;
            content: "";
            width: 100%;
            height: 100%;
            background-color: var(--primary);
            opacity: 0.5;
            border-radius: inherit;
            animation: loading2_713 3.5s ease both infinite;
          }

          @keyframes text_713 {
            0% {
              letter-spacing: 1px;
              transform: translateX(0px);
            }

            40% {
              letter-spacing: 2px;
              transform: translateX(26px);
            }

            80% {
              letter-spacing: 1px;
              transform: translateX(32px);
            }

            90% {
              letter-spacing: 2px;
              transform: translateX(0px);
            }

            100% {
              letter-spacing: 1px;
              transform: translateX(0px);
            }
          }

          @keyframes loading_713 {
            0% {
              width: 16px;
              transform: translateX(0px);
            }

            40% {
              width: 100%;
              transform: translateX(0px);
            }

            80% {
              width: 16px;
              transform: translateX(64px);
            }

            90% {
              width: 100%;
              transform: translateX(0px);
            }

            100% {
              width: 16px;
              transform: translateX(0px);
            }
          }

          @keyframes loading2_713 {
            0% {
              transform: translateX(0px);
              width: 16px;
            }

            40% {
              transform: translateX(0%);
              width: 80%;
            }

            80% {
              width: 100%;
              transform: translateX(0px);
            }

            90% {
              width: 80%;
              transform: translateX(15px);
            }

            100% {
              transform: translateX(0px);
              width: 16px;
            }
          }
        `}</style>
      </motion.div>
    </div>
  );
}