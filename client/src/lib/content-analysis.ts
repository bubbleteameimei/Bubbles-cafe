import { type ThemeCategory, type ThemeInfo } from "../shared/types";
import { Bug as Worm, Skull, Brain, Pill, Cpu, Dna, Axe, Ghost, Footprints, Castle, Radiation, UserMinus2, Anchor, AlertTriangle, Building, Clock, Moon } from "lucide-react";

export { type ThemeCategory, type ThemeInfo };

// Enhanced theme categories with more detailed keywords and visual effects
export const THEME_CATEGORIES: Record<ThemeCategory, ThemeInfo> = {
  PARASITE: {
    keywords: [
      'parasite', 'worm', 'maggot', 'crawl', 'burrow', 'gnaw', 'squirm',
      'writhe', 'infest', 'nostalgia', 'memory', 'forget', 'distort',
      'whisper', 'dig', 'flesh', 'brain', 'skin', 'nest', 'host',
      'consume', 'larvae', 'cocoon', 'egg', 'molt', 'transform'
    ],
    badgeVariant: "parasite",
    icon: 'Worm',
    description: 'Parasitic and invasive horror',
    visualEffects: ['mist', 'shadows', 'wiggle', 'pulse']
  },
  LOVECRAFTIAN: {
    keywords: [
      'ancient', 'deity', 'worship', 'kneel', 'statue', 'monolithic',
      'forgotten', 'blood', 'ritual', 'cave', 'underground', 'eternal',
      'revelations', 'forbidden', 'cyclopean', 'eldritch', 'cosmic',
      'madness', 'insanity', 'incomprehensible', 'tentacle', 'void',
      'abyss', 'dimension', 'otherworldly', 'cultist', 'grimoire'
    ],
    badgeVariant: "lovecraftian",
    icon: 'Skull',
    description: 'Lovecraftian and cosmic horror',
    visualEffects: ['fog', 'darkness', 'tentacles', 'void']
  },
  PSYCHOLOGICAL: {
    keywords: [
      'mind', 'sanity', 'therapy', 'mental', 'obsession', 'delusion',
      'reality', 'perception', 'consciousness', 'paranoia', 'hallucination',
      'trauma', 'identity', 'control', 'manipulation', 'rain'
    ],
    badgeVariant: "psychological",
    icon: 'Brain',
    description: 'Psychological manipulation and mental horror',
    visualEffects: ['distortion', 'flashbacks']
  },
  SUICIDAL: {
    keywords: [
      'suicide', 'bleach', 'end', 'death', 'pain', 'guilt', 'survive',
      'medication', 'hospital', 'poison', 'overdose', 'self-harm',
      'depression', 'despair', 'darkness'
    ],
    badgeVariant: "suicidal",
    icon: 'Pill',
    description: 'Self-destructive and survival horror',
    visualEffects: ['grayscale', 'desaturation']
  },
  TECHNOLOGICAL: {
    keywords: [
      'machine', 'computer', 'technology', 'artificial', 'circuit',
      'wire', 'mechanical', 'digital', 'system', 'consciousness',
      'upload', 'transfer', 'merge', 'cybernetic'
    ],
    badgeVariant: "technological",
    icon: 'Cpu',
    description: 'Technological and cybernetic horror',
    visualEffects: ['glitches', 'static']
  },
  BODY_HORROR: {
    keywords: [
      'flesh', 'transform', 'mutation', 'organic', 'grotesque', 'deform',
      'tissue', 'metamorphosis', 'skin', 'bone', 'blood', 'insect',
      'crawl', 'bug', 'inside', 'pain'
    ],
    badgeVariant: "body",
    icon: 'Dna',
    description: 'Body transformation horror',
    visualEffects: ['close-ups', 'detail']
  },
  PSYCHOPATH: {
    keywords: [
      'kill', 'murder', 'blood', 'knife', 'stalk', 'watch', 'follow',
      'obsess', 'hunt', 'capture', 'torture', 'victim', 'pleasure',
      'excitement', 'thrill'
    ],
    badgeVariant: "psychopath",
    icon: 'Axe',
    description: 'Psychopathic and murderous horror',
    visualEffects: ['red', 'blood splatter']
  },
  SUPERNATURAL: {
    keywords: [
      'ghost', 'spirit', 'haunted', 'ethereal', 'paranormal', 'entity',
      'apparition', 'mirror', 'reflection', 'portal', 'otherworldly',
      'presence', 'manifestation', 'swap', 'change'
    ],
    badgeVariant: "supernatural",
    icon: 'Ghost',
    description: 'Supernatural and paranormal horror',
    visualEffects: ['transparency', 'shimmer']
  },
  POSSESSION: {
    keywords: [
      'possess', 'demon', 'spirit', 'doll', 'puppet', 'control',
      'evil', 'exorcism', 'ritual', 'curse', 'dark', 'entity',
      'soul', 'corrupt', 'innocent'
    ],
    badgeVariant: "possession",
    icon: 'Ghost',
    description: 'Demonic possession horror',
    visualEffects: ['distortion', 'shadow']
  },
  CANNIBALISM: {
    keywords: [
      'eat', 'consume', 'flesh', 'meat', 'hunger', 'appetite',
      'feast', 'cook', 'recipe', 'cookbook', 'taste', 'devour',
      'cannibalism', 'human', 'meal'
    ],
    badgeVariant: "cannibalism",
    icon: 'Axe',
    description: 'Cannibalistic horror',
    visualEffects: ['gore', 'blood']
  },
  STALKING: {
    keywords: [
      'follow', 'watch', 'hide', 'shadow', 'stalk', 'observe',
      'track', 'pursue', 'hunt', 'predator', 'prey', 'tunnel',
      'dark', 'alone', 'fear', 'chase'
    ],
    badgeVariant: "stalking",
    icon: 'Footprints',
    description: 'Stalking and pursuit horror',
    visualEffects: ['shadows', 'darkness']
  },
  DEATH: {
    keywords: [
      'death', 'reaper', 'soul', 'afterlife', 'descent', 'fall',
      'darkness', 'eternal', 'end', 'final', 'grave', 'tombstone',
      'spirit', 'beyond', 'mortal'
    ],
    badgeVariant: "death",
    icon: 'Skull',
    description: 'Death and mortality horror',
    visualEffects: ['grayscale', 'fade']
  },
  GOTHIC: {
    keywords: [
      'castle', 'mansion', 'aristocrat', 'Victorian', 'gothic',
      'estate', 'cathedral', 'crypt', 'family', 'legacy',
      'ancestor', 'portrait', 'painting'
    ],
    badgeVariant: "gothic",
    icon: 'Castle',
    description: 'Gothic and ancestral horror',
    visualEffects: ['darkness', 'shadows']
  },
  APOCALYPTIC: {
    keywords: [
      'apocalypse', 'collapse', 'extinction', 'devastation',
      'wasteland', 'survival', 'pandemic', 'plague', 'end',
      'world', 'civilization', 'ruin'
    ],
    badgeVariant: "apocalyptic",
    icon: 'Radiation',
    description: 'Post-apocalyptic horror',
    visualEffects: ['destruction', 'ruin']
  },
  ISOLATION: {
    keywords: [
      'alone', 'solitude', 'abandoned', 'desolate', 'empty',
      'isolated', 'remote', 'stranded', 'lonely', 'silence',
      'void', 'cut-off', 'separation'
    ],
    badgeVariant: "isolation",
    icon: 'UserMinus2',
    description: 'Isolation horror',
    visualEffects: ['emptiness', 'silence']
  },
  AQUATIC: {
    keywords: [
      'ocean', 'deep', 'underwater', 'sea', 'abyss', 'maritime',
      'submarine', 'drowning', 'flood', 'marine', 'depths',
      'vessel', 'ship'
    ],
    badgeVariant: "aquatic",
    icon: 'Anchor',
    description: 'Deep sea horror',
    visualEffects: ['water', 'blue']
  },
  VIRAL: {
    keywords: [
      'infection', 'spread', 'contagion', 'disease', 'epidemic',
      'virus', 'outbreak', 'contamination', 'mutation',
      'transmission', 'infected', 'pandemic'
    ],
    badgeVariant: "viral",
    icon: 'AlertTriangle',
    description: 'Viral and epidemic horror',
    visualEffects: ['red', 'infection']
  },
  URBAN_LEGEND: {
    keywords: [
      'legend', 'myth', 'rumor', 'urban', 'tale', 'folklore',
      'city', 'street', 'local', 'whisper', 'mystery',
      'warning', 'curse'
    ],
    badgeVariant: "urban",
    icon: 'Building',
    description: 'Urban legend horror',
    visualEffects: ['city', 'night']
  },
  TIME_HORROR: {
    keywords: [
      'time', 'temporal', 'loop', 'paradox', 'clock', 'past',
      'future', 'timeline', 'moment', 'eternity', 'repeat',
      'trapped', 'forever'
    ],
    badgeVariant: "time",
    icon: 'Clock',
    description: 'Temporal horror',
    visualEffects: ['rewind', 'fast-forward']
  },
  DREAMSCAPE: {
    keywords: [
      'dream', 'nightmare', 'sleep', 'subconscious', 'surreal',
      'vision', 'lucid', 'phantasm', 'fantasy', 'illusion',
      'reality', 'trance', 'slumber', 'drowsy', 'hypnotic',
      'ethereal', 'floating', 'distorted', 'twisted', 'warped'
    ],
    badgeVariant: "dreamscape",
    icon: 'Moon',
    description: 'Dream-based horror',
    visualEffects: ['blur', 'fade', 'float', 'distort']
  }
};

