/**
 * Explicit story-to-theme overrides to keep index and reader in perfect sync.
 * Returns a label, icon slug (lucide-react), and a theme key for tint styling.
 */
export type ThemeOverride = { label: string; icon: string; key: string };

const TABLE: Record<string, ThemeOverride> = {
  // Exact mapping requested
  cave:            { label: 'Cosmic Horror',        icon: 'moon',        key: 'COSMIC' },
  memory:          { label: 'Existential Horror',   icon: 'hourglass',   key: 'EXISTENTIAL' },
  therapist:       { label: 'Psychological Horror', icon: 'brain',       key: 'PSYCHOLOGICAL' },
  song:            { label: 'Supernatural Horror',  icon: 'ghost',       key: 'SUPERNATURAL' },
  machine:         { label: 'Technological Horror', icon: 'cpu',         key: 'TECHNOLOGICAL' },
  mirror:          { label: 'Doppelgänger',         icon: 'user-plus',   key: 'DOPPELGANGER' },
  blood:           { label: 'Folk Horror',          icon: 'trees',       key: 'FOLK_HORROR' },
  bug:             { label: 'Parasite',             icon: 'bug',         key: 'PARASITE' },
  nostalgia:       { label: 'Parasite',             icon: 'bug',         key: 'PARASITE' },
  rot:             { label: 'Body Horror',          icon: 'pill',        key: 'BODY_HORROR' },
  hunger:          { label: 'Body Horror',          icon: 'pill',        key: 'BODY_HORROR' },
  cookbook:        { label: 'Cannibalism',          icon: 'fork-knife',  key: 'CANNIBALISM' },
  word:            { label: 'Contagion',            icon: 'radio',       key: 'HORROR' }, // default tint
  chase:           { label: 'Stalking',             icon: 'footprints',  key: 'STALKING' },
  tunnel:          { label: 'Stalking',             icon: 'footprints',  key: 'STALKING' },
  car:             { label: 'Vehicular Horror',     icon: 'car',         key: 'VEHICULAR' },
  drive:           { label: 'Vehicular Horror',     icon: 'car',         key: 'VEHICULAR' },
  doll:            { label: 'Cursed Object',        icon: 'box',         key: 'CURSED_OBJECT' },
  bleach:          { label: 'Suicide',              icon: 'skull',       key: 'DEATH' },
  rain:            { label: 'Urban Horror',         icon: 'building',    key: 'HORROR' }, // default tint
  journal:         { label: 'Occult',               icon: 'moon-star',   key: 'SUPERNATURAL' },
};

const TITLE_TO_SLUG: Record<string, string> = {
  'cave': 'cave',
  'memory': 'memory',
  'therapist': 'therapist',
  'song': 'song',
  'machine': 'machine',
  'mirror': 'mirror',
  'blood': 'blood',
  'bug': 'bug',
  'nostalgia': 'nostalgia',
  'rot': 'rot',
  'hunger': 'hunger',
  'cookbook': 'cookbook',
  'word': 'word',
  'chase': 'chase',
  'tunnel': 'tunnel',
  'car': 'car',
  'drive': 'drive',
  'doll': 'doll',
  'bleach': 'bleach',
  'rain': 'rain',
  'journal': 'journal',
};

function norm(s?: string): string {
  return String(s || '').trim().toLowerCase();
}

/**
 * Get a story theme override by slug/title. Returns null if no override exists.
 */
export function getStoryThemeOverride(slug?: string, title?: string): ThemeOverride | null {
  const s = norm(slug);
  if (s && TABLE[s]) return TABLE[s];

  const t = norm(title);
  if (t) {
    // Attempt direct title match; titles in the API are uppercase, normalize to lowercase
    const candidate = TITLE_TO_SLUG[t] || TITLE_TO_SLUG[t.replace(/[^a-z0-9]+/g, '')] || null;
    if (candidate && TABLE[candidate]) return TABLE[candidate];
    // Loose check: map a few known uppercase titles directly
    const loose = TITLE_TO_SLUG[t.toLowerCase()] || null;
    if (loose && TABLE[loose]) return TABLE[loose];
  }

  return null;
}