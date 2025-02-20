import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import "./theme-toggle.css";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    document.documentElement.classList.toggle('light', savedTheme === 'light');
  }, [setTheme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    document.documentElement.classList.toggle('light', newTheme === 'light');
  };

  return (
    <div className="theme-toggle-wrapper">
      <input
        type="checkbox"
        id="theme-toggle"
        name="theme-toggle"
        className="theme-toggle-switch"
        checked={theme === 'light'}
        onChange={toggleTheme}
        aria-label="Toggle theme"
      />
      <label htmlFor="theme-toggle" className="sr-only">
        Toggle theme
      </label>
    </div>
  );
}