// Enhanced theme detection with weighted scoring and context analysis
export const detectThemes = (content: string): ThemeCategory[] => {
  try {
    const weightedScores = new Map<ThemeCategory, number>();
    const lowerContent = content.toLowerCase();
    const paragraphs = content.split('\n\n');
    const firstParagraph = paragraphs[0]?.toLowerCase() || '';
    const lastParagraph = paragraphs[paragraphs.length - 1]?.toLowerCase() || '';

    Object.entries(THEME_CATEGORIES).forEach(([theme, info]) => {
      let score = 0;

      // Keyword matching with context weights
      info.keywords.forEach(keyword => {
        const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = content.match(keywordRegex);

        if (matches) {
          // Base score for keyword presence
          score += matches.length * 0.5;

          // Higher weight for keywords in first/last paragraphs
          if (firstParagraph.includes(keyword)) score += 1;
          if (lastParagraph.includes(keyword)) score += 0.75;

          // Bonus for repeated keywords
          if (matches.length > 2) score += 0.5;
        }
      });

      // Context-based adjustments
      if (theme === 'PSYCHOLOGICAL' && /mind|sanity|reality/i.test(firstParagraph)) {
        score *= 1.5;
      }
      if (theme === 'LOVECRAFTIAN' && /ancient|forgotten|eternal/i.test(lastParagraph)) {
        score *= 1.5;
      }
      if (theme === 'BODY_HORROR' && /transform|mutate|flesh/i.test(content)) {
        score *= 1.25;
      }

      if (score > 0) {
        weightedScores.set(theme as ThemeCategory, score);
      }
    });

    // Get top 2 themes if they meet minimum threshold
    const sortedThemes = Array.from(weightedScores.entries())
      .sort(([, a], [, b]) => b - a)
      .filter(([, score]) => score >= 2)
      .map(([theme]) => theme);

    return sortedThemes.length > 0 ? sortedThemes : ['PSYCHOLOGICAL']; // Default fallback
  } catch (error) {
    console.error('[Theme Detection] Error:', error);
    return ['PSYCHOLOGICAL'];
  }
};

