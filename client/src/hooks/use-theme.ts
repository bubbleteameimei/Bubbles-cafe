// This file is deprecated
// Please import from '@/components/theme-provider' instead
// This file only exists for backwards compatibility

// Providing a dummy function to prevent import errors
export function useTheme() {
  console.warn('This version of useTheme is deprecated. Import useTheme from "@/components/theme-provider" instead.');
  return {
    theme: 'dark',
    setTheme: () => console.warn('Deprecated: Import useTheme from "@/components/theme-provider" instead'),
    toggleTheme: () => console.warn('Deprecated: Import useTheme from "@/components/theme-provider" instead')
  };
}

export default useTheme;