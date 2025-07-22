import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTutorial } from '@/hooks/use-tutorial';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function TutorialTooltip() {
  const { isActive, currentStep, getCurrentStep, next, prev, stop } = useTutorial();
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const currentTutorialStep = getCurrentStep();

  useEffect(() => {
    if (!isActive || !currentTutorialStep) return;

    const updatePosition = () => {
      const element = document.querySelector(currentTutorialStep.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        const placement = currentTutorialStep.placement || 'right';
        
        let top = 0;
        let left = 0;

        switch (placement) {
          case 'top':
            top = rect.top - 10;
            left = rect.left + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + 10;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - 10;
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + 10;
            break;
        }

        setPosition({ top, left });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [isActive, currentTutorialStep]);

  if (!isActive || !currentTutorialStep) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-50 w-72"
        style={{
          top: position.top,
          left: position.left,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="bg-card border border-border shadow-lg rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">
              {currentTutorialStep.title}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={stop}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-muted-foreground mb-4">
            {currentTutorialStep.content}
          </p>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={prev}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} / {5}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={next}
              className="gap-1"
            >
              {currentStep === 4 ? 'Finish' : 'Next'} <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
