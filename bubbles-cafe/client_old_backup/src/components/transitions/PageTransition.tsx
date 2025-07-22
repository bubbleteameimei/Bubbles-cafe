import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

interface PageTransitionProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  intensity = 'medium' 
}) => {
  const [location] = useLocation();
  const [key, setKey] = useState(location);
  
  // Update the key when location changes to trigger the transition
  useEffect(() => {
    setKey(location);
  }, [location]);

  // Generate random values for the transition effects
  const getRandomEffects = () => {
    const effects = {
      // Light intensity
      light: {
        initialOpacity: 0.9,
        initialBlur: '0.5px',
        initialScale: 0.98,
        initialRotate: [-0.3, 0.3],
        initialGrayscale: 0.05,
        exitOpacity: 0.9,
        exitBlur: '0.5px',
        exitScale: 0.98,
        exitRotate: [-0.3, 0.3],
        exitGrayscale: 0.05,
        duration: 0.4
      },
      // Medium intensity
      medium: {
        initialOpacity: 0.85,
        initialBlur: '1px',
        initialScale: 0.96,
        initialRotate: [-0.8, 0.8],
        initialGrayscale: 0.1,
        exitOpacity: 0.85,
        exitBlur: '1px',
        exitScale: 0.96,
        exitRotate: [-0.8, 0.8],
        exitGrayscale: 0.1,
        duration: 0.5
      },
      // Heavy intensity
      heavy: {
        initialOpacity: 0.8,
        initialBlur: '1.5px',
        initialScale: 0.94,
        initialRotate: [-1.2, 1.2],
        initialGrayscale: 0.15,
        exitOpacity: 0.8,
        exitBlur: '1.5px',
        exitScale: 0.94,
        exitRotate: [-1.2, 1.2],
        exitGrayscale: 0.15,
        duration: 0.6
      }
    };

    // Get base values for selected intensity
    const base = effects[intensity];
    
    // Randomize within a small range for each transition
    return {
      initialOpacity: base.initialOpacity - Math.random() * 0.05,
      initialBlur: `${parseFloat(base.initialBlur) + Math.random() * 0.5}px`,
      initialScale: base.initialScale - Math.random() * 0.03,
      initialRotate: base.initialRotate[Math.floor(Math.random() * 2)],
      initialGrayscale: base.initialGrayscale + Math.random() * 0.05,
      exitOpacity: base.exitOpacity - Math.random() * 0.05,
      exitBlur: `${parseFloat(base.exitBlur) + Math.random() * 0.5}px`,
      exitScale: base.exitScale - Math.random() * 0.03,
      exitRotate: base.exitRotate[Math.floor(Math.random() * 2)],
      exitGrayscale: base.exitGrayscale + Math.random() * 0.05,
      duration: base.duration + Math.random() * 0.2
    };
  };

  const effects = getRandomEffects();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ 
          opacity: effects.initialOpacity,
          filter: `blur(${effects.initialBlur}) grayscale(${effects.initialGrayscale})`,
          scale: effects.initialScale,
          rotate: effects.initialRotate
        }}
        animate={{ 
          opacity: 1,
          filter: 'blur(0px) grayscale(0)',
          scale: 1,
          rotate: 0
        }}
        exit={{ 
          opacity: effects.exitOpacity,
          filter: `blur(${effects.exitBlur}) grayscale(${effects.exitGrayscale})`,
          scale: effects.exitScale,
          rotate: effects.exitRotate
        }}
        transition={{ 
          duration: effects.duration, 
          ease: [0.22, 1, 0.36, 1] 
        }}
        className="page-transition"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;