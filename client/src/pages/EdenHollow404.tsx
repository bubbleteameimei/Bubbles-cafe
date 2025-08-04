import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home, BookOpen } from 'lucide-react';

const EdenHollow404: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md mx-auto text-center p-8">
        {/* 404 Error Icon */}
        <div className="mb-8">
          <div className="text-6xl font-bold text-muted-foreground mb-4">404</div>
          <div className="w-16 h-1 bg-primary mx-auto mb-4"></div>
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Eden's Hollow
        </h1>
        
        {/* Description */}
        <p className="text-muted-foreground mb-6 leading-relaxed">
          The Eden's Hollow interactive experience has been discontinued. 
          This section is no longer available, but you can explore our collection of horror stories instead.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto" variant="default">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <Link href="/stories">
            <Button className="w-full sm:w-auto" variant="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Stories
            </Button>
          </Link>
        </div>
        
        {/* Optional decorative element */}
        <div className="mt-12 text-xs text-muted-foreground">
          Looking for dark content? Check out our horror collection at Bubble's Cafe.
        </div>
      </div>
    </div>
  );
};

export default EdenHollow404;