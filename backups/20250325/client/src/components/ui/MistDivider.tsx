import { motion } from "framer-motion";

interface MistDividerProps {
  color?: string;
  height?: number;
  className?: string;
  variant?: 'default' | 'subtle' | 'accent';
}

const MistDivider: React.FC<MistDividerProps> = ({
  color,
  height = 12,
  className = "",
  variant = 'default'
}) => {
  // Define color based on variant if not explicitly provided
  let dividerColor = color;
  if (!dividerColor) {
    switch (variant) {
      case 'subtle':
        dividerColor = "rgba(102, 73, 58, 0.3)";
        break;
      case 'accent':
        dividerColor = "rgba(90, 24, 154, 0.4)";
        break;
      case 'default':
      default:
        dividerColor = "rgba(102, 73, 58, 0.5)";
        break;
    }
  }

  return (
    <motion.div
      className={`relative w-full ${className}`}
      style={{ height: `${height}px` }}
      initial={{ opacity: 0.3, filter: "blur(5px)" }}
      animate={{ 
        opacity: [0.3, 0.5, 0.3], 
        filter: ["blur(5px)", "blur(8px)", "blur(5px)"] 
      }}
      transition={{ 
        repeat: Infinity, 
        duration: 6, 
        ease: "easeInOut" 
      }}
    >
      <div 
        className="absolute inset-0 w-full h-full bg-gradient-to-r"
        style={{ 
          backgroundImage: `linear-gradient(to right, transparent, ${dividerColor}, transparent)` 
        }}
      />
    </motion.div>
  );
};

export default MistDivider;