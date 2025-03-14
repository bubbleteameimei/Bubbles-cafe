import { useTheme } from "@/components/theme-provider";
import "./sun-moon-toggle.css";

interface SunMoonToggleProps {
  className?: string;
}

export function SunMoonToggle({ className = "" }: SunMoonToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`sun-moon-toggle-container ${className}`}>
      <div className="wrapper">
        <input
          type="checkbox"
          name="checkbox"
          className="switch"
          checked={isDark}
          onChange={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        />
      </div>
    </div>
  );
}