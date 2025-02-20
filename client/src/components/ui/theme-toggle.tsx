import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";
import "./theme-toggle.css";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle-wrapper">
      <input
        type="checkbox"
        name="theme-toggle"
        className="theme-toggle-switch"
        checked={theme === 'light'}
        onChange={toggleTheme}
      />
    </div>
  );
}
