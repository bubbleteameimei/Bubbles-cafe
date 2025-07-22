/**
 * Enhanced Feedback AI - Advanced response generation system
 * 
 * This utility provides intelligent response suggestions with contextual
 * understanding for different types of user feedback.
 */

import { UserFeedback } from '../../shared/schema';
import { feedbackLogger } from './debug-logger';
import { categorizeFeedback, ResponseSuggestion } from './feedback-ai';

/**
 * Response template with customization options and contextual variables
 */
interface ResponseTemplate {
  template: string;
  variables: string[];
  userCases: string[];
  formality: 'casual' | 'neutral' | 'formal';
  sentiment: 'positive' | 'neutral' | 'apologetic';
}

/**
 * Enhanced templates with contextual variables and tone options
 */
const enhancedTemplates: Record<string, ResponseTemplate[]> = {
  bug: [
    {
      template: "Thank you for reporting this issue with {{feature}}. Our development team is investigating the problem and will work to resolve it as soon as possible. We'll keep you updated on our progress.",
      variables: ['feature'],
      userCases: ['specific feature mentioned', 'technical details provided'],
      formality: 'neutral',
      sentiment: 'apologetic'
    },
    {
      template: "We appreciate you bringing this bug to our attention. This appears to be related to our {{component}} and our team is already looking into it. We expect to have a fix available in our next update.",
      variables: ['component'],
      userCases: ['repeat bug report', 'known issue'],
      formality: 'neutral',
      sentiment: 'neutral'
    },
    {
      template: "I'm sorry you're experiencing this problem. We're taking this seriously and have prioritized it for our engineering team. To help us resolve it faster, could you provide any additional details about when this occurs?",
      variables: [],
      userCases: ['vague bug report', 'needs more information'],
      formality: 'casual',
      sentiment: 'apologetic'
    }
  ],
  feature: [
    {
      template: "Thank you for suggesting we add {{feature}}. We're always looking for ways to improve our platform and will consider this for a future update. We've added your idea to our product roadmap discussions.",
      variables: ['feature'],
      userCases: ['specific feature request', 'detailed enhancement'],
      formality: 'neutral',
      sentiment: 'positive'
    },
    {
      template: "What a thoughtful suggestion! We've been considering something similar to {{feature}} and your feedback helps validate that this would be valuable to our users.",
      variables: ['feature'],
      userCases: ['already planned feature', 'aligned with roadmap'],
      formality: 'casual',
      sentiment: 'positive'
    },
    {
      template: "We appreciate your suggestion regarding {{feature}}. While we can't commit to a specific timeline, we are continually evaluating new features based on user feedback and technical feasibility.",
      variables: ['feature'],
      userCases: ['complex feature request', 'long-term consideration'],
      formality: 'formal',
      sentiment: 'neutral'
    }
  ],
  praise: [
    {
      template: "Thank you for your kind words about {{feature}}! We're delighted to hear you're enjoying our platform. It's feedback like yours that motivates our team.",
      variables: ['feature'],
      userCases: ['specific feature praised', 'positive experience'],
      formality: 'casual',
      sentiment: 'positive'
    },
    {
      template: "We appreciate your positive feedback! It's wonderful to hear that {{feature}} is making a difference for you. We've shared your comments with our team.",
      variables: ['feature'],
      userCases: ['detailed praise', 'team acknowledgment'],
      formality: 'neutral',
      sentiment: 'positive'
    }
  ],
  complaint: [
    {
      template: "We're truly sorry to hear about your experience with {{feature}}. We take your feedback seriously and will work to address these concerns. Could you share more details about what specifically didn't meet your expectations?",
      variables: ['feature'],
      userCases: ['specific complaint', 'needs investigation'],
      formality: 'neutral',
      sentiment: 'apologetic'
    },
    {
      template: "Thank you for bringing this concern to our attention. We apologize for the inconvenience with {{feature}} and are actively working to improve this aspect of our service.",
      variables: ['feature'],
      userCases: ['known issue', 'being addressed'],
      formality: 'formal',
      sentiment: 'apologetic'
    }
  ],
  question: [
    {
      template: "Great question about {{feature}}! Here's how it works: [Details to be filled in by admin]. Let me know if you need any clarification.",
      variables: ['feature'],
      userCases: ['specific question', 'feature inquiry'],
      formality: 'casual',
      sentiment: 'positive'
    },
    {
      template: "Thank you for your question regarding {{feature}}. Our support team will reach out with more information within 24 hours. In the meantime, you might find helpful resources in our knowledge base.",
      variables: ['feature'],
      userCases: ['complex question', 'needs research'],
      formality: 'formal',
      sentiment: 'neutral'
    }
  ],
  general: [
    {
      template: "Thank you for your feedback. We appreciate you taking the time to share your thoughts with us and will use this information to improve our services.",
      variables: [],
      userCases: ['vague feedback', 'general comment'],
      formality: 'neutral',
      sentiment: 'neutral'
    }
  ]
};

/**
 * Extract key entities or features mentioned in the feedback content
 */
