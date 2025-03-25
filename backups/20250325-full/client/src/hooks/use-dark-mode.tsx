import { useEffect, useState } from "react";

/**
 * Custom hook to detect and track system dark mode preference
 * @returns boolean indicating whether dark mode is enabled
 */
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initialize based on system preference
    const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(darkModeMediaQuery.matches);

    // Set up listener for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    darkModeMediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      darkModeMediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isDark;
};

export default useDarkMode;