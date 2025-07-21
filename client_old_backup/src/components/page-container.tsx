import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`container mx-auto p-4 sm:p-6 max-w-screen-xl ${className}`}>
      {children}
    </div>
  );
}