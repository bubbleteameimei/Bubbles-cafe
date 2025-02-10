import type { ThemeCategory, ThemeInfo } from "@shared/types";
import { Brain, Skull, Ghost, Footprints } from "lucide-react";

export { type ThemeCategory, type ThemeInfo };

export const THEME_CATEGORIES: Record<ThemeCategory, ThemeInfo> = {
  PSYCHOLOGICAL: {
    keywords: [
      'mind', 'sanity', 'reality', 'perception', 'consciousness', 'dream',
      'paranoia', 'delusion', 'hallucination', 'madness', 'insanity',
      'psychosis', 'memory', 'identity', 'trauma', 'therapy', 'mental'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "psychological",
    icon: 'Brain',
    description: 'Mental and psychological horror elements'
  },
  GORE: {
    keywords: [
      'blood', 'flesh', 'bone', 'visceral', 'mutilation', 'wound', 'gore',
      'dismember', 'organ', 'tissue', 'entrails', 'dissect', 'cut', 'slice',
      'tear', 'rip', 'eviscerate', 'body', 'corpse', 'dead'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "gore",
    icon: 'Skull',
    description: 'Graphic and visceral content'
  },
  SUPERNATURAL: {
    keywords: [
      'ghost', 'spirit', 'demon', 'haunted', 'ethereal', 'occult', 'ritual',
      'possession', 'paranormal', 'entity', 'apparition', 'specter', 'phantom',
      'poltergeist', 'curse', 'hex', 'witch', 'magic', 'undead', 'soul'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "supernatural",
    icon: 'Ghost',
    description: 'Paranormal and otherworldly elements'
  },
  SURVIVAL: {
    keywords: [
      'chase', 'escape', 'hide', 'run', 'pursue', 'hunt', 'trap', 'survive',
      'flee', 'evade', 'stalker', 'predator', 'prey', 'hunter', 'victim',
      'catch', 'corner', 'trapped', 'escape', 'alone'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "survival",
    icon: 'Footprints',
    description: 'Survival and chase sequences'
  }
};

export const detectThemes = (content: string): ThemeCategory[] => {
  try {
    const themeCounts = new Map<ThemeCategory, number>();
    const lowerContent = content.toLowerCase();

    Object.entries(THEME_CATEGORIES).forEach(([theme, info]) => {
      const matchCount = info.keywords.filter((keyword: string) =>
        new RegExp(`\\b${keyword}\\b`, 'i').test(content)
      ).length;
      if (matchCount > 0) {
        themeCounts.set(theme as ThemeCategory, matchCount);
      }
    });

    let dominantTheme: ThemeCategory | null = null;
    let maxCount = 0;

    themeCounts.forEach((count, theme) => {
      const randomFactor = Math.random() * 0.3;
      const adjustedCount = count * (1 + randomFactor);

      if (adjustedCount > maxCount) {
        maxCount = adjustedCount;
        dominantTheme = theme;
      }
    });

    if (!dominantTheme) {
      const themes = Object.keys(THEME_CATEGORIES) as ThemeCategory[];
      dominantTheme = themes[Math.floor(Math.random() * themes.length)];
    }

    return [dominantTheme];
  } catch (error) {
    console.error('[Theme Detection] Error:', error);
    return ['PSYCHOLOGICAL'];
  }
};

export const calculateIntensity = (content: string): number => {
  if (!content) return 3;

  const emotionalPatterns = {
    extreme: /terrified|horrified|petrified|screaming|agony/gi,
    strong: /scared|frightened|panic|terror|dread/gi,
    moderate: /worried|nervous|anxious|uneasy|fear/gi
  };

  let score = 3;

  Object.entries(emotionalPatterns).forEach(([level, pattern]) => {
    const matches = content.match(pattern);
    if (matches) {
      score += matches.length * (
        level === 'extreme' ? 0.5 :
          level === 'strong' ? 0.3 :
            0.2
      );
    }
  });

  const shortSentences = content.split(/[.!?]+/).filter(s =>
    s.trim().split(/\s+/).length < 10
  ).length;

  score += shortSentences * 0.1;
  if (content.includes('blood') || content.includes('gore')) score += 1;
  if (/[A-Z]{3,}/.test(content)) score += 0.5;
  if (content.match(/!{2,}/g)) score += 0.5;

  return Math.max(3, Math.min(5, Math.ceil(score)));
};

export const getReadingTime = (content: string): string => {
  if (!content) return '0 min read';
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};