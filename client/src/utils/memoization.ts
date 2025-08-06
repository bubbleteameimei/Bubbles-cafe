import React from 'react';

// Memoization utilities for React components
export const memoizeComponent = <P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) => {
  return React.memo(Component, propsAreEqual);
};