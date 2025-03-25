/**
 * Content Analysis Utility
 * 
 * This module provides functions for analyzing and processing content,
 * including readability metrics, keyword extraction, and content validation.
 */

import { z } from 'zod';
import { ErrorCategory, handleError } from './error-handler';
import type { ThemeCategory, ThemeInfo } from '@/shared/types';

// Theme categories with detailed information for use in the UI
export const THEME_CATEGORIES: Record<ThemeCategory, ThemeInfo> = {
  'Parasite': {
    keywords: ['parasite', 'infection', 'bug', 'invasion', 'body', 'crawl', 'insect'],
    badgeVariant: 'parasite',
    icon: 'Bug',
    description: 'Stories featuring parasitic entities that take over hosts',
    visualEffects: ['wriggling', 'body distortion']
  },
  'Cosmic': {
    keywords: ['cosmic', 'ancient', 'cave', 'unknowable', 'madness', 'cult', 'lovecraftian', 'elder', 'cthulhu'],
    badgeVariant: 'cosmic',
    icon: 'Skull',
    description: 'Cosmic horror and incomprehensible ancient entities',
    visualEffects: ['tentacles', 'fractal patterns']
  },
  'Psychological': {
    keywords: ['mind', 'sanity', 'perception', 'therapist', 'reality', 'delusion', 'hallucination', 'madness', 'song'],
    badgeVariant: 'psychological',
    icon: 'Brain',
    description: 'Horror that plays with the mind and perception of reality',
    visualEffects: ['distortion', 'hallucinations']
  },
  'Technological': {
    keywords: ['technology', 'machine', 'digital', 'computer', 'ai', 'robot', 'code', 'program'],
    badgeVariant: 'technological',
    icon: 'Cpu',
    description: 'Horror involving technology gone wrong',
    visualEffects: ['glitches', 'screen artifacts']
  },
  'Body Horror': {
    keywords: ['flesh', 'mutation', 'journal', 'transformation', 'deformation', 'grotesque', 'organs', 'inside'],
    badgeVariant: 'body',
    icon: 'Dna',
    description: 'Horror focused on the destruction or transformation of the body',
    visualEffects: ['flesh warping', 'body distortion']
  },
  'Psychopath': {
    keywords: ['killer', 'murder', 'car', 'psychopath', 'insane', 'sadist', 'torture', 'violent'],
    badgeVariant: 'psychopath',
    icon: 'Axe',
    description: 'Content featuring psychopathic characters',
    visualEffects: ['sharp imagery', 'blood']
  },
  'Supernatural': {
    keywords: ['ghost', 'spirit', 'word', 'haunting', 'paranormal', 'phantom', 'specter', 'poltergeist'],
    badgeVariant: 'supernatural',
    icon: 'Ghost',
    description: 'Horror involving supernatural entities and events',
    visualEffects: ['ghostly apparitions', 'fog']
  },
  'Uncanny': {
    keywords: ['uncanny', 'doll', 'mannequin', 'lifelike', 'unnatural', 'eerily', 'resembling', 'humanoid'],
    badgeVariant: 'uncanny',
    icon: 'AlertTriangle',
    description: 'Horror based on the uncanny valley and unnatural resemblances',
    visualEffects: ['static expressions', 'empty eyes']
  },
  'Cannibalism': {
    keywords: ['cannibalism', 'eat', 'cookbook', 'flesh', 'devour', 'consume', 'human meat', 'hunger'],
    badgeVariant: 'cannibalism',
    icon: 'Utensils',
    description: 'Horror involving the consumption of human flesh',
    visualEffects: ['gore', 'viscera']
  },
  'Stalking': {
    keywords: ['stalk', 'follow', 'chase', 'watch', 'pursue', 'hunt', 'prey', 'victim'],
    badgeVariant: 'stalking',
    icon: 'Footprints',
    description: 'Stories featuring stalking or being hunted',
    visualEffects: ['shadows', 'voyeuristic']
  },
  'Existential': {
    keywords: ['existence', 'meaning', 'nostalgia', 'purpose', 'nihilism', 'void', 'empty', 'alone'],
    badgeVariant: 'existential',
    icon: 'Scan',
    description: 'Horror exploring existential dread and the meaning of existence',
    visualEffects: ['void', 'emptiness']
  },
  'Gothic': {
    keywords: ['gothic', 'castle', 'Victorian', 'aristocrat', 'ancient', 'mansion', 'estate'],
    badgeVariant: 'gothic',
    icon: 'Castle',
    description: 'Gothic horror set in old manors, castles, or decaying settings',
    visualEffects: ['mist', 'architectural decay']
  },
  'Vehicular': {
    keywords: ['vehicle', 'car', 'drive', 'road', 'crash', 'accident', 'highway', 'journey'],
    badgeVariant: 'vehicular',
    icon: 'Car',
    description: 'Horror taking place in or involving vehicles',
    visualEffects: ['motion blur', 'headlights']
  },
  'Doppelgänger': {
    keywords: ['double', 'mirror', 'twin', 'replica', 'copy', 'reflection', 'identical', 'imposter'],
    badgeVariant: 'doppelganger',
    icon: 'Copy',
    description: 'Horror involving doubles or identical copies of people',
    visualEffects: ['mirror images', 'symmetry']
  },
  'Slasher': {
    keywords: ['slasher', 'killer', 'knife', 'blood', 'hunt', 'stalk', 'murder', 'victim', 'chase'],
    badgeVariant: 'slasher',
    icon: 'Knife',
    description: 'Horror featuring a killer stalking and murdering victims',
    visualEffects: ['blood splatter', 'sharp weapons']
  },
  'Horror': {
    keywords: ['horror', 'terror', 'fear', 'dread', 'frightening', 'scary', 'rain', 'dark'],
    badgeVariant: 'horror',
    icon: 'CloudRain',
    description: 'General horror stories that evoke fear and dread',
    visualEffects: ['shadows', 'darkness']
  }
};

