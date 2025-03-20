import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface NightModeWrapperProps {
  children: React.ReactNode;
  forceNightMode?: boolean;
}

export const useNightMode = () => {
  const [nightMode, setNightMode] = useState(false);

  useEffect(() => {
    const checkNightTime = () => {
      const currentHour = new Date().getHours();
      setNightMode(currentHour >= 20 || currentHour < 6);
    };
    
    // Check on initial load
    checkNightTime();
    
    // Set up an interval to check every minute
    const intervalId = setInterval(checkNightTime, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  return nightMode;
};

const NightModeWrapper: React.FC<NightModeWrapperProps> = ({ 
  children, 
  forceNightMode = false 
}) => {
  const autoNightMode = useNightMode();
  const isNightMode = forceNightMode || autoNightMode;

  return (
    <motion.div 
      className={`transition-all duration-1000 ${
        isNightMode ? "bg-[#0B0605] text-[#A89D96]" : "bg-[#150D0D] text-[#D8D3D0]"
      }`}
      animate={{
        backgroundColor: isNightMode ? "#0B0605" : "#150D0D",
        color: isNightMode ? "#A89D96" : "#D8D3D0"
      }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

export default NightModeWrapper;