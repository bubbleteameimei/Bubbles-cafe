/**
 * Game Header Component
 * 
 * This component renders the header for the Eden's Hollow game.
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';

export interface GameHeaderProps {
  title?: string;
  sanity?: number;
}

export default function GameHeader({
  title = "Eden's Hollow",
  sanity = 100
}: GameHeaderProps) {
  // Determine sanity level badge color
  const getSanityBadgeColor = () => {
    if (sanity > 70) return 'bg-green-700 hover:bg-green-700';
    if (sanity > 40) return 'bg-amber-700 hover:bg-amber-700'; 
    return 'bg-red-800 hover:bg-red-800';
  };
  
  // Determine sanity level text
  const getSanityText = () => {
    if (sanity > 70) return 'Stable';
    if (sanity > 40) return 'Unstable';
    return 'Critical';
  };
  
  return (
    <header className="game-header p-3 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
      <h1 className="text-xl font-serif tracking-wide text-gray-200">{title}</h1>
      
      <div className="sanity-meter flex items-center gap-3">
        <div className="text-sm text-gray-400">Mental State:</div>
        <Badge className={getSanityBadgeColor()}>
          {getSanityText()} ({sanity}%)
        </Badge>
      </div>
    </header>
  );
}