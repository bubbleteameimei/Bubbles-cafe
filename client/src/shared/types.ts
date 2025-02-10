export type ThemeCategory = 'PSYCHOLOGICAL' | 'GORE' | 'SUPERNATURAL' | 'SURVIVAL';

export interface ThemeInfo {
  keywords: string[];
  atmosphericTrack: string;
  badgeVariant: "psychological" | "gore" | "supernatural" | "survival";
  icon: 'Brain' | 'Skull' | 'Ghost' | 'Footprints';
  description: string;
}