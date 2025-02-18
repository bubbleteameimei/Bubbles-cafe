import { useTheme } from "@/hooks/use-theme";
import "./theme-toggle.css";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="wrapper" role="presentation">
      <input
        type="checkbox"
        id="theme-toggle"
        className="switch"
        checked={theme === "light"}
        onChange={handleToggle}
        aria-label="Toggle between dark and light mode"
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