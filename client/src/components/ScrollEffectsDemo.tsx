import React from 'react';
import { useScrollEffects } from './ScrollEffectsProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Simple demonstration component that shows the current scroll behavior
 * and provides feedback about scroll speed and position restoration.
 */
const ScrollEffectsDemo: React.FC = () => {
  const { scrollType, isScrolling, isPositionRestored, wasRefresh } = useScrollEffects();
  
  return (
    <Card className="w-auto max-w-md mx-auto my-6 shadow-md">
      <CardHeader>
        <CardTitle>Scroll Effects Status</CardTitle>
        <CardDescription>Shows the current state of adaptive scrolling and gentle return</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Scroll Type:</span>
            <Badge variant={
              scrollType === 'fast' ? 'destructive' : 
              scrollType === 'slow' ? 'secondary' : 
              'outline'
            }>
              {scrollType === 'fast' ? 'Fast Flick' : 
               scrollType === 'slow' ? 'Gentle Scroll' : 
               'Normal'}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Scrolling:</span>
            <Badge variant={isScrolling ? 'default' : 'outline'}>
              {isScrolling ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Position Restored:</span>
            <Badge variant={isPositionRestored ? 'success' : 'outline'}>
              {isPositionRestored ? 'Yes' : 'No'}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Page Refresh:</span>
            <Badge variant={wasRefresh ? 'warning' : 'outline'}>
              {wasRefresh ? 'Yes' : 'No'}
            </Badge>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start gap-2 text-sm text-muted-foreground">
        <p>
          <strong>Multi-Speed Scroll:</strong> Try flicking quickly vs. dragging slowly
        </p>
        <p>
          <strong>Gentle Return:</strong> Refresh page or navigate away and return
        </p>
      </CardFooter>
    </Card>
  );
};

export default ScrollEffectsDemo;