import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MistEffectProps {
  intensity?: 'subtle' | 'medium' | 'intense';
  color?: string;
  className?: string;
  children?: React.ReactNode;
  animate?: boolean;
}

/**
 * MistEffect component creates an atmospheric mist overlay for horror stories
 * 
 * @param intensity Controls the opacity and density of the mist effect
 * @param color Base color of the mist (default is white with very low opacity)
 * @param className Additional CSS classes
 * @param children Content to be wrapped with the mist effect
 * @param animate Whether the mist should have subtle animation
 */
export function MistEffect({
  intensity = 'subtle',
  color = 'rgba(255, 255, 255, 0.03)',
  className = '',
  children,
  animate = true
}: MistEffectProps) {
  // State for mist particles
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, opacity: number}>>([]);
  
  // Generate random mist particles on component mount
  useEffect(() => {
    // Number of particles based on intensity
    const particleCount = intensity === 'subtle' ? 8 : intensity === 'medium' ? 12 : 20;
    
    // Generate initial particles
    const initialParticles = Array.from({ length: particleCount }, (_, index) => ({
      id: index,
      x: Math.random() * 100, // random x position (0-100%)
      y: Math.random() * 100, // random y position (0-100%)
      size: Math.random() * 200 + 50, // random size (50-250px)
      opacity: intensity === 'subtle' ? 0.015 : intensity === 'medium' ? 0.03 : 0.05
    }));
    
    setParticles(initialParticles);
  }, [intensity]);

  // Get opacity range based on intensity
  const getOpacityRange = () => {
    switch (intensity) {
      case 'subtle': return [0.01, 0.02];
      case 'medium': return [0.02, 0.04];
      case 'intense': return [0.04, 0.08];
      default: return [0.01, 0.02];
    }
  };

  // Base opacity for the container based on intensity
  const baseOpacity = intensity === 'subtle' ? 0.1 : intensity === 'medium' ? 0.2 : 0.3;
  
  // The opacity range for animations
  const [minOpacity, maxOpacity] = getOpacityRange();

  return (
    <div className={`relative ${className}`}>
      {/* Mist container with subtle gradient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, ${baseOpacity * 0.1}), transparent 80%)`,
          mixBlendMode: 'overlay'
        }}
      >
        {/* Animated mist particles */}
        <AnimatePresence>
          {animate && particles.map(particle => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full blur-3xl"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: color,
                opacity: particle.opacity,
                mixBlendMode: 'overlay'
              }}
              animate={{
                opacity: [
                  particle.opacity,
                  particle.opacity * (1 + Math.random() * 0.5),
                  particle.opacity
                ],
                scale: [1, 1 + Math.random() * 0.1, 1],
                x: [0, Math.random() * 20 - 10, 0],
                y: [0, Math.random() * 20 - 10, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 8 + Math.random() * 7,
                ease: "easeInOut"
              }}
            />
          ))}
        </AnimatePresence>
        
        {/* Static mist overlay for non-animated version */}
        {!animate && (
          <div 
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
              backgroundSize: '200px 200px',
              opacity: baseOpacity * 0.5
            }}
          />
        )}
        
        {/* Vignette effect around the edges */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent 40%, rgba(0, 0, 0, ${baseOpacity * 0.8}) 100%)`,
            mixBlendMode: 'multiply'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default MistEffect;