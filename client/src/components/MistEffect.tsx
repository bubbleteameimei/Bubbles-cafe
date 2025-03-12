import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MistEffectProps {
  intensity?: 'light' | 'medium' | 'heavy';
  color?: string;
  zIndex?: number;
  speed?: number;
  className?: string;
  pulsate?: boolean;
}

const MistEffect: React.FC<MistEffectProps> = ({
  intensity = 'medium',
  color = 'rgba(0, 0, 0, 0.8)',
  zIndex = -1,
  speed = 30,
  className = '',
  pulsate = true
}) => {
  const [opacity, setOpacity] = useState(() => {
    switch (intensity) {
      case 'light': return 0.15;
      case 'medium': return 0.25;
      case 'heavy': return 0.45;
      default: return 0.25;
    }
  });

  // Optional pulsating effect
  useEffect(() => {
    if (!pulsate) return;
    
    const interval = setInterval(() => {
      setOpacity(prev => {
        const baseOpacity = intensity === 'light' ? 0.15 : intensity === 'medium' ? 0.25 : 0.45;
        const variation = Math.sin(Date.now() / 2000) * 0.1;
        return baseOpacity + variation;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [intensity, pulsate]);

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}
        style={{
          zIndex,
          opacity,
          mixBlendMode: 'multiply',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity }}
        exit={{ opacity: 0 }}
      >
        {/* Multiple mist layers with different animations */}
        <div className="absolute inset-0">
          {/* Layer 1 - Slow moving horizontal mist */}
          <motion.div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '200% 0%'],
            }}
            transition={{
              duration: speed * 2,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
          
          {/* Layer 2 - Vertical mist */}
          <motion.div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${color} 50%, transparent 100%)`,
              backgroundSize: '100% 200%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '0% 200%'],
            }}
            transition={{
              duration: speed * 1.5,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'mirror',
            }}
          />
          
          {/* Layer 3 - Diagonal swirling mist */}
          <motion.div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, transparent 40%, ${color} 70%, transparent 100%)`,
              backgroundSize: '200% 200%',
            }}
            animate={{
              backgroundPosition: [
                '0% 0%', 
                '100% 100%', 
                '100% 0%', 
                '0% 100%', 
                '0% 0%'
              ],
            }}
            transition={{
              duration: speed * 3,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MistEffect;