import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useLoading } from './GlobalLoadingProvider';

interface EnhancedPageTransitionProps {
  children: React.ReactNode;
  minLoadingTime?: number;
}

export function EnhancedPageTransition({
  children,
  minLoadingTime = 850, // Reduced minimum loading time for better user experience (850ms is enough for animation)
}: EnhancedPageTransitionProps) {
  const [location] = useLocation();
  const [currentChildren, setCurrentChildren] = useState(children);
  const prevLocationRef = useRef<string>(location);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const { showLoading, hideLoading } = useLoading();
  
  // Immediate page content update with no artificial delays
  useEffect(() => {
    setCurrentChildren(children);
    prevLocationRef.current = location;
  }, [location, children]);
  
  return (
    <>
      {currentChildren}
    </>)
  );
}

export default EnhancedPageTransition;