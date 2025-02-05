
import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <motion.svg
          className="w-20 h-20 mb-4 text-primary"
          viewBox="0 0 24 24"
          animate={{ 
            rotate: [0, 360],
            filter: ["drop-shadow(0 0 0px currentColor)", "drop-shadow(0 0 8px currentColor)"]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 5L5 19M5 5l14 14"
            stroke="currentColor"
            fill="none"
          />
        </motion.svg>
        <motion.p
          className="text-foreground/80 font-serif"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Summoning dark tales...
        </motion.p>
      </motion.div>
    </div>
  );
}
