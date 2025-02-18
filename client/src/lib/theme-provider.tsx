// Deprecated - Using hooks/use-theme.tsx instead
// This file is kept temporarily to prevent import breaks
// TODO: Remove this file after updating all imports to use hooks/use-theme.tsx

import { useTheme as useThemeHook } from '@/hooks/use-theme';

export { useTheme as default } from '@/hooks/use-theme';
export const useTheme = useThemeHook;