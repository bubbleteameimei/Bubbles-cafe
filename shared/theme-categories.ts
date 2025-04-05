/**
 * Theme Categories for the Horror Fiction Platform
 * 
 * This file defines all available theme categories for stories along with their icons
 * and specific mappings from story keywords to themes.
 */

// Theme categories with their respective icons
export const THEME_CATEGORIES = {
  DEATH: { 
    label: "Death",
    icon: "skull" 
  },
  BODY_HORROR: { 
    label: "Body Horror",
    icon: "scissors" 
  },
  SUPERNATURAL: { 
    label: "Supernatural",
    icon: "ghost" 
  },
  PSYCHOLOGICAL: { 
    label: "Psychological",
    icon: "brain" 
  },
  EXISTENTIAL: { 
    label: "Existential",
    icon: "hourglass" 
  },
  HORROR: { 
    label: "Horror",
    icon: "eye" 
  },
  STALKING: { 
    label: "Stalking",
    icon: "footprints" 
  },
  CANNIBALISM: { 
    label: "Cannibalism",
    icon: "utensils" 
  },
  PSYCHOPATH: { 
    label: "Psychopath",
    icon: "axe" 
  },
  DOPPELGANGER: { 
    label: "Doppelgänger",
    icon: "user-plus" 
  },
  VEHICULAR: { 
    label: "Vehicular",
    icon: "car" 
  },
  PARASITE: { 
    label: "Parasite",
    icon: "bug" 
  },
  TECHNOLOGICAL: { 
    label: "Technological",
    icon: "cpu" 
  },
  COSMIC: { 
    label: "Cosmic/Lovecraftian",
    icon: "alien" 
  },
  UNCANNY: { 
    label: "Uncanny",
    icon: "doll" 
  },
  ELEMENTAL: {
    label: "Elemental",
    icon: "cloud"
  },
  AQUATIC: {
    label: "Aquatic",
    icon: "droplets"
  },
  RITUAL: {
    label: "Ritual",
    icon: "sparkles"
  },
  MEDICAL: {
    label: "Medical",
    icon: "syringe"
  },
  HAUNTING: {
    label: "Haunting",
    icon: "wind"
  },
  IDENTITY: {
    label: "Identity",
    icon: "scanface"
  },
  OCCULT: {
    label: "Occult",
    icon: "tally4"
  },
  PASSION: {
    label: "Passion",
    icon: "heart"
  },
  INFERNAL: {
    label: "Infernal",
    icon: "flame"
  }
};

// Mapping from specific story titles/keywords to themes
export const STORY_THEME_MAPPING = {
  "BLEACH": "DEATH",
  "JOURNAL": "BODY_HORROR",
  "WORD": "SUPERNATURAL",
  "SONG": "PSYCHOLOGICAL",
  "NOSTALGIA": "EXISTENTIAL",
  "THERAPIST": "PSYCHOLOGICAL",
  "DOLL": "UNCANNY",
  "RAIN": "HORROR",
  "CHASE": "STALKING",
  "COOKBOOK": "CANNIBALISM",
  "CAR": "PSYCHOPATH",
  "MIRROR": "DOPPELGANGER",
  "DRIVE": "VEHICULAR", 
  "BUG": "PARASITE",
  "MACHINE": "TECHNOLOGICAL",
  "CAVE": "COSMIC"
};

/**
 * Helper function to determine the appropriate theme category based on post content
 * This is used during WordPress sync and post creation.
 */
export function determineThemeCategory(title: string, content?: string): string {
  // Convert title to uppercase for comparison with keys
  const uppercaseTitle = title.toUpperCase().trim();
  
  // First, check for direct matches in the mapping based on the title
  for (const [keyword, theme] of Object.entries(STORY_THEME_MAPPING)) {
    if (uppercaseTitle.includes(keyword)) {
      return theme;
    }
  }
  
  // If no theme was determined from the title, do content analysis if content is available
  if (content) {
    const uppercaseContent = content.toUpperCase();
    
    // Look for keywords in content that might indicate themes
    if (uppercaseContent.includes("DEATH") || uppercaseContent.includes("SUICIDE") || uppercaseContent.includes("KILLED")) {
      return "DEATH";
    } else if (uppercaseContent.includes("FLESH") || uppercaseContent.includes("TRANSFORM") || uppercaseContent.includes("MUTATION")) {
      return "BODY_HORROR";
    } else if (uppercaseContent.includes("GHOST") || uppercaseContent.includes("SPIRIT") || uppercaseContent.includes("DEMON")) {
      return "SUPERNATURAL";
    } else if (uppercaseContent.includes("MIND") || uppercaseContent.includes("DREAM") || uppercaseContent.includes("DELUSION")) {
      return "PSYCHOLOGICAL";
    } else if (uppercaseContent.includes("TIME") || uppercaseContent.includes("MEANING") || uppercaseContent.includes("EXISTENCE")) {
      return "EXISTENTIAL";
    }
  }
  
  // Default theme if no specific one could be determined
  return "HORROR";
}