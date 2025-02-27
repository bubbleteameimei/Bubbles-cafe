
import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HorrorThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className={cn("relative h-10 w-10", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="group relative overflow-hidden bg-card hover:bg-card/90 rounded-full"
      >
        {theme === "dark" ? (
          <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 transition-all group-hover:rotate-0 group-hover:scale-110 group-hover:text-horror-blood" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 transition-all group-hover:rotate-90 group-hover:text-yellow-500" />
        )}
        <span className="sr-only">Toggle theme</span>
        
        {/* Animated blood drip effect for dark mode */}
        {theme === "dark" && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-[2px] h-0 bg-horror-blood group-hover:h-16 transition-all duration-1000 opacity-0 group-hover:opacity-70"></div>
        )}
        
        {/* Animated light rays for light mode */}
        {theme === "light" && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="absolute top-1/2 left-1/2 w-8 h-[1px] bg-yellow-400 origin-left"
                style={{ 
                  transform: `translate(-50%, -50%) rotate(${i * 45}deg)`, 
                  animation: `pulse 2s ease-in-out ${i * 0.1}s infinite`
                }}
              />
            ))}
          </div>
        )}
      </Button>
    </div>
  );
}
