import React from 'react';
import { Link } from 'wouter';
import '@/styles/eyeball-loader.css';

interface SimplifiedErrorPageProps {
  statusCode: number;
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
}

/**
 * SimplifiedErrorPage
 * 
 * A consistent error page component that can be used anywhere in the application
 * without causing hook ordering issues.
 */
const SimplifiedErrorPage: React.FC<SimplifiedErrorPageProps> = ({
  statusCode,
  title,
  message,
  actionText = 'Go Home',
  actionLink = '/'
}) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center text-center bg-background/95 backdrop-blur-sm z-50">
      <div className="space-y-6 max-w-screen-sm px-4">
        {/* Enhanced animated eyeball loader for error pages */}
        <div className="flex justify-center mb-8">
          <div className="eyeball-loader error-page"></div>
        </div>
        
        <div className="text-9xl font-creepster text-red-600">{statusCode}</div>
        <h1 className="text-4xl font-specialElite tracking-tighter sm:text-5xl uppercase">
          {title}
        </h1>
        <p className="text-muted-foreground max-w-[42rem] leading-normal sm:text-xl sm:leading-8 mx-auto">
          {message}
        </p>
        <div className="mt-8">
          <Link
            to={actionLink}
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium uppercase tracking-wider text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            {actionText}
          </Link>
        </div>
      </div>
      
      {/* ARIA live region for accessibility */}
      <div className="sr-only" role="status" aria-live="polite">
        Error {statusCode}: {title}. {message}
      </div>
    </div>
  );
};

export default SimplifiedErrorPage;