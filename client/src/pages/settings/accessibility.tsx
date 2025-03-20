import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { TooltipsHighlighting } from '@/components/accessibility/TooltipsHighlighting';

export default function ReadingPreferencesPage() {
  const [highContrast, setHighContrast] = useState<boolean>(
    localStorage.getItem('high-contrast') === 'true' || false
  );
  const [textSize, setTextSize] = useState<number>(
    parseInt(localStorage.getItem('text-size') || '16')
  );
  const [reduceMotion, setReduceMotion] = useState<boolean>(
    localStorage.getItem('reduce-motion') === 'true' || false
  );
  const [screenReader, setScreenReader] = useState<boolean>(
    localStorage.getItem('screen-reader') === 'true' || false
  );

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('high-contrast', highContrast.toString());
    localStorage.setItem('text-size', textSize.toString());
    localStorage.setItem('reduce-motion', reduceMotion.toString());
    localStorage.setItem('screen-reader', screenReader.toString());

    // Apply settings to document
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    document.documentElement.style.setProperty('--base-text-size', `${textSize}px`);
    
    if (screenReader) {
      document.documentElement.setAttribute('role', 'application');
      document.documentElement.setAttribute('aria-label', 'Stories Reading Application');
    } else {
      document.documentElement.removeAttribute('role');
      document.documentElement.removeAttribute('aria-label');
    }
  }, [highContrast, textSize, reduceMotion, screenReader]);

  return (
    <div className="space-y-6 py-6">
      <div className="container max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">Reading Preferences</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Reading Experience</CardTitle>
              <CardDescription>Customize your reading experience for better accessibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
                <Switch 
                  id="high-contrast" 
                  checked={highContrast}
                  onCheckedChange={setHighContrast}
                  aria-label="Toggle high contrast mode"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Text Size: {textSize}px</Label>
                <Slider 
                  value={[textSize]} 
                  max={24} 
                  min={12} 
                  step={1} 
                  onValueChange={(value) => setTextSize(value[0])}
                  aria-label="Adjust text size"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="reduce-motion">Reduce Motion</Label>
                <Switch 
                  id="reduce-motion" 
                  checked={reduceMotion}
                  onCheckedChange={setReduceMotion}
                  aria-label="Toggle reduced motion"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="screen-reader">Screen Reader Optimization</Label>
                <Switch 
                  id="screen-reader" 
                  checked={screenReader}
                  onCheckedChange={setScreenReader}
                  aria-label="Toggle screen reader optimization"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* New Tooltips & Highlighting Component */}
          <TooltipsHighlighting />
        </div>
      </div>
    </div>
  );
}
