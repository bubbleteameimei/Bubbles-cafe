import { useTheme } from "@/hooks/use-theme";
import "./theme-toggle.css";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="wrapper">
      <input
        type="checkbox"
        id="theme-toggle"
        className="switch"
        checked={theme === "light"}
        onChange={handleToggle}
        aria-label="Toggle theme"
      />
      <label 
        htmlFor="theme-toggle" 
        className="sr-only"
      >
        Toggle between dark and light mode
      </label>
    </div>
  );
}