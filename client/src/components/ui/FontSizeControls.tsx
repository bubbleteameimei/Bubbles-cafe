
import React, { useState, useEffect } from 'react';
import { Minus, Plus, Type, BookOpen } from 'lucide-react';
import { Button } from './button';
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
            <Button
              variant="ghost"
              size="icon"
              onClick={decreaseFontSize}
              disabled={fontSize <= MIN_FONT_SIZE}
              className="font-size-btn decrease"
              aria-label="Decrease font size"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Make text smaller</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("font-size-display", animated && "font-size-changed")}>
              <BookOpen className="h-3.5 w-3.5 inline-block mr-1 opacity-70" />
              <span>{fontSize}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Current font size</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={increaseFontSize}
              disabled={fontSize >= MAX_FONT_SIZE}
              className="font-size-btn increase"
              aria-label="Increase font size"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Make text larger</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
