import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: (confirmed: boolean) => void;
}

export default function ConfirmationModal({
  isOpen,
  onConfirm
}: ConfirmationModalProps) {
  const [heartbeat, setHeartbeat] = useState(false);
  
  // Create heartbeat pulsing effect
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setHeartbeat(prev => !prev);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isOpen]);
  
  // Forbidding text that appears randomly
  const warningTexts = [
    "There is no turning back.",
    "Your sanity hangs by a thread.",
    "This path leads to darkness.",
    "Are you prepared to face what lies beyond?",
    "Some decisions cannot be unmade."
  ];
  
  const [warningText, setWarningText] = useState(warningTexts[0]);
  
  // Change warning text randomly
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * warningTexts.length);
      setWarningText(warningTexts[randomIndex]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isOpen]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };
  
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotate: [0, -0.5, 0.5, -0.5, 0],
      transition: {
        opacity: { duration: 0.5 },
        scale: { duration: 0.5 },
        rotate: {
          repeat: Infinity,
          duration: 5,
          ease: "easeInOut"
        }
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.3 }
    }
  };
  
  const titleVariants = {
    hidden: { opacity: 0.7 },
    visible: { 
      opacity: [0.7, 1, 0.7],
      transition: { 
        repeat: Infinity, 
        duration: 2 
      }
    }
  };
  
  const warningVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 1 }
    }
  };
  
  const buttonVariants = {
    hover: { scale: 1.05 }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Heartbeat overlay */}
          <div className={`absolute inset-0 bg-secondary transition-opacity duration-500 ${
            heartbeat ? 'opacity-5' : 'opacity-0'
          }`} />
          
          {/* Main modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-primary border-2 border-accent p-8 max-w-md w-full text-center relative overflow-hidden"
          >
            {/* Blood corner effects */}
            <div className="absolute top-0 left-0 w-12 h-12 bg-secondary opacity-30" style={{ clipPath: 'polygon(0 0, 0% 100%, 100% 0)' }} />
            <div className="absolute bottom-0 right-0 w-12 h-12 bg-secondary opacity-30" style={{ clipPath: 'polygon(100% 100%, 0% 100%, 100% 0)' }} />
            
            <motion.h3 
              className="font-ui text-accent text-xl mb-8 tracking-widest"
              variants={titleVariants}
              initial="hidden"
              animate="visible"
            >
              ARE YOU TRULY SURE?
            </motion.h3>
            
            <p className="font-dialogue text-textColor mb-6 leading-relaxed">
              This decision may have <span className="text-secondary">permanent</span> consequences. 
              Your sanity will be <span className="text-secondary">tested</span>.
            </p>
            
            <motion.p 
              className="font-dialogue text-secondary text-sm italic mb-10 opacity-80"
              variants={warningVariants}
              initial="hidden"
              animate="visible"
              key={warningText}
            >
              {warningText}
            </motion.p>
            
            <div className="flex justify-center space-x-8">
              <motion.div variants={buttonVariants} whileHover="hover">
                <Button
                  onClick={() => onConfirm(true)}
                  className="font-ui bg-secondary hover:bg-accent text-textColor px-8 py-3 transition-colors text-sm tracking-wider"
                >
                  I ACCEPT
                </Button>
              </motion.div>
              
              <motion.div variants={buttonVariants} whileHover="hover">
                <Button
                  onClick={() => onConfirm(false)}
                  className="font-ui bg-uiElements hover:bg-primary text-textColor px-8 py-3 transition-colors text-sm tracking-wider"
                  variant="outline"
                >
                  GO BACK
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
