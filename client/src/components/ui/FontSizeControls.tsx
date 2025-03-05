
import React, { useState, useEffect } from 'react';
import { Minus, Plus, Type } from 'lucide-react';
import { Button } from './button';
import { useFontSize } from '@/hooks/use-font-size';
import { cn } from '@/lib/utils';
import './font-size-controls.css';

export function FontSizeControls() {
  const { fontSize, updateFontSize, MIN_FONT_SIZE, MAX_FONT_SIZE } = useFontSize();
  const [animated, setAnimated] = useState(false);

  const increaseFontSize = () => {
    updateFontSize(fontSize + 1);
    triggerAnimation();
  };

  const decreaseFontSize = () => {
    updateFontSize(fontSize - 1);
    triggerAnimation();
  };

  const triggerAnimation = () => {
    setAnimated(true);
    setTimeout(() => setAnimated(false), 300);
  };

  return (
    <div className="font-size-controls">
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
      
      <div className={cn("font-size-display", animated && "font-size-changed")}>
        <Type className="h-3.5 w-3.5 inline-block mr-1" />
        <span>{fontSize}</span>
      </div>
      
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
    </div>
  );
}
