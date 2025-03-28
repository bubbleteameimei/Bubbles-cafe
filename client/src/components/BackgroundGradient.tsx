import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BackgroundGradientProps {
  className?: string;
  enableMobileOverlay?: boolean;
  darkerGradient?: boolean;
  children?: React.ReactNode;
}

/**
 * Background gradient component with transparent gradients
 */
export function BackgroundGradient({
  className = '',
  enableMobileOverlay = true, 
  darkerGradient = false,
  children
}: BackgroundGradientProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
    </div>
  );
}

export default BackgroundGradient;