// Content validation schema
export const contentSchema = z.object({
  title: z.string().min(3).max(100),
  content: z.string().min(10),
  excerpt: z.string().optional(),
  author: z.string().optional(),
  publishDate: z.string().datetime().optional(),
  modifiedDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  featuredImage: z.string().url().optional(),
  readingTime: z.number().min(1).optional()
});

export type ContentData = z.infer<typeof contentSchema>;

/**
 * Content readability levels
 */
export enum ReadabilityLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  DIFFICULT = 'difficult'
}

/**
 * Content analysis result interface
 */
export interface ContentAnalysis {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  readingTime: number;
  readabilityScore: number;
  readabilityLevel: ReadabilityLevel;
  keyPhrases: string[];
  hasImages: boolean;
  hasLinks: boolean;
  emotionalTone: string;
}

/**
 * Analyze content and return detailed metrics
 */
export function analyzeContent(content: string): ContentAnalysis {
  try {
    if (!content) {
      throw new Error('Content is empty or undefined');
    }
    
    // Strip HTML tags for text analysis
    const plainText = content.replace(/<\/?[^>]+(>|$)/g, '');
    
    // Basic metrics
    const words = plainText.split(/\s+/).filter(word => word.length > 0);
    const sentences = plainText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const paragraphs = content.split(/<\/p>/).filter(p => p.trim().length > 0);
    
    // Calculate reading time (words per minute)
    const wordsPerMinute = 225;
    const readingTime = Math.max(1, Math.ceil(words.length / wordsPerMinute));
    
    // Check for images and links
    const hasImages = /<img[^>]+>/g.test(content);
    const hasLinks = /<a[^>]+>/g.test(content);
    
    // Simple readability score (higher is more complex)
    // Based on a simplified Flesch-Kincaid calculation
    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
    const avgSyllablesPerWord = estimateAverageSyllables(plainText);
    const readabilityScore = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
    
    // Determine readability level
    let readabilityLevel: ReadabilityLevel;
    if (readabilityScore < 30) {
      readabilityLevel = ReadabilityLevel.EASY;
    } else if (readabilityScore < 50) {
      readabilityLevel = ReadabilityLevel.MEDIUM;
    } else {
      readabilityLevel = ReadabilityLevel.DIFFICULT;
    }
    
    // Extract key phrases (simplified implementation)
    const keyPhrases = extractKeyPhrases(plainText);
    
    // Determine emotional tone (simplified implementation)
    const emotionalTone = analyzeEmotionalTone(plainText);
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      readingTime,
      readabilityScore,
      readabilityLevel,
      keyPhrases,
      hasImages,
      hasLinks,
      emotionalTone
    };
  } catch (error) {
    // Handle any errors during analysis
    handleError(error, {
      category: ErrorCategory.VALIDATION,
      showToast: false
    });
    
    // Return default values
    return {
      wordCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      readingTime: 1,
      readabilityScore: 0,
      readabilityLevel: ReadabilityLevel.MEDIUM,
      keyPhrases: [],
      hasImages: false,
      hasLinks: false,
      emotionalTone: 'neutral'
    };
  }
}

/**
 * Estimate average syllables per word in text (simplified)
 */
