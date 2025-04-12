/**
 * Eden's Hollow Game Test Page
 * 
 * This page is for testing the Eden's Hollow game component.
 */

import React from "react";
import { Link } from "wouter";
import EdenHollowGame from "@/components/EdenHollowGame";
import { Helmet } from "react-helmet";

export default function GameTestPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Helmet>
        <title>Eden's Hollow - Experimental Horror Game</title>
        <meta name="description" content="An experimental interactive horror game set in the mysterious town of Eden's Hollow" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors inline-flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Site</span>
          </Link>
          
          <h1 className="text-3xl font-serif tracking-wider mb-2">Eden's Hollow</h1>
          <p className="text-gray-400 mb-6">
            A text-based horror adventure with branching narratives and sanity mechanics. 
            Choices you make affect your character's mental state and available options.
          </p>
        </div>
        
        <div className="game-wrapper bg-gray-900 rounded-lg overflow-hidden border border-gray-800 shadow-2xl">
          <EdenHollowGame initialStoryId="abandoned-manor" />
        </div>
        
        <div className="mt-8 prose prose-invert max-w-none">
          <h2 className="text-xl font-serif mb-4">How to Play</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg mb-2">Game Mechanics</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Make choices to progress through the story</li>
                <li>Each choice may affect your <strong>sanity</strong> level</li>
                <li>Low sanity unlocks darker choices but restricts positive ones</li>
                <li>Some paths require specific items in your inventory</li>
                <li>Pay attention to environmental details for clues</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg mb-2">Tips for Survival</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Not all that appears safe is actually safe</li>
                <li>Your sanity is a valuable resource - manage it carefully</li>
                <li>Some choices may seem correct but lead to disaster</li>
                <li>Multiple playthroughs will reveal new story elements</li>
                <li>There are multiple endings - can you find them all?</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8">
            <p className="text-sm text-gray-500">
              <strong>Note:</strong> This is an experimental feature currently in development.
              Game saves may be reset with future updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}