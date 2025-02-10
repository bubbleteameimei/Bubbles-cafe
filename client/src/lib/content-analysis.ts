import { type ThemeCategory, type ThemeInfo } from "../shared/types";
import { Brain, Cpu, Telescope, Trees, Dna, Footprints, Ghost, Castle, Radiation, Skull, UserMinus2, Anchor, AlertTriangle, Building, Clock, Moon } from "lucide-react";

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
    description: 'Mental and psychological horror'
  },
  TECHNOLOGICAL: {
    keywords: [
      'machine', 'computer', 'artificial', 'digital', 'program', 'code',
      'network', 'system', 'algorithm', 'robot', 'cyber', 'virtual',
      'interface', 'screen', 'data', 'tech', 'electronic', 'device'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "default",
    icon: 'Cpu',
    description: 'Technology gone wrong'
  },
  COSMIC: {
    keywords: [
      'space', 'star', 'void', 'infinite', 'cosmic', 'universe', 'alien',
      'planet', 'dimension', 'beyond', 'celestial', 'astronomical',
      'galactic', 'nebula', 'constellation', 'orbit'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "default",
    icon: 'Telescope',
    description: 'Cosmic horror and space terror'
  },
  FOLK_HORROR: {
    keywords: [
      'ritual', 'tradition', 'village', 'ancient', 'folk', 'cult',
      'pagan', 'sacrifice', 'worship', 'rural', 'superstition',
      'ceremony', 'harvest', 'nature', 'forest'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "default",
    icon: 'Trees',
    description: 'Folk and rural horror'
  },
  BODY_HORROR: {
    keywords: [
      'flesh', 'transform', 'mutation', 'organic', 'grotesque', 'deform',
      'tissue', 'metamorphosis', 'biology', 'cellular', 'morph',
      'visceral', 'anatomy', 'bone', 'skin'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "default",
    icon: 'Dna',
    description: 'Body transformation horror'
  },
  SURVIVAL: {
    keywords: [
      'chase', 'escape', 'hide', 'run', 'pursue', 'hunt', 'trap',
      'flee', 'evade', 'stalker', 'predator', 'prey', 'hunter',
      'catch', 'corner', 'trapped', 'alone'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "survival",
    icon: 'Footprints',
    description: 'Survival horror'
  },
  SUPERNATURAL: {
    keywords: [
      'ghost', 'spirit', 'demon', 'haunted', 'ethereal', 'occult',
      'possession', 'paranormal', 'entity', 'apparition', 'specter',
      'phantom', 'poltergeist', 'soul'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "supernatural",
    icon: 'Ghost',
    description: 'Supernatural horror'
  },
  GOTHIC: {
    keywords: [
      'castle', 'mansion', 'aristocrat', 'Victorian', 'gothic', 'noble',
      'estate', 'cathedral', 'crypt', 'inheritance', 'family', 'legacy',
      'ancestor', 'lineage', 'curse'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "gothic",
    icon: 'Castle',
    description: 'Gothic horror'
  },
  APOCALYPTIC: {
    keywords: [
      'apocalypse', 'collapse', 'extinction', 'devastation', 'ruin',
      'wasteland', 'survival', 'pandemic', 'plague', 'fallout',
      'catastrophe', 'disaster', 'end', 'world'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "apocalyptic",
    icon: 'Radiation',
    description: 'Post-apocalyptic horror'
  },
  LOVECRAFTIAN: {
    keywords: [
      'ancient', 'unknowable', 'cosmic', 'elder', 'forbidden',
      'blasphemous', 'cyclopean', 'eldritch', 'primordial', 'abyss',
      'tentacle', 'madness', 'revelation', 'knowledge'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "lovecraftian",
    icon: 'Skull',
    description: 'Lovecraftian cosmic horror'
  },
  ISOLATION: {
    keywords: [
      'alone', 'solitude', 'abandoned', 'desolate', 'empty', 'isolated',
      'remote', 'stranded', 'deserted', 'lonely', 'cut-off', 'separation',
      'disconnected', 'quarantine', 'silence'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "isolation",
    icon: 'UserMinus2',
    description: 'Isolation horror'
  },
  AQUATIC: {
    keywords: [
      'ocean', 'deep', 'underwater', 'sea', 'abyss', 'maritime',
      'submarine', 'drowning', 'flood', 'tide', 'marine', 'depths',
      'submerged', 'coral', 'trenches'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "aquatic",
    icon: 'Anchor',
    description: 'Deep sea horror'
  },
  VIRAL: {
    keywords: [
      'infection', 'spread', 'contagion', 'disease', 'epidemic',
      'virus', 'outbreak', 'contamination', 'quarantine', 'symptom',
      'mutation', 'carrier', 'transmission', 'infected'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "viral",
    icon: 'AlertTriangle',
    description: 'Viral horror'
  },
  URBAN_LEGEND: {
    keywords: [
      'legend', 'myth', 'rumor', 'story', 'urban', 'tale', 'folklore',
      'city', 'street', 'local', 'whisper', 'mystery', 'reputation',
      'hearsay', 'notorious'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "urban",
    icon: 'Building',
    description: 'Urban legend horror'
  },
  TIME_HORROR: {
    keywords: [
      'time', 'temporal', 'loop', 'paradox', 'clock', 'chronology',
      'past', 'future', 'timeline', 'moment', 'eternity', 'repeat',
      'cycle', 'duration', 'forever'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "time",
    icon: 'Clock',
    description: 'Temporal horror'
  },
  DREAMSCAPE: {
    keywords: [
      'dream', 'nightmare', 'sleep', 'subconscious', 'surreal',
      'abstract', 'vision', 'lucid', 'phantasm', 'fantasy',
      'hallucination', 'reverie', 'trance', 'illusion'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "dreamscape",
    icon: 'Moon',
    description: 'Dream-based horror'
  }
};

export const detectThemes = (content: string): ThemeCategory[] => {
  try {
    const themeCounts = new Map<ThemeCategory, number>();
    const lowerContent = content.toLowerCase();

    // Calculate theme scores based on keyword matches
    Object.entries(THEME_CATEGORIES).forEach(([theme, info]) => {
      const matchCount = info.keywords.filter((keyword: string) =>
        new RegExp(`\\b${keyword}\\b`, 'i').test(content)
      ).length;

      if (matchCount > 0) {
        // Add a small random factor to prevent ties and create more diversity
        const randomFactor = Math.random() * 0.3;
        themeCounts.set(theme as ThemeCategory, matchCount * (1 + randomFactor));
      }
    });

    // Select the theme with the highest score
    let dominantTheme: ThemeCategory | null = null;
    let maxCount = 0;

    themeCounts.forEach((count, theme) => {
      if (count > maxCount) {
        maxCount = count;
        dominantTheme = theme;
      }
    });

    // If no clear theme is detected, assign a random theme
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

  let score = 3; // Start with base score

  // Calculate score based on emotional intensity
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

  // Additional factors that might increase intensity
  const shortSentences = content.split(/[.!?]+/).filter(s =>
    s.trim().split(/\s+/).length < 10
  ).length;

  score += shortSentences * 0.1;
  if (content.includes('blood') || content.includes('gore')) score += 1;
  if (/[A-Z]{3,}/.test(content)) score += 0.5;
  if (content.match(/!{2,}/g)) score += 0.5;

  // Ensure score is between 3 and 5
  return Math.max(3, Math.min(5, Math.ceil(score)));
};

export const getReadingTime = (content: string): string => {
  if (!content) return '0 min read';
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};