// Enhanced intensity calculation with more nuanced factors
export const calculateIntensity = (content: string): number => {
  if (!content) return 3;

  const emotionalPatterns = {
    extreme: /terrified|horrified|petrified|screaming|agony|blood|gore|mutilate|torture|kill|die/gi,
    strong: /scared|frightened|panic|terror|dread|possessed|demon|evil|monster|beast/gi,
    moderate: /worried|nervous|anxious|uneasy|fear|strange|weird|dark|shadow/gi,
    subtle: /whisper|quiet|soft|creep|watch|wait|lurk|hide/gi
  };

  let intensityScore = 3; // Base score

  // Theme-based intensity adjustment
  const themes = detectThemes(content);
  const themeIntensity = themes.reduce((acc, theme) => {
    const baseIntensity = {
      BODY_HORROR: 4.5,
      CANNIBALISM: 4.5,
      SUICIDAL: 4.5,
      PSYCHOPATH: 4,
      POSSESSION: 4,
      LOVECRAFTIAN: 3.5,
      SUPERNATURAL: 3,
      PSYCHOLOGICAL: 3,
      PARASITE: 3.5,
      TECHNOLOGICAL: 2.5,
      STALKING: 3.5,
      DEATH: 3.5,
      GOTHIC: 2.5,
      APOCALYPTIC: 3.5,
      ISOLATION: 2.5,
      AQUATIC: 2.5,
      VIRAL: 3,
      URBAN_LEGEND: 2.5,
      TIME_HORROR: 2.5,
      DREAMSCAPE: 2.5
    }[theme] || 3;
    return acc + baseIntensity;
  }, 0) / themes.length;

  intensityScore = themeIntensity;

  // Content pattern analysis
  Object.entries(emotionalPatterns).forEach(([level, pattern]) => {
    const matches = content.match(pattern);
    if (matches) {
      intensityScore += matches.length * (
        level === 'extreme' ? 0.4 :
        level === 'strong' ? 0.3 :
        level === 'moderate' ? 0.2 :
        0.1
      );
    }
  });

  // Structural analysis
  const shortSentences = content.split(/[.!?]+/).filter(s =>
    s.trim().split(/\s+/).length < 6
  ).length;
  intensityScore += Math.min(0.5, shortSentences * 0.1);

  // Style analysis
  if (/[A-Z]{3,}/.test(content)) intensityScore += 0.4;
  if (content.match(/!{2,}/g)) intensityScore += 0.3;
  if (content.match(/\?{2,}/g)) intensityScore += 0.2;

  // Normalize to 1-5 range
  return Math.max(1, Math.min(5, Math.round(intensityScore)));
};

