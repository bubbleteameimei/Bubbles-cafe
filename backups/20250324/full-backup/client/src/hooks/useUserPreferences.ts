import { useEffect, useState } from "react";

/**
 * Custom hook for storing and retrieving user preferences in localStorage
 * @param key The localStorage key to use
 * @param initialValue The initial value to use if no value is found in localStorage
 * @returns A state array [value, setValue] similar to useState
 */
const useUserPreferences = <T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  // Initialize state from localStorage or use initialValue
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      // Return parsed item if it exists, otherwise return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If there's an error in parsing, return the initialValue
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }, [key, state]);

  return [state, setState];
};

export default useUserPreferences;