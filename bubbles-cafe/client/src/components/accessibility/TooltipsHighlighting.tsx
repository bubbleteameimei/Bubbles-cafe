import React, { useState, useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsSection } from '@/components/settings/SettingsSection';
import { SettingsFormRow } from '@/components/settings/SettingsFormRow';
import { BookOpen, Highlighter } from 'lucide-react';

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
  const [synonymsEnabled, setSynonymsEnabled] = useState<boolean>(
    localStorage.getItem('synonyms-enabled') === 'true' || false
  );

  useEffect(() => {
    // Save preferences to localStorage when they change
    localStorage.setItem('tooltips-enabled', tooltipsEnabled.toString());
    localStorage.setItem('highlighting-enabled', highlightingEnabled.toString());
    localStorage.setItem('synonyms-enabled', synonymsEnabled.toString());
    
    // Apply the changes to the document
    if (tooltipsEnabled || highlightingEnabled || synonymsEnabled) {
      document.body.classList.add('accessibility-enhanced');
    } else {
      document.body.classList.remove('accessibility-enhanced');
    }

    // This would typically be part of a more complex system that scans text
    // and applies tooltips/highlighting to complex words
  }, [tooltipsEnabled, highlightingEnabled, synonymsEnabled]);

  return (
    <SettingsSection
      title="Reading Assistance"
      description="Enable features that make text content easier to understand."
    >
      <Card>
        <CardContent className="pt-6 space-y-6">
          <SettingsFormRow
            label="Tooltips for Complex Words"
            description="Shows definitions when hovering over complex or uncommon words"
            htmlFor="tooltips"
            tooltip="When enabled, difficult words will display a definition when you hover over them"
          >
            <div className="flex items-center space-x-2">
              <Switch
                id="tooltips"
                checked={tooltipsEnabled}
                onCheckedChange={setTooltipsEnabled}
                aria-label="Enable tooltips for complex words"
              />
              <Label htmlFor="tooltips">
                {tooltipsEnabled ? 'Enabled' : 'Disabled'}
              </Label>
            </div>
          </SettingsFormRow>
          
          <SettingsFormRow
            label="Highlight Important Elements"
            description="Highlights key elements like important plot points or character introductions"
            htmlFor="highlighting"
          >
            <div className="flex items-center space-x-2">
              <Switch
                id="highlighting"
                checked={highlightingEnabled}
                onCheckedChange={setHighlightingEnabled}
                aria-label="Enable highlighting of important elements"
              />
              <Label htmlFor="highlighting">
                {highlightingEnabled ? 'Enabled' : 'Disabled'}
              </Label>
            </div>
          </SettingsFormRow>
          
          <SettingsFormRow
            label="Show Simpler Synonyms"
            description="Offers simpler alternatives for difficult words"
            htmlFor="synonyms"
            tooltip="When enabled, complex words will show simpler alternatives when available"
          >
            <div className="flex items-center space-x-2">
              <Switch
                id="synonyms"
                checked={synonymsEnabled}
                onCheckedChange={setSynonymsEnabled}
                aria-label="Enable simpler synonyms feature"
              />
              <Label htmlFor="synonyms">
                {synonymsEnabled ? 'Enabled' : 'Disabled'}
              </Label>
            </div>
          </SettingsFormRow>
          
          {/* Example of the tooltips and highlighting */}
          {(tooltipsEnabled || highlightingEnabled || synonymsEnabled) && (
            <div className="mt-4 p-4 bg-muted/50 rounded-md border">
              <p className="mb-2 text-sm font-medium">Example:</p>
              <p className="text-sm">
                The {highlightingEnabled && (
                  <span className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded" 
                    title="Main character of the story">protagonist</span>
                )}{!highlightingEnabled && <span>protagonist</span>} 
                {' '}encountered an {tooltipsEnabled && (
                  <span className="border-b border-dashed border-blue-400 cursor-help" 
                    title="Something that is difficult to understand or explain">enigmatic</span>
                )}{!tooltipsEnabled && <span>enigmatic</span>} 
                {' '}situation that required {synonymsEnabled && (
                  <span className="border-b border-dotted border-green-400 cursor-help" 
                    title="Simpler word: careful thought">deliberation</span>
                )}{!synonymsEnabled && <span>deliberation</span>}.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {highlightingEnabled && (
                  <div className="flex items-center gap-1 text-xs">
                    <Highlighter className="h-3 w-3 text-yellow-500" />
                    <span>Highlighted key elements</span>
                  </div>
                )}
                {tooltipsEnabled && (
                  <div className="flex items-center gap-1 text-xs">
                    <BookOpen className="h-3 w-3 text-blue-500" />
                    <span>Definitions available</span>
                  </div>
                )}
                {synonymsEnabled && (
                  <div className="flex items-center gap-1 text-xs">
                    <svg className="h-3 w-3 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 8h10M7 12h10M7 16h10" />
                    </svg>
                    <span>Simpler words available</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </SettingsSection>
  );
}

export default TooltipsHighlighting;