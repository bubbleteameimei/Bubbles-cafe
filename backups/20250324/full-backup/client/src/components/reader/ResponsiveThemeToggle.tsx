import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { DeviceType } from "./ResponsiveReaderLayout";

interface ResponsiveThemeToggleProps {
  deviceType: DeviceType;
  className?: string;
}

const ResponsiveThemeToggle: React.FC<ResponsiveThemeToggleProps> = ({ 
  deviceType, 
  className = "" 
}) => {
  const { toggleTheme, theme } = useTheme();
  
  // Determine icon size based on deviceType
  const getIconSize = () => {
    switch (deviceType) {
      case 'mobile':
        return 3.5;
      case 'tablet':
        return 4;
      default:
        return 4.5;
    }
  };
  
  // Determine button size based on deviceType  
  const getButtonSize = () => {
    switch (deviceType) {
      case 'mobile':
        return 'h-8 w-8';
      case 'tablet':
        return 'h-9 w-9';
      default:
        return 'h-10 w-10';
    }
  };
  
  const iconSize = getIconSize();
  const buttonSize = getButtonSize();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`${buttonSize} rounded-md border border-border/30 hover:bg-accent/10 active:bg-accent/20 transition-all duration-150 ease-out ${className}`}
      aria-label="Toggle theme"
    >
      <span className="relative">
        <Sun 
          className={`h-${iconSize} w-${iconSize} rotate-0 scale-100 transition-all duration-300 ease-in-out dark:-rotate-90 dark:scale-0 dark:opacity-0`}
          strokeWidth={1.75}
        />
        <Moon 
          className={`absolute top-0 left-0 h-${iconSize} w-${iconSize} rotate-90 scale-0 opacity-0 transition-all duration-300 ease-in-out dark:rotate-0 dark:scale-100 dark:opacity-100`}
          strokeWidth={1.75}
        />
        <span className="absolute inset-0 bg-current opacity-0 hover:opacity-5 active:opacity-10 transition-opacity duration-150 rounded-md" />
      </span>
    </Button>
  );
};

export default ResponsiveThemeToggle;