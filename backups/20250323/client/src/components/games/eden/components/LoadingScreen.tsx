import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
  onComplete?: () => void;
}

export default function LoadingScreen({ isLoading, progress = 0, message = 'Loading...', onComplete }: LoadingScreenProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [randomTip, setRandomTip] = useState<string>('');
  
  // Loading tips to display
  const loadingTips = [
    "Pay attention to environmental clues.",
    "Not all items are immediately useful, but they might be later.",
    "Some puzzles have multiple solutions.",
    "If you get stuck, try examining your surroundings carefully.",
    "Listen carefully to what characters have to say.",
    "Note down any strange symbols you encounter.",
    "The path forward isn't always obvious.",
    "Your inventory can be accessed at any time.",
    "Some areas become accessible only after certain events.",
    "Don't be afraid to retrace your steps.",
    "The history of Eden's Hollow holds many secrets."
  ];
  
  // Animated progress bar
  useEffect(() => {
    if (!isLoading) return;
    
    // Animate progress more smoothly
    const interval = setInterval(() => {
      setDisplayProgress(current => {
        if (current < progress) {
          return Math.min(current + 1, progress);
        }
        return current;
      });
    }, 20);
    
    return () => clearInterval(interval);
  }, [isLoading, progress]);
  
  // Display random tips while loading
  useEffect(() => {
    if (!isLoading) return;
    
    // Select a random tip initially
    setRandomTip(loadingTips[Math.floor(Math.random() * loadingTips.length)]);
    
    // Change the tip every 5 seconds
    const interval = setInterval(() => {
      setRandomTip(loadingTips[Math.floor(Math.random() * loadingTips.length)]);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isLoading]);
  
  // Call onComplete when loading is finished
  useEffect(() => {
    if (!isLoading && displayProgress >= 100 && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, displayProgress, onComplete]);
  
  if (!isLoading && displayProgress >= 100) return null;
  
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      {/* Background Ambiance */}
      <div className="absolute inset-0 bg-center bg-cover opacity-20" style={{ backgroundImage: "url('/images/eden/loading-bg.jpg')" }} />
      
      {/* Vignette Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
      
      {/* Title & Content */}
      <div className="z-10 max-w-lg text-center px-6">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl mb-2 text-white font-serif tracking-wider"
        >
          Eden's Hollow
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8 text-gray-400 italic"
        >
          "Where darkness dwells in whispered secrets..."
        </motion.div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${displayProgress}%` }}
            transition={{ type: 'spring', stiffness: 50 }}
            className="h-full bg-purple-600"
          />
        </div>
        
        {/* Progress Text & Message */}
        <div className="flex justify-between text-sm text-gray-500 mb-8">
          <div>{message}</div>
          <div>{displayProgress}%</div>
        </div>
        
        {/* Loading Tip */}
        <motion.div
          key={randomTip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-gray-400 mt-8 p-4 border border-gray-800 rounded bg-black/50"
        >
          <span className="text-purple-400 font-semibold">TIP:</span> {randomTip}
        </motion.div>
      </div>
    </div>
  );
}