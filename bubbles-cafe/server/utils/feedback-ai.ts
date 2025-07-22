/**
 * Feedback AI - Automated response suggestion system
 * 
 * This utility provides automated response suggestions for various types of user feedback
 * based on pattern recognition and content analysis.
 */

import { UserFeedback } from '../../shared/schema';
import { feedbackLogger } from './debug-logger';

/**
 * Types of feedback that can be categorized for automated responses
 */
export type FeedbackCategory = 'bug' | 'feature' | 'praise' | 'complaint' | 'question' | 'general';

/**
 * Response suggestion with context information
 */
export interface ResponseSuggestion {
  suggestion: string;
  confidence: number;
  category: FeedbackCategory;
  tags?: string[];
  template?: string;
  isAutomated: boolean;
}

/**
 * Keywords that help categorize and refine response suggestions
 */
const categoryKeywords = {
  bug: [
    'broken', 'error', 'issue', 'problem', 'not working', 'crash', 'fail', 'bug',
    'glitch', 'incorrect', 'doesn\'t work', 'doesn\'t load', 'stuck', 'freezes'
  ],
  feature: [
    'add', 'feature', 'suggestion', 'improvement', 'enhance', 'upgrade', 'implement',
    'could you', 'would be nice', 'wish', 'hope', 'consider', 'should have'
  ],
  praise: [
    'love', 'great', 'amazing', 'excellent', 'awesome', 'fantastic', 'good job',
    'well done', 'impressive', 'wonderful', 'brilliant', 'thank you', 'thanks'
  ],
  complaint: [
    'disappointed', 'unhappy', 'frustrating', 'annoying', 'difficult', 'hard to',
    'terrible', 'awful', 'bad', 'poor', 'worst', 'waste', 'useless', 'horrible'
  ],
  question: [
    'how do I', 'how can I', 'is there a way', 'can you', 'possible to', 
    'wondering if', 'help with', 'how to', 'where is', 'what is', 'when will'
  ]
};

/**
 * Response templates for different feedback categories
 */
const responseTemplates = {
  bug: [
    "Thank you for reporting this issue. Our development team is investigating the problem and will work to resolve it as soon as possible.",
    "We appreciate you bringing this bug to our attention. Our team is looking into it and will provide an update once it's fixed.",
    "Thank you for your bug report. We've logged this issue and assigned it to our development team for resolution."
  ],
  feature: [
    "Thank you for your feature suggestion. We're always looking for ways to improve our platform and will consider this for a future update.",
    "We appreciate your feedback! Your feature request has been added to our product roadmap for consideration.",
    "Thanks for the suggestion. We're evaluating this feature request and will update you if we decide to implement it."
  ],
  praise: [
    "Thank you for your kind words! We're delighted to hear you're enjoying our platform.",
    "We appreciate your positive feedback! It's great to know our work is making a difference for you.",
    "Thank you for taking the time to share your positive experience. Your feedback motivates our team to continue improving."
  ],
  complaint: [
    "We're sorry to hear about your experience. We take your feedback seriously and will work to address these concerns.",
    "Thank you for bringing this to our attention. We apologize for the inconvenience and are working to improve this aspect of our service.",
    "We appreciate your honest feedback. Our team is reviewing your concerns to make necessary improvements."
  ],
  question: [
    "Thank you for your question. Our support team will reach out shortly with more information to help you.",
    "We've received your inquiry and will provide you with a detailed response as soon as possible.",
    "Thanks for reaching out. We're preparing an answer to your question and will respond shortly."
  ],
  general: [
    "Thank you for your feedback. We appreciate you taking the time to share your thoughts with us.",
    "We value your input and will use it to continue improving our services.",
    "Thank you for sharing your feedback. It helps us understand how we can better serve our users."
  ]
};

/**
 * Analyzes feedback content to identify its primary category
 */
export function categorizeFeedback(feedback: UserFeedback): FeedbackCategory {
  // If the feedback already has a valid type, use it
  if (feedback.type && ['bug', 'feature', 'praise', 'complaint', 'question', 'general'].includes(feedback.type)) {
    return feedback.type as FeedbackCategory;
  }
  
  const content = feedback.content.toLowerCase();
  const scores: Record<FeedbackCategory, number> = {
    bug: 0,
    feature: 0,
    praise: 0,
    complaint: 0,
    question: 0,
    general: 1 // Default base score
  };
  
  // Score based on keyword matching
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        scores[category as FeedbackCategory] += 1;
      }
    });
  });
  
  // Check for question marks as an indicator of questions
  if (content.includes('?')) {
    scores.question += 2;
  }
  
  // Get the highest scoring category
  let highestCategory: FeedbackCategory = 'general';
  let highestScore = 0;
  
  Object.entries(scores).forEach(([category, score]) => {
    if (score > highestScore) {
      highestScore = score;
      highestCategory = category as FeedbackCategory;
    }
  });
  
  feedbackLogger.debug('Feedback categorized', { 
    category: highestCategory, 
    scores,
    contentLength: content.length
  });
  
  return highestCategory;
}

