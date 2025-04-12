/**
 * Eden's Hollow Game Page
 * 
 * This page displays the Eden's Hollow interactive horror game experience.
 * The game is implemented using React components that provide a narrative-based
 * horror experience with branching storylines.
 */

import React from 'react';
import EdenHollowGame from '../components/EdenHollowGame';
import { Link } from 'wouter';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GameTestPage() {
  return (
    <div className="game-page">
      <header className="game-header">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="outline" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Eden's Hollow</h1>
          </div>
          
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
        <p className="mt-2 text-muted-foreground">A dark interactive horror experience - choose your path wisely</p>
      </header>

      <main className="game-container">
        <div className="game-wrapper">
          <EdenHollowGame className="w-full h-full" />
        </div>
        
        <div className="game-info">
          <div className="game-controls">
            <h3 className="text-xl font-semibold mb-2">Game Features</h3>
            <ul className="space-y-1">
              <li className="flex items-center">
                <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-sm mr-2 font-mono">Choices</span>
                <span>Your decisions impact the story and your character's sanity</span>
              </li>
              <li className="flex items-center">
                <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-sm mr-2 font-mono">Sanity</span>
                <span>Maintain your sanity or experience a different reality</span>
              </li>
              <li className="flex items-center">
                <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-sm mr-2 font-mono">Save</span>
                <span>Save your progress and revisit later</span>
              </li>
            </ul>
          </div>
          
          <div className="game-description mt-6">
            <h3 className="text-xl font-semibold mb-2">About Eden's Hollow</h3>
            <p className="text-muted-foreground">
              Eden's Hollow is a psychological horror experience with multiple branching storylines.
              Your choices influence the narrative and can lead to different endings. 
              Explore the dark corners of the town while maintaining your sanity.
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>Warning:</strong> This game contains themes of psychological horror and may not be suitable for all audiences.
            </p>
          </div>
        </div>
      </main>

      <style>{`
        .game-page {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .game-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid hsl(var(--border));
        }

        .game-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 1024px) {
          .game-container {
            grid-template-columns: 3fr 1fr;
          }
        }

        .game-wrapper {
          background-color: hsl(var(--secondary));
          padding: 1rem;
          border-radius: var(--radius);
          border: 1px solid hsl(var(--border));
          min-height: 600px;
          overflow: hidden;
        }

        .game-info {
          padding: 1.5rem;
          border-radius: var(--radius);
          border: 1px solid hsl(var(--border));
          background-color: hsl(var(--card));
        }

        .game-controls {
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
}