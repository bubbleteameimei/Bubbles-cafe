import { type ThemeCategory, type ThemeInfo } from "../shared/types";
import { Bug as Worm, Skull, Brain, Pill, Cpu, Dna, Axe, Ghost, Footprints, Castle, Radiation, UserMinus2, Anchor, AlertTriangle, Building, Clock, Moon, Knife } from "lucide-react";

export { type ThemeCategory, type ThemeInfo };

export const THEME_CATEGORIES: Record<ThemeCategory, ThemeInfo> = {
  PARASITE: {
    keywords: [
      'parasite', 'worm', 'maggot', 'crawl', 'burrow', 'gnaw', 'squirm',
      'writhe', 'infest', 'nostalgia', 'memory', 'forget', 'distort',
      'whisper', 'dig', 'flesh', 'brain', 'skin'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "parasite",
    icon: 'Worm',
    description: 'Parasitic and invasive horror'
  },
  LOVECRAFTIAN: {
    keywords: [
      'ancient', 'deity', 'worship', 'kneel', 'statue', 'monolithic',
      'forgotten', 'blood', 'ritual', 'cave', 'underground', 'eternal',
      'revelations', 'forbidden', 'cyclopean', 'eldritch'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "lovecraftian",
    icon: 'Skull',
    description: 'Lovecraftian and cosmic horror'
  },
  PSYCHOLOGICAL: {
    keywords: [
      'mind', 'sanity', 'therapy', 'mental', 'obsession', 'delusion',
      'reality', 'perception', 'consciousness', 'paranoia', 'hallucination',
      'trauma', 'identity', 'control', 'manipulation', 'rain'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "psychological",
    icon: 'Brain',
    description: 'Psychological manipulation and mental horror'
  },
  SUICIDAL: {
    keywords: [
      'suicide', 'bleach', 'end', 'death', 'pain', 'guilt', 'survive',
      'medication', 'hospital', 'poison', 'overdose', 'self-harm',
      'depression', 'despair', 'darkness'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "suicidal",
    icon: 'Pill',
    description: 'Self-destructive and survival horror'
  },
  TECHNOLOGICAL: {
    keywords: [
      'machine', 'computer', 'technology', 'artificial', 'circuit',
      'wire', 'mechanical', 'digital', 'system', 'consciousness',
      'upload', 'transfer', 'merge', 'cybernetic'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "technological",
    icon: 'Cpu',
    description: 'Technological and cybernetic horror'
  },
  BODY_HORROR: {
    keywords: [
      'flesh', 'transform', 'mutation', 'organic', 'grotesque', 'deform',
      'tissue', 'metamorphosis', 'skin', 'bone', 'blood', 'insect',
      'crawl', 'bug', 'inside'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "body",
    icon: 'Dna',
    description: 'Body transformation horror'
  },
  PSYCHOPATH: {
    keywords: [
      'kill', 'murder', 'blood', 'knife', 'stalk', 'watch', 'follow',
      'obsess', 'hunt', 'capture', 'torture', 'victim', 'pleasure',
      'excitement', 'thrill'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "psychopath",
    icon: 'Axe',
    description: 'Psychopathic and murderous horror'
  },
  SUPERNATURAL: {
    keywords: [
      'ghost', 'spirit', 'haunted', 'ethereal', 'paranormal', 'entity',
      'apparition', 'mirror', 'reflection', 'portal', 'otherworldly',
      'presence', 'manifestation', 'swap', 'change'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "supernatural",
    icon: 'Ghost',
    description: 'Supernatural and paranormal horror'
  },
  POSSESSION: {
    keywords: [
      'possess', 'demon', 'spirit', 'doll', 'puppet', 'control',
      'evil', 'exorcism', 'ritual', 'curse', 'dark', 'entity',
      'soul', 'corrupt', 'innocent'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "possession",
    icon: 'Cross',
    description: 'Demonic possession horror'
  },
  CANNIBALISM: {
    keywords: [
      'eat', 'consume', 'flesh', 'meat', 'hunger', 'appetite',
      'feast', 'cook', 'recipe', 'cookbook', 'taste', 'devour',
      'cannibalism', 'human', 'meal'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "cannibalism",
    icon: 'Knife',
    description: 'Cannibalistic horror'
  },
  STALKING: {
    keywords: [
      'follow', 'watch', 'hide', 'shadow', 'stalk', 'observe',
      'track', 'pursue', 'hunt', 'predator', 'prey', 'tunnel',
      'dark', 'alone', 'fear', 'chase'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "stalking",
    icon: 'Footprints',
    description: 'Stalking and pursuit horror'
  },
  DEATH: {
    keywords: [
      'death', 'reaper', 'soul', 'afterlife', 'descent', 'fall',
      'darkness', 'eternal', 'end', 'final', 'grave', 'tombstone',
      'spirit', 'beyond', 'mortal'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "death",
    icon: 'Skull',
    description: 'Death and mortality horror'
  },
  GOTHIC: {
    keywords: [
      'castle', 'mansion', 'aristocrat', 'Victorian', 'gothic',
      'estate', 'cathedral', 'crypt', 'family', 'legacy',
      'ancestor', 'portrait', 'painting'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "gothic",
    icon: 'Castle',
    description: 'Gothic and ancestral horror'
  },
  APOCALYPTIC: {
    keywords: [
      'apocalypse', 'collapse', 'extinction', 'devastation',
      'wasteland', 'survival', 'pandemic', 'plague', 'end',
      'world', 'civilization', 'ruin'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "apocalyptic",
    icon: 'Radiation',
    description: 'Post-apocalyptic horror'
  },
  ISOLATION: {
    keywords: [
      'alone', 'solitude', 'abandoned', 'desolate', 'empty',
      'isolated', 'remote', 'stranded', 'lonely', 'silence',
      'void', 'cut-off', 'separation'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "isolation",
    icon: 'UserMinus2',
    description: 'Isolation horror'
  },
  AQUATIC: {
    keywords: [
      'ocean', 'deep', 'underwater', 'sea', 'abyss', 'maritime',
      'submarine', 'drowning', 'flood', 'marine', 'depths',
      'vessel', 'ship'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "aquatic",
    icon: 'Anchor',
    description: 'Deep sea horror'
  },
  VIRAL: {
    keywords: [
      'infection', 'spread', 'contagion', 'disease', 'epidemic',
      'virus', 'outbreak', 'contamination', 'mutation',
      'transmission', 'infected', 'pandemic'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "viral",
    icon: 'AlertTriangle',
    description: 'Viral and epidemic horror'
  },
  URBAN_LEGEND: {
    keywords: [
      'legend', 'myth', 'rumor', 'urban', 'tale', 'folklore',
      'city', 'street', 'local', 'whisper', 'mystery',
      'warning', 'curse'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "urban",
    icon: 'Building',
    description: 'Urban legend horror'
  },
  TIME_HORROR: {
    keywords: [
      'time', 'temporal', 'loop', 'paradox', 'clock', 'past',
      'future', 'timeline', 'moment', 'eternity', 'repeat',
      'trapped', 'forever'
    ],
    atmosphericTrack: 'whispers-wind.m4a',
    badgeVariant: "time",
    icon: 'Clock',
    description: 'Temporal horror'
  },
  DREAMSCAPE: {
    keywords: [
      'dream', 'nightmare', 'sleep', 'subconscious', 'surreal',
      'vision', 'lucid', 'phantasm', 'fantasy', 'illusion',
      'reality', 'trance'
    ],
    atmosphericTrack: '13-angels.m4a',
    badgeVariant: "dreamscape",
    icon: 'Moon',
    description: 'Dream-based horror'
  }
};

export const detectThemes = (content: string): ThemeCategory[] => {
  try {
    const titleToTheme: Record<string, ThemeCategory> = {
      'nostalgia': 'PARASITE',
      'cave': 'LOVECRAFTIAN',
      'therapist': 'PSYCHOLOGICAL',
      'bleach': 'SUICIDAL',
      'machine': 'TECHNOLOGICAL',
      'drive': 'PSYCHOPATH',
      'mirror': 'SUPERNATURAL',
      'car': 'PSYCHOLOGICAL',
      'doll': 'PSYCHOPATH',
      'cookbook': 'CANNIBALISM',
      'rain': 'PSYCHOLOGICAL'
    };

    const title = content.split('\n')[0].toLowerCase();
    if (titleToTheme[title]) {
      return [titleToTheme[title]];
    }

    // Fallback content-based detection
    if (content.toLowerCase().includes('nostalgia')) return ['PARASITE'];
    if (content.toLowerCase().includes('cave')) return ['LOVECRAFTIAN'];
    if (content.toLowerCase().includes('therapist')) return ['PSYCHOLOGICAL'];
    if (content.toLowerCase().includes('bleach')) return ['SUICIDAL'];
    if (content.toLowerCase().includes('machine')) return ['TECHNOLOGICAL'];
    if (content.toLowerCase().includes('drive')) return ['PSYCHOPATH'];
    if (content.toLowerCase().includes('mirror')) return ['SUPERNATURAL'];
    if (content.toLowerCase().includes('car')) return ['PSYCHOLOGICAL'];
    if (content.toLowerCase().includes('doll')) return ['PSYCHOPATH'];
    if (content.toLowerCase().includes('cookbook')) return ['CANNIBALISM'];
    // Theme detection for these stories removed as requested
    if (content.toLowerCase().includes('bug')) return [];
    if (content.toLowerCase().includes('skin')) return [];
    if (content.toLowerCase().includes('tunnel')) return [];
    if (content.toLowerCase().includes('chase')) return [];
    if (content.toLowerCase().includes('descent')) return [];
    if (content.toLowerCase().includes('rain')) return ['PSYCHOLOGICAL'];

    const themeCounts = new Map<ThemeCategory, number>();
    const lowerContent = content.toLowerCase();

    Object.entries(THEME_CATEGORIES).forEach(([theme, info]) => {
      let score = 0;

      info.keywords.forEach(keyword => {
        if (new RegExp(`\\b${keyword}\\b`, 'i').test(content)) {
          score += 1;
          if (content.slice(0, 300).includes(keyword)) score += 0.5;
          const matches = content.match(new RegExp(`\\b${keyword}\\b`, 'gi'));
          if (matches && matches.length > 1) score += 0.3;
        }
      });

      if (score > 0) {
        themeCounts.set(theme as ThemeCategory, score);
      }
    });

    let dominantTheme: ThemeCategory | null = null;
    let maxScore = 0;

    themeCounts.forEach((score, theme) => {
      if (score > maxScore) {
        maxScore = score;
        dominantTheme = theme;
      }
    });

    if (!dominantTheme || maxScore < 2) {
      if (content.includes('rain')) return ['PSYCHOLOGICAL'];
      if (content.includes('chase')) return ['STALKING'];
      if (content.includes('descent')) return ['DEATH'];
      if (content.includes('cave')) return ['LOVECRAFTIAN'];
      if (content.includes('machine')) return ['TECHNOLOGICAL'];
      return ['PSYCHOLOGICAL'];
    }

    return [dominantTheme];
  } catch (error) {
    console.error('[Theme Detection] Error:', error);
    return ['PSYCHOLOGICAL'];
  }
};

export const calculateIntensity = (content: string): number => {
  if (!content) return 3;

  const themeIntensityMap: Record<ThemeCategory, number> = {
    BODY_HORROR: 4,
    CANNIBALISM: 4.5,
    SUICIDAL: 4.5,
    PSYCHOPATH: 4,
    POSSESSION: 3.5,
    LOVECRAFTIAN: 3.5,
    SUPERNATURAL: 2.5,
    PSYCHOLOGICAL: 2.5,
    PARASITE: 3.5,
    TECHNOLOGICAL: 2,
    STALKING: 3.5,
    DEATH: 3.5,
    GOTHIC: 2,
    APOCALYPTIC: 3.5,
    ISOLATION: 2,
    AQUATIC: 2,
    VIRAL: 3,
    URBAN_LEGEND: 2,
    TIME_HORROR: 2,
    DREAMSCAPE: 2
  };

  const emotionalPatterns = {
    extreme: /terrified|horrified|petrified|screaming|agony|blood|gore|mutilate|torture|kill|die/gi,
    strong: /scared|frightened|panic|terror|dread|possessed|demon|evil|monster|beast/gi,
    moderate: /worried|nervous|anxious|uneasy|fear|strange|weird|dark|shadow/gi
  };

  let baseScore = 3;
  const themes = detectThemes(content);
  
  if (themes.length > 0) {
    baseScore = themeIntensityMap[themes[0]] || 3;
  }

  let contentScore = 0;
  Object.entries(emotionalPatterns).forEach(([level, pattern]) => {
    const matches = content.match(pattern);
    if (matches) {
      contentScore += matches.length * (
        level === 'extreme' ? 0.3 :
        level === 'strong' ? 0.2 :
        0.1
      );
    }
  });

  const shortSentences = content.split(/[.!?]+/).filter(s =>
    s.trim().split(/\s+/).length < 8
  ).length;

  contentScore += Math.min(0.5, shortSentences * 0.05);
  if (/[A-Z]{3,}/.test(content)) contentScore += 0.3;
  if (content.match(/!{2,}/g)) contentScore += 0.2;

  const finalScore = baseScore + contentScore;
  return Math.max(1, Math.min(5, Math.round(finalScore)));
};

export const getReadingTime = (content: string): string => {
  if (!content) return '0 min read';
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};

// Added function to log post creation with theme information.
export const logPostCreation = (postId: number, postTitle: string, date: string, theme: ThemeCategory) => {
  console.log(`Created post: "${postTitle}" (ID: ${postId}) with date: ${date} [Theme: ${theme}]`);
};