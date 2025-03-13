import { useTheme } from "@/lib/theme-provider";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import "./theme-toggle.css";

interface ThemeToggleProps {
  variant?: 'full' | 'icon' | 'animated' | 'fancy';
  className?: string;
}

export function ThemeToggle({ variant = 'fancy', className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'fancy') {
    return (
      <motion.button
        onClick={toggleTheme}
        className={`relative h-10 w-10 overflow-hidden rounded-full bg-transparent text-current ${className}`}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
        aria-label="Toggle theme"
      >
        <div className="relative h-full w-full">
          {/* Sun icon */}
          <motion.div
            initial={{ opacity: isDark ? 1 : 0, y: isDark ? 0 : 15 }}
            animate={{ opacity: isDark ? 1 : 0, y: isDark ? 0 : 15 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun 
              size={20} 
              className="text-amber-400 filter drop-shadow-md" 
            />
          </motion.div>
          
          {/* Moon icon */}
          <motion.div
            initial={{ opacity: isDark ? 0 : 1, y: isDark ? -15 : 0 }}
            animate={{ opacity: isDark ? 0 : 1, y: isDark ? -15 : 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon 
              size={20} 
              className="text-indigo-500 filter drop-shadow-md" 
            />
          </motion.div>
        </div>
        
        {/* Background transition effect */}
        <div 
          className={`absolute inset-0 rounded-full transition-colors duration-150 ${
            isDark 
              ? 'bg-gradient-to-tr from-indigo-900/10 to-indigo-600/10 border border-indigo-500/20' 
              : 'bg-gradient-to-tr from-amber-500/10 to-amber-300/10 border border-amber-500/20'
          }`}
        />
      </motion.button>
    );
  }

  if (variant === 'animated') {
    return (
      <div className={`theme-toggle-container ${className}`}>
        <label className="wrapper">
          <input
            type="checkbox"
            className="switch"
            checked={isDark}
            onChange={toggleTheme}
            aria-label="Toggle theme"
          />
        </label>
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`theme-toggle-icon ${className}`}
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
    );
  }

  // Full version with text
  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle-full ${className}`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <>
          <Sun className="h-5 w-5" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
}