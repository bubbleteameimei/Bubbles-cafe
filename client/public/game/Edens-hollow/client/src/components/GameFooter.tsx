import { StoryPhase } from "../types";

interface GameFooterProps {
  storyPhase?: StoryPhase;
  storyTitle?: string;
  onSave: () => void;
  onSettings: () => void;
}

export default function GameFooter({
  storyPhase,
  storyTitle,
  onSave,
  onSettings
}: GameFooterProps) {
  // Format the story phase for display
  const formatPhase = (phase?: StoryPhase): string => {
    if (!phase) return '';
    
    const phaseMap: Record<StoryPhase, string> = {
      'introduction': 'INTRODUCTION',
      'descent': 'DESCENT',
      'fragmentation': 'FRAGMENTATION',
      'confrontation': 'CONFRONTATION',
      'ending': 'ENDING'
    };
    
    return phaseMap[phase] || phase.toUpperCase();
  };
  
  // Combine story title and phase
  const progressText = storyTitle && storyPhase 
    ? `${storyTitle}: ${formatPhase(storyPhase)}`
    : '';
  
  return (
    <footer className="relative z-20 py-4 bg-primary bg-opacity-70">
      <div className="max-w-3xl mx-auto px-4 flex justify-between items-center">
        <div className="flex space-x-4 text-xs font-ui">
          <button 
            onClick={onSave} 
            className="text-textColor hover:text-accent transition-colors"
          >
            SAVE
          </button>
          <button 
            onClick={onSettings} 
            className="text-textColor hover:text-accent transition-colors"
          >
            SETTINGS
          </button>
        </div>
        <div className="text-xs font-ui">
          <span className="text-accent">{progressText}</span>
        </div>
      </div>
    </footer>
  );
}
