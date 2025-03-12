import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, Home, BookOpen, Mail, Settings, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";

interface AdaptiveSidebarProps {
  className?: string;
}

const AdaptiveSidebar: React.FC<AdaptiveSidebarProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're in a browser environment before accessing window
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        // Auto-close on mobile but keep open on desktop
        if (mobile && isOpen) setIsOpen(false);
        if (!mobile && !isOpen) setIsOpen(true);
      };
      
      // Set initial state
      handleResize();
      
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isOpen]);

  const sidebarVariants = {
    open: { width: "16rem", opacity: 1 },
    closed: { width: isMobile ? "0" : "4rem", opacity: 1 }
  };

  const linkVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -20 }
  };

  return (
    <motion.aside
      initial={isOpen ? "open" : "closed"}
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed top-0 left-0 h-screen bg-background border-r border-border overflow-hidden z-40 ${className}`}
    >
      <div className="flex items-center justify-between p-4">
        <motion.div
          variants={linkVariants}
          transition={{ duration: 0.2 }}
          className="font-bold text-xl"
        >
          {isOpen && "Horror Stories"}
        </motion.div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      <nav className="mt-6">
        <ul className="space-y-2">
          <NavItem
            isOpen={isOpen}
            icon={<Home size={20} />}
            text="Home"
            href="/"
          />
          <NavItem
            isOpen={isOpen}
            icon={<BookOpen size={20} />}
            text="Stories"
            href="/stories"
          />
          <NavItem
            isOpen={isOpen}
            icon={<Mail size={20} />}
            text="Contact"
            href="/contact"
          />
          <NavItem
            isOpen={isOpen}
            icon={<Settings size={20} />}
            text="Settings"
            href="/settings/profile"
          />
          <NavItem
            isOpen={isOpen}
            icon={<User size={20} />}
            text="Profile"
            href="/profile"
          />
        </ul>
      </nav>
    </motion.aside>
  );
};

interface NavItemProps {
  isOpen: boolean;
  icon: React.ReactNode;
  text: string;
  href: string;
}

const NavItem: React.FC<NavItemProps> = ({ isOpen, icon, text, href }) => {
  return (
    <li>
      <Link href={href}>
        <a className="flex items-center px-4 py-3 text-foreground hover:bg-accent/10 transition-colors rounded-md mx-2">
          <span className="mr-4">{icon}</span>
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                {text}
              </motion.span>
            )}
          </AnimatePresence>
        </a>
      </Link>
    </li>
  );
};

export default AdaptiveSidebar;