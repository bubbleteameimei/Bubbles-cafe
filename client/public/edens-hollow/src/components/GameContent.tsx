import { motion } from "framer-motion";
import { GameState, Story, Passage, Choice } from "../types";
import SanityMeter from "./SanityMeter";
import StoryPanel from "./StoryPanel";
import ChoicePanel from "./ChoicePanel";

interface GameContentProps {
  gameState: GameState;
  currentStory: Story | null;
  currentPassage: Passage | null;
  showLowSanityEffects: boolean;
  onChoice: (choice: Choice) => void;
  canMakeChoice: (choice: Choice) => boolean;
}

export default function GameContent({
  gameState,
  currentStory,
  currentPassage,
  showLowSanityEffects,
  onChoice,
  canMakeChoice
}: GameContentProps) {
  if (!currentStory || !currentPassage) {
    return (
      <main className="relative z-20 flex-grow flex flex-col items-center justify-center px-4 pb-12">
        <div className="max-w-3xl w-full mx-auto">
          <div className="bg-primary bg-opacity-80 p-6 pixel-border backdrop-blur-sm min-h-[300px] flex items-center justify-center">
            <p className="font-ui text-accent text-lg">Loading story...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative z-20 flex-grow flex flex-col items-center justify-center px-4 pb-12"
    >
      <div className="max-w-3xl w-full mx-auto">
        {/* Sanity Meter */}
        <SanityMeter 
          value={gameState.sanity} 
          maxValue={100} 
          showLowSanityEffects={showLowSanityEffects} 
        />

        {/* Story Display Panel */}
        <StoryPanel
          title={currentPassage.title || currentStory.title}
          content={currentPassage.content}
          typingSpeed={gameState.settings.typewriterSpeed}
          showLowSanityEffects={showLowSanityEffects}
        />

        {/* Choice Options */}
        <ChoicePanel
          choices={currentPassage.choices}
          onChoice={onChoice}
          canMakeChoice={canMakeChoice}
          showLowSanityEffects={showLowSanityEffects}
        />
      </div>
    </motion.main>
  );
}
