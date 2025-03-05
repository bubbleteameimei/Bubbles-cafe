
import React, { useState, useEffect } from 'react';
import { Minus, Plus, Type, BookOpen } from 'lucide-react';
import { Button } from './button';
import { useFontSize } from '@/hooks/use-font-size';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import './font-size-controls.css';

export function FontSizeControls() {
  const { fontSize, updateFontSize, MIN_FONT_SIZE, MAX_FONT_SIZE } = useFontSize();
  const [animated, setAnimated] = useState(false);
  const [bounce, setBounce] = useState(false);

  const increaseFontSize = () => {
    updateFontSize(fontSize + 1);
    triggerAnimation();
    if (fontSize >= MAX_FONT_SIZE - 1) {
      setBounce(true);
    }
  };

  const decreaseFontSize = () => {
    updateFontSize(fontSize - 1);
    triggerAnimation();
    if (fontSize <= MIN_FONT_SIZE + 1) {
      setBounce(true);
    }
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
              <BookOpen className="h-3.5 w-3.5 inline-block mr-1" />
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
