import { useState, useEffect } from "react";
import { X, Eye, EyeOff, SnowflakeIcon, Droplets, Wind, Flame, CloudFog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ParticleToggleProps {
  onToggleParticles: (enabled: boolean) => void;
  onChangeType?: (type: string) => void;
  className?: string;
  initialState?: boolean;
}

const ParticleToggle: React.FC<ParticleToggleProps> = ({
  onToggleParticles,
  onChangeType,
  className = "",
  initialState = true
}) => {
  const [isEnabled, setIsEnabled] = useState(initialState);
  const [showOptions, setShowOptions] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get saved preference from local storage if it exists
    const savedPreference = localStorage.getItem("particleEffectsEnabled");
    if (savedPreference !== null) {
      const enabled = savedPreference === "true";
      setIsEnabled(enabled);
      onToggleParticles(enabled);
    }
  }, [onToggleParticles]);

  const toggleParticles = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    onToggleParticles(newState);
    
    // Save preference
    localStorage.setItem("particleEffectsEnabled", String(newState));
    
    toast({
      title: newState ? "Visual effects enabled" : "Visual effects disabled",
      description: newState 
        ? "Particle effects are now active" 
        : "Particle effects have been turned off for better performance",
      duration: 2000
    });
  };

  const changeParticleType = (type: string) => {
    if (onChangeType) {
      onChangeType(type);
      setShowOptions(false);
      
      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} effect selected`,
        description: "Visual atmosphere has been updated",
        duration: 2000
      });
    }
  };

  return (
    <div className={cn("fixed bottom-20 right-6 z-50 flex flex-col items-end gap-2", className)}>
      {showOptions && (
        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-accent flex flex-col gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowOptions(false)}
            className="self-end text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-2 items-center" 
              onClick={() => changeParticleType("dust")}
            >
              <Wind size={16} />
              <span>Dust</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-2 items-center" 
              onClick={() => changeParticleType("snow")}
            >
              <SnowflakeIcon size={16} />
              <span>Snow</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-2 items-center" 
              onClick={() => changeParticleType("fog")}
            >
              <CloudFog size={16} />
              <span>Fog</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-2 items-center" 
              onClick={() => changeParticleType("embers")}
            >
              <Flame size={16} />
              <span>Embers</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-2 items-center" 
              onClick={() => changeParticleType("blood")}
            >
              <Droplets size={16} />
              <span>Blood</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-2 items-center" 
              onClick={() => changeParticleType("paper")}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8" />
              </svg>
              <span>Paper</span>
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        {isEnabled && (
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-accent/20"
            onClick={() => setShowOptions(!showOptions)}
          >
            <span className="sr-only">Change effect type</span>
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M8 12h.01" />
              <path d="M12 8h.01" />
              <path d="M12 16h.01" />
              <path d="M16 12h.01" />
              <path d="M19.071 4.929c-1.4-1.4-3.573-1.412-4.993 0l-9.9 9.9a3.527 3.527 0 0 0 4.993 4.993l9.9-9.9c1.4-1.4 1.4-3.573 0-4.993Z" />
            </svg>
          </Button>
        )}
        
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "rounded-full bg-background/80 backdrop-blur-sm shadow-md",
            isEnabled ? "hover:bg-accent/20" : "hover:bg-accent/20"
          )}
          onClick={toggleParticles}
        >
          <span className="sr-only">
            {isEnabled ? "Disable particle effects" : "Enable particle effects"}
          </span>
          {isEnabled ? <EyeOff size={18} /> : <Eye size={18} />}
        </Button>
      </div>
    </div>
  );
};

export default ParticleToggle;