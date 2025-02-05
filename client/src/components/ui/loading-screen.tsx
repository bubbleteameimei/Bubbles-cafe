import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Gothic Candle Animation */}
        <motion.div 
          className="relative w-24 h-32 mb-6"
          animate={{ 
            filter: [
              "drop-shadow(0 0 15px rgba(255,147,47,0.3))",
              "drop-shadow(0 0 25px rgba(255,147,47,0.5))",
              "drop-shadow(0 0 15px rgba(255,147,47,0.3))"
            ]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-16 bg-gradient-to-t from-primary/80 to-primary"
            animate={{
              height: ["4rem", "4.2rem", "4rem"],
              width: ["1rem", "1.1rem", "1rem"]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-[4rem] left-1/2 -translate-x-1/2 w-2 h-2"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full bg-orange-300 rounded-full blur-[2px]" />
          </motion.div>
        </motion.div>

        {/* Loading Text */}
        <motion.p
          className="text-foreground/80 font-serif text-lg"
          animate={{ 
            opacity: [0.5, 1, 0.5],
            filter: [
              "drop-shadow(0 0 2px rgba(255,255,255,0.3))",
              "drop-shadow(0 0 4px rgba(255,255,255,0.5))",
              "drop-shadow(0 0 2px rgba(255,255,255,0.3))"
            ]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2,
            ease: "easeInOut"
          }}
        >
          Summoning dark tales...
        </motion.p>

        {/* ARIA live region for accessibility */}
        <div className="sr-only" role="status" aria-live="polite">
          Loading content, please wait...
        </div>
      </motion.div>
    </div>
  );
}