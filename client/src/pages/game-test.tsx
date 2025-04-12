/**
 * Game Test Page
 * 
 * This page provides a full-screen environment for the Eden's Hollow game.
 * It's used for testing and development before integration with the main site.
 */

import React, { useState } from 'react';
import { Link } from "wouter";
import EdenHollowGame from "@/components/EdenHollowGame";

export default function GameTestPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with Back Button */}
      <header className="px-6 py-4 bg-zinc-900">
        <div className="flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center text-zinc-400 hover:text-white transition-colors">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span>Back to Home</span>
            </a>
          </Link>
          <div className="text-lg font-semibold">Eden's Hollow - Experimental</div>
          <div className="w-24"></div> {/* Spacer for symmetry */}
        </div>
      </header>
      
      {/* Game Container */}
      <div className="w-full" style={{ height: "calc(100vh - 64px)" }}>
        <EdenHollowGame />
      </div>
      
      {/* Game Instructions - Hidden, will show with a toggle */}
      <div className="hidden fixed bottom-0 left-0 right-0 bg-zinc-900 bg-opacity-90 p-4 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-lg font-medium mb-2">Eden's Hollow - Game Controls</h3>
          <ul className="text-sm text-zinc-300 grid grid-cols-2 gap-x-8 gap-y-1">
            <li className="flex items-center">
              <span className="bg-zinc-800 text-xs rounded px-2 py-1 mr-2 min-w-[80px] text-center">Arrow Keys</span>
              <span>Navigate choices</span>
            </li>
            <li className="flex items-center">
              <span className="bg-zinc-800 text-xs rounded px-2 py-1 mr-2 min-w-[80px] text-center">Enter/Space</span>
              <span>Select choice</span>
            </li>
            <li className="flex items-center">
              <span className="bg-zinc-800 text-xs rounded px-2 py-1 mr-2 min-w-[80px] text-center">ESC</span>
              <span>Open settings</span>
            </li>
            <li className="flex items-center">
              <span className="bg-zinc-800 text-xs rounded px-2 py-1 mr-2 min-w-[80px] text-center">Backspace</span>
              <span>Go back (when available)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}