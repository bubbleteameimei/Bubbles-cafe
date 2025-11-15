import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer, EyeOff, ArrowUp } from 'lucide-react';

interface ReaderTooltipProps {
  show: boolean;
}

const ReaderTooltip = ({ show }: ReaderTooltipProps) => {
  if (!show) return null;

  // Position the tooltip near the bottom of the viewport, just above where the BackToTop button sits.
  // BackToTop sits at ~24px from the bottom and is ~40-48px tall, so offset ~72px keeps a clear gap.
  const topOffset = '52vh';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-x-0 z-[1000] pointer-events-none"
          style={{ top: topOffset }}
        >
          {/* Use the exact same container class as the About page to ensure consistent width */}
          <div className="container max-w-4xl mx-auto px-4">
            <motion.div 
              className="relative bg-background/95 border border-primary/30 ring-2 ring-primary/30 backdrop-blur-md shadow-xl rounded-lg px-4 py-3 flex flex-col items-center gap-1 text-center mx-auto"
              animate={{ y: [0, -5, 0], scale: [1, 1.02, 1] }}
              transition={{ 
                y: { repeat: 2, duration: 1.2, repeatType: "reverse", ease: "easeInOut" },
                scale: { duration: 1.2, ease: "easeInOut" },
                delay: 0.4
              }}
            >
              <div className="absolute top-0 inset-x-6 h-[2px] bg-primary/40 rounded-full" />
              <div className="flex items-center gap-2 whitespace-nowrap">
                <EyeOff className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">
                  Use “Hide UI” to enter distraction-free mode
                </span>
              </div>
              <div className="text-xs text-foreground mt-0.5 flex items-center gap-1.5">
                <ArrowUp className="h-3 w-3 text-primary" />
                <span>Press ESC key to exit</span>
                <ArrowUp className="h-3 w-3 text-primary" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReaderTooltip;