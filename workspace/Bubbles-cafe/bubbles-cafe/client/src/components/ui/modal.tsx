import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  size = 'md',
  showCloseButton = true
}) => {
  // Close on escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    
    // Prevent body scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Calculate max-width based on size prop
  const getMaxWidth = () => {
    switch(size) {
      case 'sm': return 'max-w-sm';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case 'md':
      default: return 'max-w-md';
    }
  };

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          aria-modal="true"
          role="dialog"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Modal Content */}
          <motion.div 
            className={`relative ${getMaxWidth()} w-full mx-4 rounded-lg overflow-hidden bg-background shadow-xl`}
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          >
            {title && (
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-medium text-foreground">{title}</h3>
              </div>
            )}
            
            <div className="p-6">
              {children}
            </div>
            
            {showCloseButton && (
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen(prev => !prev), []);
  
  return { isOpen, openModal, closeModal, toggleModal };
};

export default Modal;