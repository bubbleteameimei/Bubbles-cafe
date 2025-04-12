/**
 * Eden's Hollow Game Content
 * 
 * Displays the current passage text and choices.
 */

import React from 'react';
import { GameState, Story, Passage, Choice } from '../../types/game';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface GameContentProps {
  gameState: GameState;
  currentStory: Story | null;
  currentPassage: Passage | null;
  showLowSanityEffects: boolean;
  onChoice: (choice: Choice) => void;
  canMakeChoice: boolean;
  onConfirm: (confirmed: boolean) => void;
  isConfirmationOpen: boolean;
}

export default function GameContent({
  gameState,
  currentStory,
  currentPassage,
  showLowSanityEffects,
  onChoice,
  canMakeChoice,
  onConfirm,
  isConfirmationOpen
}: GameContentProps) {
  if (!currentStory || !currentPassage) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xl">Loading story...</p>
      </div>
    );
  }

  // Compute text style based on sanity
  const textStyle = showLowSanityEffects 
    ? "text-lg leading-relaxed max-w-3xl mx-auto p-6 text-red-100 transition-colors duration-500"
    : "text-lg leading-relaxed max-w-3xl mx-auto p-6 text-gray-100 transition-colors duration-500";

  // Compute container style based on phase
  const containerStyle = () => {
    switch (currentPassage.phase) {
      case 'danger':
        return "bg-red-900/20 transition-colors duration-1000";
      case 'exploration':
        return "bg-blue-900/10 transition-colors duration-1000";
      case 'climax':
        return "bg-purple-900/20 transition-colors duration-1000";
      case 'resolution':
        return "bg-green-900/10 transition-colors duration-1000";
      default:
        return "bg-gray-900/30 transition-colors duration-1000";
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center py-6 px-4">
      {/* Sanity Meter */}
      <div className="w-full max-w-xl mb-6">
        <div className="flex justify-between text-xs mb-1">
          <span>Sanity</span>
          <span>{gameState.sanity}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              gameState.sanity > 70 ? 'bg-green-600' : 
              gameState.sanity > 40 ? 'bg-yellow-500' : 
              'bg-red-600'
            } transition-all duration-1000 ease-in-out`}
            style={{ width: `${gameState.sanity}%` }}
          ></div>
        </div>
      </div>

      {/* Story Content */}
      <div className={`w-full max-w-3xl rounded-lg shadow-lg overflow-hidden ${containerStyle()}`}>
        <div className={textStyle}>
          {currentPassage.text.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4">{paragraph}</p>
          ))}
        </div>

        {/* Choices */}
        <div className="p-6 bg-black/50">
          <div className="flex flex-col space-y-3">
            {currentPassage.choices.map((choice) => (
              <Button
                key={choice.id}
                variant={choice.critical ? "destructive" : "default"}
                disabled={!canMakeChoice}
                onClick={() => onChoice(choice)}
                className="justify-start text-left py-3"
              >
                {choice.text}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmationOpen} onOpenChange={() => onConfirm(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This choice could have significant consequences. Are you certain you want to proceed?
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => onConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => onConfirm(true)}>Yes, I'm Sure</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}