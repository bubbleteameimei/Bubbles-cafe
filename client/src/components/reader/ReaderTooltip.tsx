import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer, EyeOff, ArrowUp } from 'lucide-react';

interface ReaderTooltipProps {
  show: boolean;
}

const ReaderTooltip = ({ show }: ReaderTooltipProps) => {
  if (!show) return null;

  // Sit near the bottom of the viewport (above the back-to-top button and the
  // iPhone home indicator) so the hint never covers the story text itself.
  const bottomOffset = 'calc(5.5rem + env(safe-area-inset-bottom, 0px))';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-x-0 z-[1000] pointer-events-none flex justify-center px-4"
          style={{ bottom: bottomOffset }}
        >
          <div className="w-fit max-w-full">
            <motion.div 
              className="relative bg-background/95 border border-primary/30 ring-2 ring-primary/30 backdrop-blur-md shadow-xl rounded-full px-5 py-2.5 flex flex-col items-center gap-0.5 text-center mx-auto"
              animate={{ y: [0, -5, 0], scale: [1, 1.02, 1] }}
              transition={{ 
                y: { repeat: 2, duration: 1.2, repeatType: "reverse", ease: "easeInOut" },
                scale: { duration: 1.2, ease: "easeInOut" },
                delay: 0.4
              }}
            >
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">
                  Tap story to toggle distraction-free mode
                </span>
                <MousePointer className="h-3 w-3 text-primary/80" />
              </div>
              {/* ESC only makes sense with a keyboard */}
              <div className="text-xs text-muted-foreground hidden [@media(pointer:fine)]:flex items-center gap-1.5">
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