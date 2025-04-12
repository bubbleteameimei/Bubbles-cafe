/**
 * Eden's Hollow Game Footer
 * 
 * Footer component for the Eden's Hollow game.
 */

import React from 'react';
import { Save, Settings, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoryPhase } from '../../types/game';

interface GameFooterProps {
  storyPhase?: StoryPhase;
  storyTitle?: string;
  onSave: () => void;
  onSettings: () => void;
  onReset: () => void;
}

export default function GameFooter({
  storyPhase,
  storyTitle,
  onSave,
  onSettings,
  onReset
}: GameFooterProps) {
  // Phase-specific descriptions
  const getPhaseText = () => {
    if (!storyPhase) return "";
    
    switch (storyPhase) {
      case 'intro':
        return "Beginning your journey...";
      case 'exploration':
        return "Exploring the unknown...";
      case 'danger':
        return "Danger approaches...";
      case 'climax':
        return "A critical moment...";
      case 'resolution':
        return "Finding resolution...";
      default:
        return "";
    }
  };

  return (
    <footer className="bg-black/80 border-t border-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="text-sm text-gray-400 mb-3 sm:mb-0">
          <div className="flex items-center">
            <span className={`h-2 w-2 rounded-full mr-2 ${
              storyPhase === 'danger' || storyPhase === 'climax' 
                ? 'bg-red-500 animate-pulse' 
                : 'bg-green-500'
            }`}></span>
            <span>{getPhaseText()}</span>
          </div>
          <div className="mt-1">
            <span className="text-xs opacity-50">{storyTitle || "Eden's Hollow"}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={onSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </footer>
  );
}