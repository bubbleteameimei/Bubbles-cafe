import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer, EyeOff, ArrowUp } from 'lucide-react';

interface ReaderTooltipProps {
  show: boolean;
}

const ReaderTooltip = ({ show }: ReaderTooltipProps) => {
  if (!show) return null;
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-12 sm:bottom-16 inset-x-0 z-50 pointer-events-none" // Use inset-x-0 instead of left + transform
        >
          {/* Use the exact same container class as the About page to ensure consistent width */}
          <div className="container max-w-4xl mx-auto px-4">
            <motion.div 
              className="bg-background/90 border border-primary/20 backdrop-blur-md shadow-md rounded-lg px-4 py-3 flex flex-col items-center gap-1 text-center mx-auto"
              animate={{ y: [0, -5, 0] }}
              transition={{ 
                y: { repeat: 2, duration: 1.2, repeatType: "reverse", ease: "easeInOut" },
                delay: 0.5
              }}
            >
              <div className="flex items-center gap-2 whitespace-nowrap">
                <EyeOff className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  Tap story to toggle distraction-free mode
                </span>
                <MousePointer className="h-3 w-3 text-primary/80" />
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <ArrowUp className="h-3 w-3" />
                <span>Press ESC key to exit</span>
                <ArrowUp className="h-3 w-3" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReaderTooltip;