/**
 * Client-side theme definition overrides (label/icon per theme key).
 * Persisted in localStorage so Admin edits reflect across Index and Reader.
 */
export type ThemeDefinitionOverride = { label?: string; icon?: string };

const STORAGE_KEY = 'themeDefinitionsOverrides';

export function getThemeDefinitionOverrides(): Record<string, ThemeDefinitionOverride> {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch {
    return {};
  }
}

export function saveThemeDefinitionOverrides(map: Record<string, ThemeDefinitionOverride>): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    }
  } catch {
    // no-op
  }
}

export function getThemeDefinitionOverride(key?: string): ThemeDefinitionOverride | null {
  if (!key) return null;
  const map = getThemeDefinitionOverrides();
  return map[key] || null;
}

export function setThemeDefinitionOverride(key: string, override: ThemeDefinitionOverride): void {
  const map = getThemeDefinitionOverrides();
  map[key] = override;
  saveThemeDefinitionOverrides(map);
}

export function clearThemeDefinitionOverride(key: string): void {
  const map = getThemeDefinitionOverrides();
  delete map[key];
  saveThemeDefinitionOverrides(map);
}