function estimateAverageSyllables(text: string): number {
  // This is a simplified syllable counter
  // A more accurate implementation would use a dictionary or complex rules
  const words = text.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) return 0;
  
  let totalSyllables = 0;
  
  for (const word of words) {
    // Count vowel groups as syllables (simplified approach)
    const syllables = word.toLowerCase()
      .replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, '')
      .replace(/^y/, '')
      .match(/[aeiouy]{1,2}/g);
    
    totalSyllables += syllables ? syllables.length : 1;
  }
  
  return totalSyllables / words.length;
}

/**
 * Extract key phrases from text (simplified implementation)
 */
function extractKeyPhrases(text: string): string[] {
  // This is a simplified implementation
  // A more robust solution would use NLP techniques or a specialized library
  
  // Remove common stop words and punctuation
  const cleanText = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
  
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
    'by', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between',
    'out', 'against', 'during', 'without', 'before', 'under', 'around', 'among',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could',
    'may', 'might', 'must', 'of', 'from', 'then', 'than', 'that', 'this',
    'these', 'those', 'it', 'they', 'them', 'their', 'we', 'us', 'our'
  ]);
  
  // Split into words and filter out stop words
  const words = cleanText.split(' ').filter(word => 
    word.length > 3 && !stopWords.has(word)
  );
  
  // Count word frequencies
  const wordFrequencies: Record<string, number> = {};
  for (const word of words) {
    wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
  }
  
  // Extract two-word phrases (bigrams)
  const phrases: Record<string, number> = {};
  for (let i = 0; i < words.length - 1; i++) {
    if (!stopWords.has(words[i]) && !stopWords.has(words[i + 1])) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      phrases[phrase] = (phrases[phrase] || 0) + 1;
    }
  }
  
  // Combine words and phrases, sort by frequency
  const combined = [
    ...Object.entries(wordFrequencies),
    ...Object.entries(phrases)
  ].sort((a, b) => b[1] - a[1]);
  
  // Return top 5 key phrases
  return combined.slice(0, 5).map(entry => entry[0]);
}

/**
 * Analyze emotional tone of text (simplified implementation)
 */
function analyzeEmotionalTone(text: string): string {
  // This is a simplified implementation
  // A production solution would use sentiment analysis libraries or ML models
  
  const toneIndicators: Record<string, string[]> = {
    positive: ['happy', 'joy', 'love', 'exciting', 'amazing', 'good', 'great', 'wonderful', 'delighted', 'pleased'],
    negative: ['sad', 'angry', 'fear', 'terrible', 'horrible', 'bad', 'awful', 'frightening', 'scary', 'dreadful'],
    suspenseful: ['mysterious', 'unknown', 'suspense', 'tension', 'eerie', 'strange', 'unusual', 'bizarre', 'creepy'],
    informative: ['explain', 'information', 'data', 'research', 'study', 'analysis', 'conclusion', 'result', 'evidence']
  };
  
  const lowerText = text.toLowerCase();
  const toneScores: Record<string, number> = {
    positive: 0,
    negative: 0,
    suspenseful: 0,
    informative: 0,
    neutral: 0
  };
  
  // Count tone indicators
  for (const [tone, indicators] of Object.entries(toneIndicators)) {
    for (const word of indicators) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        toneScores[tone] += matches.length;
      }
    }
  }
  
  // Find dominant tone
  let dominantTone = 'neutral';
  let highestScore = 0;
  
  for (const [tone, score] of Object.entries(toneScores)) {
    if (score > highestScore) {
      highestScore = score;
      dominantTone = tone;
    }
  }
  
  return dominantTone;
}

/**
 * Validate content data with proper error handling
 */
export function validateContent(data: unknown): { 
  isValid: boolean; 
  content?: ContentData;
  errors?: z.ZodError;
} {
  try {
    const result = contentSchema.safeParse(data);
    
    if (!result.success) {
      return {
        isValid: false,
        errors: result.error
      };
    }
    
    return {
      isValid: true,
      content: result.data
    };
  } catch (error) {
    handleError(error, {
      category: ErrorCategory.VALIDATION,
      showToast: true
    });
    
    return {
      isValid: false
    };
  }
}

/**
 * Extract a clean excerpt from HTML content
 * @param htmlContent The HTML content to extract from
 * @param maxLength Maximum length of the excerpt
 * @returns Clean excerpt text
 */
