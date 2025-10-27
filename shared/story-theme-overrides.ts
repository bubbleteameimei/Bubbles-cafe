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
  rot:             { label: 'Body Horror',          icon: 'bone',        key: 'BODY_HORROR' },
  hunger:          { label: 'Body Horror',          icon: 'bone',        key: 'BODY_HORROR' },
  cookbook:        { label: 'Cannibalism',          icon: 'fork-knife',  key: 'CANNIBALISM' },
  word:            { label: 'Contagion',            icon: 'radio',       key: 'CONTAGION' },
  chase:           { label: 'Stalking',             icon: 'footprints',  key: 'STALKING' },
  tunnel:          { label: 'Stalking',             icon: 'footprints',  key: 'STALKING' },
  car:             { label: 'Vehicular Horror',     icon: 'car',         key: 'VEHICULAR' },
  drive:           { label: 'Vehicular Horror',     icon: 'car',         key: 'VEHICULAR' },
  doll:            { label: 'Cursed Object',        icon: 'box',         key: 'CURSED_OBJECT' },
  bleach:          { label: 'Suicide',              icon: 'skull',       key: 'SUICIDE' },
  rain:            { label: 'Urban Horror',         icon: 'building',    key: 'URBAN_HORROR' },
  journal:         { label: 'Occult',               icon: 'moon-star',   key: 'OCCULT' },
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
  if (!t) return null;

  // Attempt direct title keyword match (titles like "CAVE", "MEMORY", etc.)
  for (const key of Object.keys(TABLE)) {
    if (t.includes(key)) return TABLE[key];
  }

  return null;
}