
import React, { useState, useEffect } from 'react';
import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { Plus, Minus, BookOpen } from "lucide-react";
import { useFontSize } from "../../hooks/use-font-size-controls";
import { cn } from "../../lib/utils";
import "./font-size-controls.css";

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 24;

export function FontSizeControls() {
  const { fontSize, increaseFontSize, decreaseFontSize } = useFontSize();
  const [animated, setAnimated] = useState(false);
  const [bounce, setBounce] = useState(false);

  // Animation effect when font size changes
  useEffect(() => {
    setAnimated(true);
    const timer = setTimeout(() => setAnimated(false), 300);
    return () => clearTimeout(timer);
  }, [fontSize]);

  // Initial attention-grabbing bounce animation
  useEffect(() => {
    const timer = setTimeout(() => setBounce(true), 1000);
    const endTimer = setTimeout(() => setBounce(false), 2000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(endTimer);
    };
  }, []);

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