/**
 * Analyzes feedback content and metadata to generate helpful response suggestions
 */
export function generateResponseSuggestion(feedback: UserFeedback): ResponseSuggestion {
  try {
    // Determine the feedback category
    const category = categorizeFeedback(feedback);
    
    // Select a response template based on the category
    const templates = responseTemplates[category] || responseTemplates.general;
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Calculate a confidence score based on various factors
    const confidenceFactors = {
      contentLength: Math.min(feedback.content.length / 1000, 0.4), // Longer content up to a point
      hasMetadata: feedback.metadata && Object.keys(feedback.metadata).length > 0 ? 0.1 : 0,
      hasRating: feedback.rating !== null && feedback.rating > 0 ? 0.1 : 0,
      categoryMatchScore: category === feedback.type ? 0.2 : 0
    };
    
    const confidence = 0.3 + // Base confidence
      confidenceFactors.contentLength +
      confidenceFactors.hasMetadata +
      confidenceFactors.hasRating +
      confidenceFactors.categoryMatchScore;
    
    // Generate tags based on feedback content and metadata
    const tags = generateTags(feedback, category);
    
    // Log the suggestion generation
    feedbackLogger.info('Generated response suggestion', { 
      category, 
      confidence: confidence.toFixed(2),
      tags
    });
    
    return {
      suggestion: template,
      confidence: parseFloat(confidence.toFixed(2)),
      category,
      tags,
      template,
      isAutomated: true
    };
  } catch (error) {
    feedbackLogger.error('Error generating response suggestion', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      feedbackId: feedback.id
    });
    
    // Fallback response in case of errors
    return {
      suggestion: "Thank you for your feedback. Our team will review it and respond if necessary.",
      confidence: 0.1,
      category: 'general',
      isAutomated: true
    };
  }
}

/**
 * Generates relevant tags for feedback based on content and category
 */
function generateTags(feedback: UserFeedback, category: FeedbackCategory): string[] {
  const tags: string[] = [category];
  const content = feedback.content.toLowerCase();
  
  // Add page as a tag if it's not "unknown"
  if (feedback.page && feedback.page !== 'unknown') {
    tags.push(`page:${feedback.page.replace(/^\//, '')}`);
  }
  
  // Add browser as a tag
  if (feedback.browser && feedback.browser !== 'unknown') {
    tags.push(`browser:${feedback.browser.toLowerCase().split(' ')[0]}`);
  }
  
  // Add OS as a tag
  if (feedback.operatingSystem && feedback.operatingSystem !== 'unknown') {
    tags.push(`os:${feedback.operatingSystem.toLowerCase().split(' ')[0]}`);
  }
  
  // Add rating-based tag
  if (feedback.rating !== null && feedback.rating > 0) {
    if (feedback.rating >= 4) {
      tags.push('high-rating');
    } else if (feedback.rating <= 2) {
      tags.push('low-rating');
    }
  }
  
  // Add priority tag for certain keywords
  const urgentKeywords = ['urgent', 'critical', 'immediately', 'serious', 'emergency'];
  if (urgentKeywords.some(keyword => content.includes(keyword))) {
    tags.push('priority');
  }
  
  return tags;
}

/**
 * Provides contextual hints for admin response based on feedback analysis
 */
export function getResponseHints(feedback: UserFeedback): string[] {
  const category = categorizeFeedback(feedback);
  const hints: string[] = [];
  
  switch (category) {
    case 'bug':
      hints.push('Acknowledge the specific issue mentioned');
      hints.push('Provide an estimated timeline for resolution if possible');
      hints.push('Ask for additional details if needed (browser version, steps to reproduce)');
      break;
    case 'feature':
      hints.push('Thank them for the suggestion and explain if it fits product roadmap');
      hints.push('Consider asking for more details about their use case');
      hints.push('Be honest about implementation likelihood');
      break;
    case 'praise':
      hints.push('Express genuine appreciation for their positive feedback');
      hints.push('Share the feedback with the relevant team members');
      hints.push('Consider asking what other features they enjoy');
      break;
    case 'complaint':
      hints.push('Acknowledge their frustration without making excuses');
      hints.push('Provide a clear solution or next steps');
      hints.push('Follow up to ensure they are satisfied with the resolution');
      break;
    case 'question':
      hints.push('Provide a clear, direct answer to their question');
      hints.push('Include links to relevant documentation if available');
      hints.push('Ask if your answer addressed their concern');
      break;
    default:
      hints.push('Thank them for their feedback');
      hints.push('Ask if there is anything specific they would like to see improved');
      hints.push('Maintain a friendly, appreciative tone');
  }
  
  return hints;
}