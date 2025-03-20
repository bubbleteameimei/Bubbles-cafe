import React from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  isLoading: boolean;
  progress: number; // 0-100
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  isLoading, 
  progress, 
  message = 'Loading...' 
}) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl font-serif mb-8 text-amber-100">Eden's Hollow</h2>
        
        <div className="relative w-64 h-2 bg-gray-800 rounded-full mb-4 overflow-hidden">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="absolute top-0 left-0 h-full bg-amber-500"
          />
        </div>
        
        <p className="text-amber-200/70 text-sm">{message}</p>
        
        <div className="mt-12 opacity-50">
          <svg className="w-16 h-16 mx-auto animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#E5D0A0" strokeWidth="1.5"/>
            <path d="M12 9V13" stroke="#E5D0A0" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M12 16.01L12.01 15.9989" stroke="#E5D0A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <div className="absolute bottom-4 right-4 text-xs text-amber-200/30">
          <p>Press ESC at any time to pause the game</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;