export const getReadingTime = (content: string): string => {
  if (!content) return '0 min read';
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};

export const getExcerpt = (content: string): string => {
  if (!content) return '';
  
  // Create a clean version of content with HTML removed
  const cleanContent = content.replace(/<[^>]+>/g, '');
  
  // Define keywords that indicate scary or engaging content
  const scaryKeywords = [
    'suddenly', 'blood', 'scream', 'fear', 'terror', 'dark', 'death', 
    'horror', 'dread', 'cold', 'eyes', 'flesh', 'pain', 'afraid', 
    'terrified', 'panic', 'trembling', 'heart', 'bones', 'empty',
    'parasite', 'slime', 'gnaw', 'writhe', 'worm', 'brain', 'sanity',
    'suffer', 'kill', 'murder', 'throat', 'knife', 'butcher', 'cut',
    'choke', 'dying', 'grave', 'hell', 'nightmare', 'whisper', 'scream'
  ];
  
  // Find a paragraph with scary content - try different approaches
  
  // First approach: look for paragraphs (separated by double newlines)
  const paragraphs = cleanContent.split('\n\n')
    .filter(p => p.trim().length > 40); // Filter out very short paragraphs
  
  // If no significant paragraphs found, try single newlines
  const textSegments = paragraphs.length > 1 ? paragraphs : 
    cleanContent.split('\n').filter(p => p.trim().length > 40);
  
  // If still no good segments, try sentence splitting
  const sections = textSegments.length > 1 ? textSegments :
    cleanContent.split(/(?<=\.)\s+/).filter(s => s.trim().length > 40);
  
  // Score each text segment
  const scoredSegments = sections.map((segment, index) => {
    let score = 0;
    const text = segment.trim();
    
    // Skip very short segments
    if (text.length < 50 && sections.length > 1) {
      return { text, score: -1, index };
    }
    
    // Score based on scary keywords
    scaryKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        score += 2;
      }
    });
    
    // Extra points for dramatic punctuation
    if (text.includes('!')) score += 3;
    if (text.includes('?')) score += 2;
    if (text.includes('...')) score += 2;
    
    // Additional scoring for direct speech which is often more engaging
    if (text.includes('"') || text.includes('"') || text.includes('"')) {
      score += 3;
    }
    
    // Bonus points for second-person narrative which is more engaging
    if (text.toLowerCase().includes(' you ') || text.toLowerCase().includes(' your ')) {
      score += 2;
    }
    
    return { text, score, index };
  });
  
  // Sort by score (highest first)
  scoredSegments.sort((a, b) => b.score - a.score);
  
  // Use the highest scoring segment or fallback strategies
  let selectedText;
  
  if (scoredSegments.length > 0 && scoredSegments[0].score > 1) {
    // Use the highest scoring segment
    selectedText = scoredSegments[0].text;
  } else if (sections.length > 2) {
    // If no high scores, pick a paragraph from the middle of the story (often more interesting)
    const middleIndex = Math.floor(sections.length / 3); // Start at 1/3 through the story
    selectedText = sections[middleIndex] || sections[0];
  } else {
    // Fallback to beginning of content
    selectedText = cleanContent.substring(0, 300);
  }
  
  // Ensure proper length and formatting
  const maxLength = 200;
  if (selectedText.length > maxLength) {
    return selectedText.substring(0, maxLength).split(' ').slice(0, -1).join(' ') + '...';
  }
  
  return selectedText;
};

// Added function to log post creation with theme information.
export const logPostCreation = (postId: number, postTitle: string, date: string, theme: ThemeCategory) => {
  console.log(`Created post: "${postTitle}" (ID: ${postId}) with date: ${date} [Theme: ${theme}]`);
};