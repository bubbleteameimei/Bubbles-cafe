import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isLoading,
  progress = 0,
  message = 'Loading...'
}) => {
  const [dots, setDots] = useState('.');
  
  // Animate the loading dots
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '.';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full max-w-md px-8">
        {/* Game Title */}
        <motion.h1
          className="text-4xl font-serif text-amber-500 text-center mb-12"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Eden's Hollow
        </motion.h1>
        
        {/* Loading Indicator */}
        <div className="mb-4">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-amber-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        {/* Loading Message */}
        <div className="text-center text-gray-400">
          <p>{message}{dots}</p>
          <p className="mt-1 text-sm">{Math.round(progress)}%</p>
        </div>
        
        {/* Gothic Ornament */}
        <div className="mt-16 text-gray-600 text-center">
          <div className="text-2xl">☥</div>
          <div className="text-xs uppercase tracking-widest mt-2">Journey into darkness</div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;