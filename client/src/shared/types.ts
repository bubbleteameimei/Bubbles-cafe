export type ThemeCategory = 
  | 'PSYCHOLOGICAL' 
  | 'TECHNOLOGICAL' 
  | 'COSMIC' 
  | 'FOLK_HORROR' 
  | 'BODY_HORROR' 
  | 'SURVIVAL' 
  | 'SUPERNATURAL' 
  | 'GOTHIC' 
  | 'APOCALYPTIC' 
  | 'LOVECRAFTIAN'
  | 'ISOLATION'
  | 'AQUATIC' 
  | 'VIRAL' 
  | 'URBAN_LEGEND' 
  | 'TIME_HORROR' 
  | 'DREAMSCAPE';

export interface ThemeInfo {
  keywords: string[];
  atmosphericTrack: string;
  badgeVariant: "default" | "psychological" | "technological" | "cosmic" | "folk" | "body" | "survival" | "supernatural" | "gothic" | "apocalyptic" | "lovecraftian" | "isolation" | "aquatic" | "viral" | "urban" | "time" | "dreamscape";
  icon: 'Brain' | 'Cpu' | 'Telescope' | 'Trees' | 'Dna' | 'Footprints' | 'Ghost' | 'Castle' | 'Radiation' | 'Skull' | 'UserMinus2' | 'Anchor' | 'AlertTriangle' | 'Building' | 'Clock' | 'Moon';
  description: string;
}