/**
 * Content Analysis Utility
 * 
 * This module provides functions for analyzing and processing content,
 * including readability metrics, keyword extraction, and content validation.
 */

import { z } from 'zod';
import { ErrorCategory, handleError } from './error-handler';

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
 * Calculate text similarity between two content pieces
 * Returns a score between 0 and 1, where 1 means identical
 */
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