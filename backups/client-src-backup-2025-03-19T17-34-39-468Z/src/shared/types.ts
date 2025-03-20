export type ThemeCategory = 
  | 'PARASITE'
  | 'LOVECRAFTIAN'
  | 'PSYCHOLOGICAL' 
  | 'TECHNOLOGICAL'
  | 'SUICIDAL'
  | 'BODY_HORROR'
  | 'PSYCHOPATH'
  | 'SUPERNATURAL'
  | 'POSSESSION'
  | 'CANNIBALISM'
  | 'STALKING'
  | 'DEATH'
  | 'GOTHIC'
  | 'APOCALYPTIC'
  | 'ISOLATION'
  | 'AQUATIC'
  | 'VIRAL'
  | 'URBAN_LEGEND'
  | 'TIME_HORROR'
  | 'DREAMSCAPE';

export interface ThemeInfo {
  keywords: string[];
  badgeVariant: "default" | "parasite" | "lovecraftian" | "psychological" | "suicidal" | "technological" | "body" | "psychopath" | "supernatural" | "possession" | "cannibalism" | "stalking" | "death" | "gothic" | "apocalyptic" | "isolation" | "aquatic" | "viral" | "urban" | "time" | "dreamscape";
  icon: 'Worm' | 'Skull' | 'Brain' | 'Pill' | 'Cpu' | 'Dna' | 'Axe' | 'Ghost' | 'Cross' | 'Knife' | 'Footprints' | 'CloudRain' | 'Castle' | 'Radiation' | 'UserMinus2' | 'Anchor' | 'AlertTriangle' | 'Building' | 'Clock' | 'Moon';
  description: string;
  visualEffects: string[];
}