
import React, { useState, useEffect } from 'react';
import { Minus, Plus, Type, BookOpen } from 'lucide-react';
import { useFontSize } from '@/hooks/use-font-size';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import './font-size-controls.css';

export function FontSizeControls() {
  const { fontSize, updateFontSize, MIN_FONT_SIZE, MAX_FONT_SIZE } = useFontSize();
  const { toast } = useToast();
  const [animated, setAnimated] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [toastDebounce, setToastDebounce] = useState<NodeJS.Timeout | null>(null);

  const increaseFontSize = () => {
    if (fontSize >= MAX_FONT_SIZE) return;
    
    updateFontSize(fontSize + 1);
    triggerAnimation();
    showFontSizeToast(fontSize + 1);
    
    if (fontSize >= MAX_FONT_SIZE - 1) {
      setBounce(true);
      toast({
        title: "Maximum Size Reached",
        description: `Font size is now at maximum (${MAX_FONT_SIZE}px)`,
        variant: "default",
        duration: 2000
      });
    }
  };

  const decreaseFontSize = () => {
    if (fontSize <= MIN_FONT_SIZE) return;
    
    updateFontSize(fontSize - 1);
    triggerAnimation();
    showFontSizeToast(fontSize - 1);
    
    if (fontSize <= MIN_FONT_SIZE + 1) {
      setBounce(true);
      toast({
        title: "Minimum Size Reached",
        description: `Font size is now at minimum (${MIN_FONT_SIZE}px)`,
        variant: "default", 
        duration: 2000
      });
    }
  };

  const showFontSizeToast = (newSize: number) => {
    // Debounce toast notifications
    if (toastDebounce) {
      clearTimeout(toastDebounce);
    }
    
    setToastDebounce(
      setTimeout(() => {
        toast({
          title: "Font Size Changed",
          description: `Text size set to ${newSize}px`,
          variant: "success",
          duration: 1500
        });
      }, 500)
    );
  };

  const triggerAnimation = () => {
    setAnimated(true);
    setTimeout(() => setAnimated(false), 300);
  };

  useEffect(() => {
    if (bounce) {
      const timer = setTimeout(() => setBounce(false), 500);
      return () => clearTimeout(timer);
    }
  }, [bounce]);
  
  // Clean up debounce timer
  useEffect(() => {
    return () => {
      if (toastDebounce) {
        clearTimeout(toastDebounce);
      }
    };
  }, [toastDebounce]);

  return (
    <TooltipProvider>
      <div className={cn("font-size-controls", bounce && "bounce-animation")}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={decreaseFontSize}
              disabled={fontSize <= MIN_FONT_SIZE}
              className={`size-btn ${fontSize <= MIN_FONT_SIZE ? 'disabled' : ''}`}
              aria-label="Decrease font size"
            >
              <Minus />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Make text smaller</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("current-size", animated && "size-changed")}>
              <span>{fontSize}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Current font size (px)</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={increaseFontSize}
              disabled={fontSize >= MAX_FONT_SIZE}
              className={`size-btn ${fontSize >= MAX_FONT_SIZE ? 'disabled' : ''}`}
              aria-label="Increase font size"
            >
              <Plus />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Make text larger</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
