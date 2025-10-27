/**
 * Theme Categories for the Horror Fiction Platform
 * 
 * This file defines all available theme categories for stories along with their icons
 * and specific mappings from story keywords to themes.
 */

// Theme categories with their respective icons
export const THEME_CATEGORIES = {
  // Base and special cases
  HORROR: { label: "Horror", icon: "eye" },
  DEATH: { label: "Death", icon: "skull" },
  SUICIDE: { label: "Suicide", icon: "skull" },

  // Exact list requested with refined labels and valid icon slugs
  COSMIC: { label: "Cosmic Horror", icon: "moon" },
  EXISTENTIAL: { label: "Existential Horror", icon: "hourglass" },
  PSYCHOLOGICAL: { label: "Psychological Horror", icon: "brain" },
  SUPERNATURAL: { label: "Supernatural Horror", icon: "ghost" },
  BODY_HORROR: { label: "Body Horror", icon: "bone" },
  FOLK_HORROR: { label: "Folk Horror", icon: "trees" },
  GOTHIC: { label: "Gothic Horror", icon: "castle" },
  VEHICULAR: { label: "Vehicular Horror", icon: "car" },
  SLASHER: { label: "Slasher", icon: "knife" }, // mapped to ForkKnife in UI
  PARASITE: { label: "Parasite", icon: "bug" },
  INFESTATION_HORROR: { label: "Infestation Horror", icon: "bug" },
  CANNIBALISM: { label: "Cannibalism", icon: "fork-knife" },
  DOPPELGANGER: { label: "Doppelgänger", icon: "user-plus" },
  IDENTITY_HORROR: { label: "Identity Horror", icon: "eye" },
  STALKING: { label: "Stalking", icon: "footprints" },
  DREAM_NIGHTMARE: { label: "Dream/Nightmare", icon: "moon-star" },
  PARANORMAL_HORROR: { label: "Paranormal Horror", icon: "radio" },
  CURSED_OBJECT: { label: "Cursed Object", icon: "box" },
  TIME_HORROR: { label: "Time Horror", icon: "clock" },
  TECHNOLOGICAL: { label: "Technological Horror", icon: "cpu" },
  SCIENCE_HORROR: { label: "Science Horror", icon: "flask" }, // mapped to FlaskConical in UI
  APOCALYPTIC: { label: "Apocalyptic/Post-Apocalyptic Horror", icon: "radiation" },
  URBAN_HORROR: { label: "Urban Horror", icon: "building" },
  ECO_HORROR: { label: "Eco Horror", icon: "trees" },
  CREATURE_HORROR: { label: "Creature Horror", icon: "cat" },
  OCCULT: { label: "Occult", icon: "moon-star" },
  DEMONIC_HORROR: { label: "Demonic Horror", icon: "flame" },
  VAMPIRIC_HORROR: { label: "Vampiric Horror", icon: "moon" },
  LYCANTHROPIC_HORROR: { label: "Lycanthropic Horror", icon: "dog" },
  UNDEAD_HORROR: { label: "Undead Horror", icon: "footprints" },
  HAUNTING: { label: "Haunting", icon: "ghost" },
  ISOLATION_HORROR: { label: "Isolation Horror", icon: "cloud" },
  SURVIVAL_HORROR: { label: "Survival Horror", icon: "alert-triangle" },
  CONTAGION: { label: "Contagion", icon: "radio" },

  // Legacy keys kept for compatibility (map to refined labels)
  PSYCHOPATH: { label: "Slasher", icon: "knife" },
  UNCANNY: { label: "Uncanny", icon: "eye" },
  ELEMENTAL: { label: "Eco Horror", icon: "trees" },
  AQUATIC: { label: "Eco Horror", icon: "droplets" },
  RITUAL: { label: "Occult", icon: "moon-star" },
  MEDICAL: { label: "Science Horror", icon: "flask" },
  IDENTITY: { label: "Identity Horror", icon: "eye" },
  INFERNAL: { label: "Demonic Horror", icon: "flame" },
  MONSTER: { label: "Creature Horror", icon: "cat" },
  ZOMBIE: { label: "Undead Horror", icon: "footprints" },
  VAMPIRE: { label: "Vampiric Horror", icon: "moon" },
  WEREWOLF: { label: "Lycanthropic Horror", icon: "dog" },
  PARANORMAL: { label: "Paranormal Horror", icon: "radio" },
  DREAM_HORROR: { label: "Dream/Nightmare", icon: "moon-star" },
  DEMONIC: { label: "Demonic Horror", icon: "flame" },
  DYSTOPIAN: { label: "Urban Horror", icon: "building" },
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