/**
 * Game Footer Component
 * 
 * This component displays game controls and information at the bottom of the game screen.
 * It includes buttons for game settings, saving, and resetting the game.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Settings, Save, RotateCcw, ArrowLeft } from 'lucide-react';
import { StoryPhase } from '../../types/game';

interface GameFooterProps {
  storyPhase?: StoryPhase;
  storyTitle?: string;
  canGoBack?: boolean;
  onSettings: () => void;
  onSave: () => void;
  onReset: () => void;
  onBack: () => void;
}

const GameFooter: React.FC<GameFooterProps> = ({
  storyPhase,
  storyTitle,
  canGoBack = false,
  onSettings,
  onSave,
  onReset,
  onBack
}) => {
  // Get phase display text
  const getPhaseText = () => {
    if (!storyPhase) return '';
    
    switch (storyPhase) {
      case StoryPhase.INTRO:
        return 'Beginning';
      case StoryPhase.EARLY:
        return 'Early';
      case StoryPhase.MID:
        return 'Middle';
      case StoryPhase.LATE:
        return 'Late';
      case StoryPhase.ENDING:
        return 'Conclusion';
      default:
        return '';
    }
  };
  
  // Get phase color based on story progress
  const getPhaseColor = () => {
    if (!storyPhase) return 'bg-zinc-700';
    
    switch (storyPhase) {
      case StoryPhase.INTRO:
        return 'bg-blue-700';
      case StoryPhase.EARLY:
        return 'bg-emerald-700';
      case StoryPhase.MID:
        return 'bg-yellow-700';
      case StoryPhase.LATE:
        return 'bg-orange-700';
      case StoryPhase.ENDING:
        return 'bg-red-700';
      default:
        return 'bg-zinc-700';
    }
  };
  
  return (
    <div className="w-full bg-black bg-opacity-80 border-t border-zinc-800 py-2 px-4 flex items-center justify-between">
      {/* Story info */}
      <div className="flex items-center space-x-3">
        <div className={`px-2 py-1 text-xs rounded-md text-white ${getPhaseColor()}`}>
          {getPhaseText()}
        </div>
        <div className="text-zinc-300 text-sm font-medium">
          {storyTitle || 'Eden\'s Hollow'}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                disabled={!canGoBack}
                className={`h-8 w-8 rounded-full ${!canGoBack ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-800'}`}
              >
                <ArrowLeft className="h-4 w-4 text-zinc-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Go Back</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSettings}
                className="h-8 w-8 rounded-full hover:bg-zinc-800"
              >
                <Settings className="h-4 w-4 text-zinc-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSave}
                className="h-8 w-8 rounded-full hover:bg-zinc-800"
              >
                <Save className="h-4 w-4 text-zinc-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Save Game</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onReset}
                className="h-8 w-8 rounded-full hover:bg-zinc-800"
              >
                <RotateCcw className="h-4 w-4 text-zinc-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Reset Game</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default GameFooter;