function extractKeyEntities(content: string): Record<string, string> {
  const entities: Record<string, string> = {};
  
  // Simple extraction logic - could be replaced with more sophisticated NLP
  const featureRegex = /(?:feature|functionality|option|ability to|button|page|section on|about) ([\w\s-]+)/i;
  const featureMatch = content.match(featureRegex);
  
  if (featureMatch && featureMatch[1]) {
    entities.feature = featureMatch[1].trim();
  } else {
    // Alternative: look for nouns following "the" or "your" as potential features
    const fallbackRegex = /(?:the|your) ([\w\s-]+)/i;
    const fallbackMatch = content.match(fallbackRegex);
    if (fallbackMatch && fallbackMatch[1]) {
      entities.feature = fallbackMatch[1].trim();
    }
  }
  
  // Extract component if mentioned (this could be extended for other entities)
  const componentRegex = /(?:component|module|element|widget|tool) ([\w\s-]+)/i;
  const componentMatch = content.match(componentRegex);
  
  if (componentMatch && componentMatch[1]) {
    entities.component = componentMatch[1].trim();
  }
  
  return entities;
}

/**
 * Select the best template based on feedback content and context
 */
function selectBestTemplate(feedback: UserFeedback, category: string): ResponseTemplate {
  const templates = enhancedTemplates[category] || enhancedTemplates.general;
  
  // Default to first template if no better match found
  let bestTemplate = templates[0];
  let bestScore = 0;
  
  const content = feedback.content.toLowerCase();
  
  // Compare each template against the feedback
  templates.forEach(template => {
    let score = 0;
    
    // Check if variables in the template can be filled from the feedback
    const entities = extractKeyEntities(content);
    template.variables.forEach(variable => {
      if (entities[variable]) {
        score += 2;
      }
    });
    
    // Check for use case matches
    template.userCases.forEach(useCase => {
      if (content.includes(useCase.toLowerCase())) {
        score += 1;
      }
    });
    
    // Prefer formal responses for longer, more detailed feedback
    if (content.length > 200 && template.formality === 'formal') {
      score += 1;
    }
    
    // Prefer apologetic tone for complaints with negative sentiment
    if (category === 'complaint' && template.sentiment === 'apologetic') {
      score += 1;
    }
    
    // Update best template if current one has a higher score
    if (score > bestScore) {
      bestScore = score;
      bestTemplate = template;
    }
  });
  
  return bestTemplate;
}

/**
 * Fill template variables with extracted entities from feedback
 */
function fillTemplateVariables(template: string, feedback: UserFeedback): string {
  const entities = extractKeyEntities(feedback.content);
  
  // Replace variables with extracted entities or generic terms
  let filledTemplate = template.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return entities[variable] || match;
  });
  
  // If we couldn't fill all variables, use fallbacks
  filledTemplate = filledTemplate.replace(/\{\{feature\}\}/g, 'this feature');
  filledTemplate = filledTemplate.replace(/\{\{component\}\}/g, 'this component');
  
  return filledTemplate;
}

/**
 * Generate an enhanced response suggestion with contextual understanding
 */
export function generateEnhancedResponse(feedback: UserFeedback): ResponseSuggestion {
  try {
    // Use the existing categorization logic
    const category = categorizeFeedback(feedback);
    
    // Select the best template based on feedback content
    const selectedTemplate = selectBestTemplate(feedback, category);
    
    // Fill template variables with content from feedback
    const finalResponse = fillTemplateVariables(selectedTemplate.template, feedback);
    
    // Generate tags using the existing function from feedback-ai.ts
    const tags = ['enhanced', selectedTemplate.formality, selectedTemplate.sentiment, category];
    
    // Calculate confidence score
    const confidenceScore = 0.65 + (selectedTemplate.variables.length > 0 ? 0.1 : 0);
    
    // Log the enhanced response generation
    feedbackLogger.info('Generated enhanced response', { 
      category, 
      formality: selectedTemplate.formality,
      sentiment: selectedTemplate.sentiment,
      confidence: confidenceScore.toFixed(2)
    });
    
    return {
      suggestion: finalResponse,
      confidence: parseFloat(confidenceScore.toFixed(2)),
      category,
      tags,
      template: selectedTemplate.template,
      isAutomated: true
    };
  } catch (error) {
    feedbackLogger.error('Error generating enhanced response', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      feedbackId: feedback.id
    });
    
    // Fallback to a generic response
    return {
      suggestion: "Thank you for your feedback. Our team will review it and respond if necessary.",
      confidence: 0.2,
      category: 'general',
      tags: ['fallback'],
      isAutomated: true
    };
  }
}

/**
 * Generate multiple response alternatives with different tones and styles
 */
export function generateResponseAlternatives(feedback: UserFeedback): ResponseSuggestion[] {
  const category = categorizeFeedback(feedback);
  const templates = enhancedTemplates[category] || enhancedTemplates.general;
  const alternatives: ResponseSuggestion[] = [];
  
  // Generate an alternative from each available template
  templates.forEach((template, index) => {
    try {
      const response = fillTemplateVariables(template.template, feedback);
      alternatives.push({
        suggestion: response,
        confidence: 0.5 - (index * 0.1), // Decrease confidence for later alternatives
        category,
        tags: [template.formality, template.sentiment, `alternative-${index + 1}`],
        template: template.template,
        isAutomated: true
      });
    } catch (error) {
      // Skip failed templates
      feedbackLogger.warn('Failed to generate alternative response', {
        templateIndex: index,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  return alternatives.slice(0, 3); // Limit to 3 alternatives
}