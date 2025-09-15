type Dict = Record<string, string>;

const en: Dict = {
  'app.loading': 'Loading…',
  'story.read': 'Read story',
};

let current: Dict = en;

export function t(key: string, fallback?: string) {
  return current[key] ?? fallback ?? key;
}

export function loadLocale(dict: Dict) {
  current = { ...current, ...dict };
}

