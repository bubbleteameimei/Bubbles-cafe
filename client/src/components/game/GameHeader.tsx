/**
 * Eden's Hollow Game Header
 * 
 * Header component for the Eden's Hollow game.
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function GameHeader() {
  return (
    <header className="bg-black/80 border-b border-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/game-test">
            <Button variant="outline" size="sm" className="text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Game Hub
            </Button>
          </Link>
          <h1 className="text-xl font-serif tracking-wider text-white">Eden's Hollow</h1>
        </div>
        <div className="text-sm text-gray-400">
          <span>Interactive Horror Experience</span>
        </div>
      </div>
    </header>
  );
}