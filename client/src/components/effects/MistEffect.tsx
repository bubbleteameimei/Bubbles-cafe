import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface MistEffectProps {
  intensity?: "light" | "medium" | "heavy";
  color?: string;
  className?: string;
  animate?: boolean;
  zIndex?: number;
}

const MistEffect: React.FC<MistEffectProps> = ({
  intensity = "medium",
  color = "rgba(21, 13, 13, 0.6)",
  className = "",
  animate = true,
  zIndex = 0
}) => {
  const [mistLayers, setMistLayers] = useState<number[]>([]);
  
  // Generate different number of mist layers based on intensity
  useEffect(() => {
    const layerCount = intensity === "light" ? 2 : intensity === "medium" ? 3 : 5;
    setMistLayers(Array.from({ length: layerCount }, (_, i) => i));
  }, [intensity]);

  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex }}
    >
      {mistLayers.map((layer) => (
        <motion.div
          key={layer}
          className="absolute inset-0 w-full h-full"
          style={{
            background: `radial-gradient(ellipse at ${50 + (layer * 10)}% ${50 - (layer * 5)}%, 
              ${color}, 
              transparent ${60 + (layer * 7)}%)`,
            opacity: 0.7 - (layer * 0.1)
          }}
          initial={animate ? {
            opacity: 0.1 + (layer * 0.05),
            scale: 1 + (layer * 0.01)
          } : undefined}
          animate={animate ? {
            opacity: [
              0.1 + (layer * 0.05),
              0.3 + (layer * 0.05),
              0.1 + (layer * 0.05)
            ],
            scale: [
              1 + (layer * 0.01),
              1.02 + (layer * 0.01),
              1 + (layer * 0.01)
            ]
          } : undefined}
          transition={{
            repeat: Infinity,
            duration: 12 + (layer * 2),
            ease: "easeInOut",
            delay: layer * 0.5
          }}
        />
      ))}
    </div>
  );
};

export default MistEffect;