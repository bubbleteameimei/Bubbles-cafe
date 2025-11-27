export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function safeLocalStorageGet(key: string): string | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

export function safeLocalStorageSet(key: string, value: string): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function safeLocalStorageRemove(key: string): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function safeSessionStorageGet(key: string): string | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

export function safeSessionStorageSet(key: string, value: string): void {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function safeSessionStorageRemove(key: string): void {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}