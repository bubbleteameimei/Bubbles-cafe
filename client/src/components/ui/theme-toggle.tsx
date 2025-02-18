import { useTheme } from "@/hooks/use-theme";
import "./theme-toggle.css";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const handleToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="theme-toggle-wrapper">
      <input
        type="checkbox"
        className="theme-toggle"
        checked={theme === "light"}
        onChange={handleToggle}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      />
    </div>
  );
}
