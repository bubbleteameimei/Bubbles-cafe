import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarNavigation } from '@/components/ui/sidebar-menu';

interface AnimatedSidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const AnimatedSidebar: React.FC<AnimatedSidebarProps> = ({ isOpen, toggle }) => {
  // Prevent scrolling when sidebar is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={toggle}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="fixed top-0 left-0 z-50 h-full w-[280px] border-r bg-background lg:hidden"
          >
            <SidebarNavigation onNavigate={toggle} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AnimatedSidebar;