import React, { useState, useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TooltipsHighlightingProps {
  defaultEnabled?: boolean;
}

/**
 * Component for managing tooltips and highlighting of complex words
 * This component allows users to enable or disable tooltips for complex words
 * and adjust highlighting preferences
 */
export function TooltipsHighlighting({ defaultEnabled = false }: TooltipsHighlightingProps) {
  const [tooltipsEnabled, setTooltipsEnabled] = useState<boolean>(
    localStorage.getItem('tooltips-enabled') === 'true' || defaultEnabled
  );
  const [highlightingEnabled, setHighlightingEnabled] = useState<boolean>(
    localStorage.getItem('highlighting-enabled') === 'true' || defaultEnabled
  );

  useEffect(() => {
    // Save preferences to localStorage when they change
    localStorage.setItem('tooltips-enabled', tooltipsEnabled.toString());
    localStorage.setItem('highlighting-enabled', highlightingEnabled.toString());
    
    // Apply the changes to the document
    if (tooltipsEnabled || highlightingEnabled) {
      document.body.classList.add('accessibility-enhanced');
    } else {
      document.body.classList.remove('accessibility-enhanced');
    }

    // This would typically be part of a more complex system that scans text
    // and applies tooltips/highlighting to complex words
  }, [tooltipsEnabled, highlightingEnabled]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tooltips & Highlighting</CardTitle>
        <CardDescription>
          Enable tooltips and highlighting for complex words to improve readability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="tooltips">Tooltips for Complex Words</Label>
            <p className="text-sm text-muted-foreground">
              Shows definitions when hovering over complex or uncommon words
            </p>
          </div>
          <Switch
            id="tooltips"
            checked={tooltipsEnabled}
            onCheckedChange={setTooltipsEnabled}
            aria-label="Enable tooltips for complex words"
            size="md"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="highlighting">Highlight Important Elements</Label>
            <p className="text-sm text-muted-foreground">
              Highlights key elements like important plot points or character introductions
            </p>
          </div>
          <Switch
            id="highlighting"
            checked={highlightingEnabled}
            onCheckedChange={setHighlightingEnabled}
            aria-label="Enable highlighting of important elements"
            size="md"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default TooltipsHighlighting;