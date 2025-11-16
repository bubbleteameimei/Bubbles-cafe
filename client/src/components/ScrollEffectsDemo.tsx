import React from 'react';
import { useScrollEffects } from './ScrollEffectsProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Simple demonstration component that shows the current scroll behavior
 * and provides feedback about scroll speed.
 */
const ScrollEffectsDemo: React.FC = () => {
  const { scrollType, isScrolling } = useScrollEffects();
  
  return (
    <Card className="w-auto max-w-md mx-auto my-6 shadow-md">
      <CardHeader>
        <CardTitle>Scroll Effects Status</CardTitle>
        <CardDescription>Shows the current state of adaptive scrolling</CardDescription>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ScrollEffectsDemo;