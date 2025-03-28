import React from 'react';
import { motion } from 'framer-motion';

interface BackgroundGradientProps {
  className?: string;
  enableMobileOverlay?: boolean;
  darkerGradient?: boolean;
}

/**
 * Empty component - removing all gradients as requested
 */
export function BackgroundGradient({
  className = '',
  enableMobileOverlay = true, 
  darkerGradient = false
}: BackgroundGradientProps) {
  // Returning null - we're not using any gradients anymore
  return null;
}

export default BackgroundGradient;