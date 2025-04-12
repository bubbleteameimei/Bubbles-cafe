import { motion, AnimatePresence } from "framer-motion";
import { Choice } from "../types";
import { useState } from "react";

interface ChoicePanelProps {
  choices: Choice[];
  onChoice: (choice: Choice) => void;
  canMakeChoice: (choice: Choice) => boolean;
  showLowSanityEffects: boolean;
}

export default function ChoicePanel({
  choices,
  onChoice,
  canMakeChoice,
  showLowSanityEffects
}: ChoicePanelProps) {
  const [hoveredChoice, setHoveredChoice] = useState<string | null>(null);
  
  // Sort choices so that disabled ones appear at the end
  const sortedChoices = [...choices].sort((a, b) => {
    const aDisabled = !canMakeChoice(a);
    const bDisabled = !canMakeChoice(b);
    if (aDisabled && !bDisabled) return 1;
    if (!aDisabled && bDisabled) return -1;
    return 0;
  });

  // Get sanity impact color and icon
  const getSanityImpact = (sanityChange: number) => {
    if (sanityChange > 10) return { color: "text-green-500", icon: "↑↑", label: "Major Gain" };
    if (sanityChange > 0) return { color: "text-green-400", icon: "↑", label: "Gain" };
    if (sanityChange === 0) return { color: "text-gray-400", icon: "—", label: "Neutral" };
    if (sanityChange > -10) return { color: "text-secondary", icon: "↓", label: "Loss" };
    return { color: "text-secondary", icon: "↓↓", label: "Major Loss" };
  };

  // Get critical choice styling
  const getCriticalStyle = (isCritical: boolean) => {
    if (!isCritical) return "";
    return "border-accent border-2";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col space-y-4 w-full max-w-2xl mx-auto"
    >
      <h3 className="font-ui text-accent text-sm uppercase tracking-wider mb-1">Choose Your Path</h3>
      
      <AnimatePresence mode="wait">
        {sortedChoices.map((choice) => {
          const isDisabled = !canMakeChoice(choice);
          const requiredSanity = choice.requiredSanity;
          const isHovered = hoveredChoice === choice.id;
          const isCritical = choice.critical === true;
          const sanityImpact = getSanityImpact(choice.sanityChange);
          
          return (
            <motion.div
              key={choice.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isDisabled ? 0.6 : 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className={`relative ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              onMouseEnter={() => setHoveredChoice(choice.id)}
              onMouseLeave={() => setHoveredChoice(null)}
            >
              {/* Main choice button */}
              <div 
                onClick={() => !isDisabled && onChoice(choice)}
                className={`choice-button bg-uiElements text-textColor transition-all duration-300 font-dialogue text-base md:text-lg p-4 md:p-5 text-left border border-secondary ${
                  isHovered && !isDisabled ? 'bg-secondary' : ''
                } ${
                  isDisabled ? (showLowSanityEffects ? 'low-sanity' : '') : ''
                } ${getCriticalStyle(isCritical)}`}
              >
                {/* Critical decision indicator */}
                {isCritical && (
                  <div className="absolute -top-2 -right-2 bg-accent text-textColor px-2 py-1 font-ui text-xs">
                    CRITICAL
                  </div>
                )}
                
                {/* Sanity requirement */}
                {requiredSanity && isDisabled && (
                  <div className="flex items-center mb-2">
                    <div className="bg-primary inline-block px-2 py-1 rounded-sm">
                      <span className="text-accent font-ui text-xs">REQUIRES SANITY &gt; {requiredSanity}</span>
                    </div>
                  </div>
                )}
                
                {/* Choice text */}
                <div className={`${isDisabled ? 'opacity-80' : ''}`}>
                  {choice.text}
                </div>
                
                {/* Sanity impact indicator (only shown on hover) */}
                {isHovered && !isDisabled && (
                  <div className="mt-3 flex items-center justify-end">
                    <span className={`font-ui text-xs tracking-wider ${sanityImpact.color}`}>
                      SANITY {sanityImpact.icon} {choice.sanityChange}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
