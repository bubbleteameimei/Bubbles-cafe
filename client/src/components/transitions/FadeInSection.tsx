import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';
type AnimationStyle = 'fade' | 'slide' | 'horror' | 'glitch' | 'typewriter';

interface FadeInSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  threshold?: number;
  triggerOnce?: boolean;
  direction?: AnimationDirection;
  style?: AnimationStyle;
  distance?: number;
  duration?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
  viewportMargin?: string;
  rootMargin?: string;
}

const FadeInSection: React.FC<FadeInSectionProps> = ({ 
  children, 
  delay = 0,
  className = "",
  threshold = 0.1,
  triggerOnce = true,
  direction = 'up',
  style = 'fade',
  distance = 20,
  duration = 0.5,
  staggerChildren = false,
  staggerDelay = 0.1,
  viewportMargin = "-100px",
  rootMargin = "0px"
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [shouldAnimate, setShouldAnimate] = useState(!prefersReducedMotion);
  const [ref, inView] = useInView({
    triggerOnce,
    threshold,
    rootMargin
  });

  // Respect user's motion preferences
  useEffect(() => {
    if (prefersReducedMotion) {
      setShouldAnimate(false);
    }
  }, [prefersReducedMotion]);

  // Configure initial and animate states based on animation direction
  const getAnimationProps = () => {
    // If reduced motion is preferred, use minimal animation
    if (!shouldAnimate) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.3 }
      };
    }
    
    // Configure animation based on style and direction
    switch (style) {
      case 'horror':
        return {
          initial: { 
            opacity: 0, 
            filter: 'blur(4px)', 
            scale: direction === 'scale' ? 0.95 : 1,
            y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
            x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
          },
          animate: { 
            opacity: 1, 
            filter: 'blur(0px)', 
            scale: 1,
            y: 0,
            x: 0 
          },
          transition: {
            duration: duration * 1.2,
            delay,
            ease: [0.25, 0.1, 0.25, 1],
            filter: { duration: duration * 1.5 }
          }
        };
        
      case 'glitch':
        return {
          initial: { 
            opacity: 0,
            filter: 'blur(2px)', 
            x: 0
          },
          animate: { 
            opacity: 1,
            filter: 'blur(0px)',
            x: 0,
            transition: {
              duration,
              delay,
              ease: "easeOut",
              filter: { duration: duration * 0.8 },
              x: {
                duration: duration * 0.5,
                ease: "easeInOut",
                times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                keyframes: [0, -5, 5, -3, 3, 0]
              }
            }
          }
        };
        
      case 'typewriter':
        return {
          initial: { width: "0%" },
          animate: { 
            width: "100%",
            transition: {
              duration: duration * 1.5,
              delay,
              ease: "easeInOut"
            }
          }
        };
        
      case 'slide':
        return {
          initial: { 
            opacity: 0,
            y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
            x: direction === 'left' ? distance : direction === 'right' ? -distance : 0
          },
          animate: { 
            opacity: 1,
            y: 0,
            x: 0 
          },
          transition: {
            duration,
            delay,
            ease: [0.25, 0.1, 0.25, 1]
          }
        };
        
      case 'fade':
      default:
        return {
          initial: { 
            opacity: 0,
            y: direction === 'up' ? distance/2 : direction === 'down' ? -distance/2 : 0,
            x: direction === 'left' ? distance/2 : direction === 'right' ? -distance/2 : 0,
            scale: direction === 'scale' ? 0.95 : 1
          },
          animate: { 
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1
          },
          transition: {
            duration,
            delay,
            ease: [0.25, 0.1, 0.25, 1]
          }
        };
    }
  };

  const animationProps = getAnimationProps();

  // Determine if the content is a single element or multiple children
  const content = React.Children.count(children) > 1 && staggerChildren
    ? React.Children.map(children, (child, i) => (
        <motion.div
          initial={animationProps.initial}
          animate={inView ? animationProps.animate : animationProps.initial}
          transition={{
            ...animationProps.transition,
            delay: delay + (i * staggerDelay)
          }}
          className="stagger-item"
        >
          {child}
        </motion.div>
      ))
    : children;

  return (
    <motion.div
      ref={ref}
      initial={animationProps.initial}
      animate={inView ? animationProps.animate : animationProps.initial}
      transition={animationProps.transition}
      className={`fade-in-section ${className}`}
      style={{ overflow: 'hidden' }}
    >
      {staggerChildren ? (
        <div className="stagger-container">
          {content}
        </div>
      ) : (
        content
      )}
    </motion.div>
  );
};

export default FadeInSection;