export function getExcerpt(htmlContent: string, maxLength: number = 250): string {
  try {
    if (!htmlContent) return '';
    
    // Remove HTML tags and clean up whitespace
    const text = htmlContent
      .replace(/<\/?[^>]+(>|$)/g, '')  // Remove HTML tags
      .replace(/&nbsp;/g, ' ')          // Convert &nbsp; to regular spaces
      .replace(/\s+/g, ' ')             // Normalize whitespace
      .trim();                          // Remove leading/trailing whitespace
    
    // Truncate to max length if needed
    if (text.length <= maxLength) {
      return text;
    }
    
    // Find a good breaking point at a sentence or paragraph end
    const truncated = text.substring(0, maxLength);
    
    // Check for periods, question marks, or exclamation points followed by space
    const sentenceEnd = Math.max(
      truncated.lastIndexOf('. '),
      truncated.lastIndexOf('? '),
      truncated.lastIndexOf('! ')
    );
    
    // If a sentence end is found within the last 40 characters, use it
    if (sentenceEnd > maxLength - 40 && sentenceEnd > 0) {
      return truncated.substring(0, sentenceEnd + 1) + '...';
    }
    
    // Otherwise fall back to breaking at word boundaries
    const lastSpace = truncated.lastIndexOf(' ');
    
    // Return truncated text with ellipsis
    return lastSpace > 0 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
  } catch (error) {
    handleError(error, {
      category: ErrorCategory.VALIDATION,
      showToast: false
    });
    
    return '';
  }
}

/**
 * Calculate text similarity between two content pieces
 * Returns a score between 0 and 1, where 1 means identical
 */

/**
 * Calculate estimated reading time for content
 * @param content HTML content to analyze
 * @param wordsPerMinute Reading speed, defaults to 225 WPM
 * @returns Estimated reading time in minutes (minimum 1)
 */
export function getReadingTime(content: string, wordsPerMinute: number = 225): string {
  try {
    if (!content) return '1 min';
    
    // Strip HTML tags for text analysis
    const plainText = content.replace(/<\/?[^>]+(>|$)/g, '');
    
    // Count words
    const words = plainText.split(/\s+/).filter(word => word.length > 0);
    
    // Calculate reading time
    const minutes = Math.max(1, Math.ceil(words.length / wordsPerMinute));
    return `${minutes} min`;
  } catch (error) {
    handleError(error, {
      category: ErrorCategory.VALIDATION,
      showToast: false
    });
    
    return '1 min'; // Default to 1 minute if calculation fails
  }
}

/**
 * Detect theme categories from content
 * Returns an array of detected theme categories sorted by relevance
 */
export function detectThemes(content: string): ThemeCategory[] {
  try {
    if (!content) return [];
    
    // Clean the content for analysis
    const lowerContent = content.toLowerCase()
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
    
    // Split content into paragraphs for contextual analysis
    const paragraphs = lowerContent.split(/\n\n+/);
    const firstParagraph = paragraphs[0] || '';
    const lastParagraph = paragraphs[paragraphs.length - 1] || '';
    
    // Score each theme
    const weightedScores = new Map<ThemeCategory, number>();
    
    Object.entries(THEME_CATEGORIES).forEach(([theme, info]) => {
      let score = 0;
      
      // Check for keywords
      info.keywords.forEach(keyword => {
        // Count occurrences
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerContent.match(regex);
        if (matches) {
          // Weight by number of occurrences
          score += matches.length * 2;
          
          // Extra weight for keywords in first or last paragraph (often most revealing)
          if (firstParagraph.includes(keyword)) score += 3;
          if (lastParagraph.includes(keyword)) score += 3;
        }
      });
      
      // Store score if any matches found
      if (score > 0) {
        weightedScores.set(theme as ThemeCategory, score);
      }
    });
    
    // Convert to array and sort by score descending
    const sortedThemes = Array.from(weightedScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([theme]) => theme);
    
    // Return top 3 themes max
    return sortedThemes.slice(0, 3);
  } catch (error) {
    handleError(error, {
      category: ErrorCategory.VALIDATION,
      showToast: false
    });
    
    return [];
  }
}

export function calculateContentSimilarity(text1: string, text2: string): number {
  try {
    // Simple implementation using Jaccard similarity
    // (more sophisticated implementations would use word embeddings or NLP)
    
    if (!text1 || !text2) return 0;
    
    // Convert to lowercase and remove HTML, punctuation
    const clean1 = text1.toLowerCase()
      .replace(/<[^>]+>/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
      
    const clean2 = text2.toLowerCase()
      .replace(/<[^>]+>/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Split into words
    const words1 = new Set(clean1.split(' '));
    const words2 = new Set(clean2.split(' '));
    
    // Calculate intersection
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    
    // Calculate union
    const union = new Set([...words1, ...words2]);
    
    // Jaccard similarity
    return intersection.size / union.size;
  } catch (error) {
    handleError(error, {
      category: ErrorCategory.VALIDATION,
      showToast: false
    });
    
    return 0;
  }
}