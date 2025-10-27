/**
 * Client-side theme definition overrides (label/icon per theme key).
 * Persisted in localStorage and optionally synced with server (/api/themes/definitions).
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

export async function syncThemeDefinitionOverridesFromServer(): Promise<Record<string, ThemeDefinitionOverride>> {
  try {
    const res = await fetch('/api/themes/definitions', { credentials: 'include' });
    if (!res.ok) throw new Error('GET /api/themes/definitions failed');
    const data = await res.json().catch(() => ({ overrides: {} }));
    const overrides = (data?.overrides && typeof data.overrides === 'object') ? data.overrides : {};
    // Merge into localStorage
    const current = getThemeDefinitionOverrides();
    const merged = { ...current, ...overrides };
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
    } catch {}
    return merged;
  } catch {
    // Fallback: return local-only
    return getThemeDefinitionOverrides();
  }
}

export async function saveThemeDefinitionOverrides(map: Record<string, ThemeDefinitionOverride>): Promise<void> {
  // Try server first
  try {
    const csrf = (typeof document !== 'undefined')
      ? document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*=\s*([^;]*).*$)|^.*$/, "$1")
      : '';
    const res = await fetch('/api/themes/definitions', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(csrf ? { 'X-CSRF-Token': csrf } : {}) },
      body: JSON.stringify(map),
    });
    if (!res.ok) throw new Error('PATCH /api/themes/definitions failed');
  } catch {
    // ignore server failure, still persist locally
  }
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
  // Persist locally only (admin UI will call saveThemeDefinitionOverrides explicitly)
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    }
  } catch {}
}

export function clearThemeDefinitionOverride(key: string): void {
  const map = getThemeDefinitionOverrides();
  delete map[key];
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    }
  } catch {}
}