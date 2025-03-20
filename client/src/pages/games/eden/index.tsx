import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { EdenGame } from '@/components/games/eden/EdenGame';

export default function EdenGamePage() {
  return (
    <>
      <Helmet>
        <title>Eden's Hollow - Dark Fantasy Adventure | Horror Story Collective</title>
        <meta name="description" content="Embark on a dark fantasy journey through Eden's Hollow, a mysterious realm of ancient secrets, puzzles, and branching narratives." />
      </Helmet>
      
      <div className="flex flex-col min-h-screen bg-black">
        <main className="flex-grow">
          <EdenGame />
        </main>
      </div>
    </>
  );
}