import React from 'react';
import { Button } from "@/components/ui/button";
import { Cloud, CloudFog, CloudLightning } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface MistControlProps {
  intensity: 'subtle' | 'medium' | 'intense';
  onChange: (intensity: 'subtle' | 'medium' | 'intense') => void;
  className?: string;
  showLabel?: boolean;
}

export function MistControl({ 
  intensity, 
  onChange, 
  className = "",
  showLabel = false
}: MistControlProps) {
  
  // Function to select the next intensity level in the cycle
  const cycleIntensity = () => {
    const intensities: Array<'subtle' | 'medium' | 'intense'> = ['subtle', 'medium', 'intense'];
    const currentIndex = intensities.indexOf(intensity);
    const nextIndex = (currentIndex + 1) % intensities.length;
    onChange(intensities[nextIndex]);
  };

  // Get the appropriate icon based on current intensity
  const getIcon = () => {
    switch(intensity) {
      case 'subtle': return <Cloud className="h-4 w-4" />;
      case 'medium': return <CloudFog className="h-4 w-4" />;
      case 'intense': return <CloudLightning className="h-4 w-4" />;
      default: return <Cloud className="h-4 w-4" />;
    }
  };

  // Get label text based on current intensity
  const getLabel = () => {
    switch(intensity) {
      case 'subtle': return 'Subtle Mist';
      case 'medium': return 'Medium Mist';
      case 'intense': return 'Deep Fog';
      default: return 'Mist Effect';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center ${className}`}>
            <Button
              variant="outline"
              size="sm"
              onClick={cycleIntensity}
              className="h-9 px-3 bg-primary/5 hover:bg-primary/10 shadow-md border-primary/20 relative overflow-hidden"
              aria-label={`Toggle mist effect intensity, currently ${intensity}`}
            >
              {getIcon()}
              {showLabel && <span className="ml-2">{getLabel()}</span>}
              
              {/* Small indicator showing current level */}
              {!showLabel && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px] font-bold"
                >
                  {intensity === 'subtle' ? '1' : intensity === 'medium' ? '2' : '3'}
                </Badge>
              )}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Adjust the mist effect intensity (currently {getLabel()})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default MistControl;