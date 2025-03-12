import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface FadeInSectionProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none' | 'scale';
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  distance?: number;
  once?: boolean;
  distortionEffect?: boolean;
  style?: string; // Style class for animations
}

const FadeInSection: React.FC<FadeInSectionProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  threshold = 0.2,
  className = '',
  distance = 30,
  once = true,
  distortionEffect = false,
  style = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isDistorting, setIsDistorting] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If we've already animated once and 'once' is true, skip
        if (hasAnimated && once) return;
        
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) setHasAnimated(true);
          
          // Add distortion effect when first becoming visible
          if (distortionEffect && !isDistorting) {
            setIsDistorting(true);
            setTimeout(() => setIsDistorting(false), 500);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasAnimated, once, threshold, distortionEffect, isDistorting]);

  // Get initial animation values based on direction
  const getInitialValues = () => {
    const initial = { opacity: 0 };
    
    switch (direction) {
      case 'up':
        return { ...initial, y: distance };
      case 'down':
        return { ...initial, y: -distance };
      case 'left':
        return { ...initial, x: distance };
      case 'right':
        return { ...initial, x: -distance };
      case 'scale':
        return { ...initial, scale: 0.9 };
      case 'none':
      default:
        return initial;
    }
  };

  // Animation variants
  const variants = {
    hidden: getInitialValues(),
    visible: { 
      opacity: 1, 
      x: 0, 
      y: 0,
      scale: 1,
      filter: 'blur(0px)'
    }
  };

  // Add distortion effect when element first becomes visible
  const getDistortionFilter = () => {
    if (!distortionEffect || !isDistorting) return 'none';
    return 'blur(3px) brightness(1.1)';
  };

  return (
    <div ref={sectionRef} className={`overflow-hidden ${className}`}>
      <motion.div
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={variants}
        transition={{
          duration,
          delay,
          ease: [0.22, 1, 0.36, 1]
        }}
        style={{ filter: getDistortionFilter() }}
        className={style}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default FadeInSection;