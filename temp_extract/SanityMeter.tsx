import { motion } from "framer-motion";

interface SanityMeterProps {
  value: number;
  maxValue: number;
  showLowSanityEffects: boolean;
}

export default function SanityMeter({ 
  value, 
  maxValue, 
  showLowSanityEffects 
}: SanityMeterProps) {
  // Normalize the value as a percentage
  const percentage = Math.max(0, Math.min(100, (value / maxValue) * 100));
  
  // Determine sanity level category
  const getSanityLevel = () => {
    if (percentage > 70) return "stable";
    if (percentage > 40) return "unstable";
    if (percentage > 20) return "fragile";
    return "broken";
  };
  
  // Determine the color gradient based on sanity level
  const getBarColor = () => {
    if (percentage > 70) {
      return "bg-gradient-to-r from-secondary to-accent";
    } else if (percentage > 40) {
      return "bg-gradient-to-r from-secondary via-accent to-secondary";
    } else if (percentage > 20) {
      return "bg-gradient-to-r from-accent via-secondary to-accent animate-pulse";
    } else {
      return "bg-gradient-to-r from-accent to-secondary animate-pulse";
    }
  };
  
  // Get label based on sanity level
  const getSanityLabel = () => {
    const level = getSanityLevel();
    switch(level) {
      case "stable": return "STABLE";
      case "unstable": return "UNSTABLE";
      case "fragile": return "FRAGILE";
      case "broken": return "BREAKING";
      default: return "SANITY";
    }
  };
  
  return (
    <div className={`sanity-wrapper mb-3 md:mb-6 mt-4 ${showLowSanityEffects ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between">
        <h2 className={`font-ui text-xs md:text-sm tracking-wider ${
          showLowSanityEffects ? 'text-secondary' : 'text-textColor opacity-80'
        }`}>
          {getSanityLabel()}
        </h2>
        <div className={`font-ui text-xs ${
          showLowSanityEffects ? 'text-secondary low-sanity' : 'text-accent'
        }`}>
          <span id="sanity-value">{value}</span>/{maxValue}
        </div>
      </div>
      
      <div className={`mt-1 h-2 bg-primary border border-secondary pixel-border overflow-hidden ${
        percentage < 20 ? 'animate-pulse' : ''
      }`}>
        <motion.div 
          className={`h-full ${getBarColor()}`}
          initial={{ width: `${percentage}%` }}
          animate={{ 
            width: `${percentage}%`,
            opacity: percentage < 30 ? [0.7, 1, 0.7] : 1
          }}
          transition={{ 
            duration: 0.5,
            opacity: { repeat: Infinity, duration: 1.5 }
          }}
        />
      </div>
      
      {showLowSanityEffects && (
        <p className="text-xs text-secondary italic mt-1 opacity-80 low-sanity">
          {percentage < 20 ? "Your mind is fracturing..." : 
           percentage < 40 ? "Reality begins to shift..." : 
           "Something feels wrong..."}
        </p>
      )}
    </div>
  );
}
