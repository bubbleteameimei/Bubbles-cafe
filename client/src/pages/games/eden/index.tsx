import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import EdenGame from '../../../components/games/eden/EdenGame';

/**
 * Eden's Hollow Game Page
 * 
 * Dark fantasy interactive story experience with puzzles and exploration
 */
const EdenHollowPage: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  
  const handleStartGame = () => {
    setShowIntro(false);
  };
  
  if (showIntro) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <Helmet>
          <title>Eden's Hollow | A Dark Fantasy Adventure</title>
          <meta name="description" content="A dark fantasy interactive story and puzzle experience" />
        </Helmet>
        
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-amber-100 mb-6">Eden's Hollow</h1>
          
          <p className="text-lg mb-8 text-amber-200/80">
            A dark fantasy journey through a haunted village and its mysterious surroundings.
          </p>
          
          <div className="prose prose-invert prose-amber max-w-none mb-8">
            <p>
              The village of Eden's Hollow has been abandoned for decades, consumed by the surrounding forest. 
              Locals speak of strange lights and whispers that emanate from within.
              Some say the village holds ancient secrets, while others warn of a curse that befell its inhabitants.
            </p>
            <p>
              As night falls and a storm approaches, you find yourself drawn to the hollow - seeking shelter,
              or perhaps something more. What awaits in the shadows will test your courage and resolve.
            </p>
          </div>
          
          <button
            onClick={handleStartGame}
            className="bg-amber-800 hover:bg-amber-700 text-amber-100 px-8 py-3 rounded-md text-lg font-medium transition-colors"
          >
            Begin Journey
          </button>
          
          <p className="mt-6 text-sm text-gray-500">
            Recommended: Play in a quiet environment with headphones for the best experience.
          </p>
        </div>
      </div>
    );
  }
  
  return <EdenGame />;
};

export default EdenHollowPage;