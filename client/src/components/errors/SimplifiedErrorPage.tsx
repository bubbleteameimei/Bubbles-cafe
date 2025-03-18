import React from 'react';
import { Link } from 'wouter';

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
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="space-y-4">
        <div className="text-9xl font-creepster text-red-600">{statusCode}</div>
        <h1 className="text-4xl font-specialElite tracking-tighter sm:text-5xl">
          {title}
        </h1>
        <p className="text-muted-foreground max-w-[42rem] leading-normal sm:text-xl sm:leading-8">
          {message}
        </p>
        <div className="mt-8">
          <Link
            to={actionLink}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            {actionText}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedErrorPage;