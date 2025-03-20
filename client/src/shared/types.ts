export type ThemeCategory = 
  | 'Parasite'
  | 'Cosmic'
  | 'Psychological' 
  | 'Technological'
  | 'Body Horror'
  | 'Psychopath'
  | 'Supernatural'
  | 'Uncanny'
  | 'Cannibalism'
  | 'Stalking'
  | 'Existential'
  | 'Gothic'
  | 'Vehicular'
  | 'Doppelgänger'
  | 'Slasher'
  | 'Horror';

export interface ThemeInfo {
  keywords: string[];
  badgeVariant: "default" | "parasite" | "cosmic" | "psychological" | "technological" | "body" | "psychopath" | 
    "supernatural" | "uncanny" | "cannibalism" | "stalking" | "existential" | "gothic" | "vehicular" | "doppelganger" | "slasher" | "horror";
  icon: 'Worm' | 'Skull' | 'Brain' | 'Pill' | 'Cpu' | 'Dna' | 'Axe' | 'Ghost' | 'Cross' | 'Car' | 'Footprints' | 
    'CloudRain' | 'Castle' | 'Utensils' | 'Bug' | 'Knife' | 'Scan' | 'AlertTriangle' | 'Copy';
  description: string;
  visualEffects: string[];
}