import { Story, StoryPhase } from "../types";

// The main story collection
const stories: Story[] = [
  {
    id: "the-abandoned-manor",
    title: "THE ABANDONED MANOR",
    startPassageId: "manor-intro",
    passages: {
      "manor-intro": {
        id: "manor-intro",
        title: "THE ABANDONED MANOR",
        content: [
          "The rain beats down upon the rusted gates of Blackthorn Manor. Lightning illuminates the decrepit Gothic architecture – a silhouette of jagged spires against the thunderous sky.",
          "You've come seeking answers about your grandfather's mysterious death. The letter in your pocket feels heavy, its weathered edges carrying secrets you've yet to decipher.",
          "The rain grows heavier as you approach the entrance. A strange sensation washes over you – the unmistakable feeling of being watched."
        ],
        choices: [
          {
            id: "front-door",
            text: "Approach the front door and knock firmly.",
            sanityChange: -5,
            nextPassageId: "manor-front-door"
          },
          {
            id: "find-another-way",
            text: "Look for another way in, perhaps through a broken window or servant's entrance.",
            sanityChange: -10,
            nextPassageId: "manor-alternate-entrance"
          },
          {
            id: "listen-whispers",
            text: "Listen for whispers in the wind before deciding.",
            sanityChange: 5,
            requiredSanity: 90,
            nextPassageId: "manor-whispers"
          }
        ],
        phase: "introduction"
      },
      "manor-front-door": {
        id: "manor-front-door",
        content: [
          "Your knuckles rap against the ancient wood, echoing through what must be a vast entrance hall beyond. The sound seems to disturb something; a rustling of movement from within.",
          "Moments pass. Just as you raise your hand to knock again, the door creaks open by itself, revealing an inch of impenetrable darkness.",
          "No one greets you. No voice calls out. Only a chill draft escapes from inside, carrying the faint scent of decay and something else... something chemical."
        ],
        choices: [
          {
            id: "enter-manor",
            text: "Step inside and announce your presence.",
            sanityChange: -5,
            nextPassageId: "manor-entrance-hall"
          },
          {
            id: "call-out",
            text: "Remain outside and call out for anyone inside.",
            sanityChange: 0,
            nextPassageId: "manor-call-out"
          },
          {
            id: "force-door",
            text: "Push the door open forcefully, ready for anything.",
            sanityChange: -15,
            nextPassageId: "manor-force-door",
            critical: true
          }
        ],
        phase: "introduction"
      },
      "manor-alternate-entrance": {
        id: "manor-alternate-entrance",
        content: [
          "You circle the manor, rain soaking through your clothes. The building looms above you, windows like vacant eyes tracking your movement.",
          "Around the east wing, you discover a cellar door, partially hidden by overgrown ivy. It's secured with a rusted padlock that looks brittle with age.",
          "Through a nearby broken window, you catch a glimpse of what appears to be a kitchen – long abandoned, with toppled furniture and scattered implements."
        ],
        choices: [
          {
            id: "break-padlock",
            text: "Break the padlock on the cellar door.",
            sanityChange: -10,
            nextPassageId: "manor-cellar"
          },
          {
            id: "climb-window",
            text: "Carefully climb through the broken kitchen window.",
            sanityChange: -5,
            nextPassageId: "manor-kitchen"
          },
          {
            id: "return-front",
            text: "Return to the front door after all.",
            sanityChange: 0,
            nextPassageId: "manor-front-door"
          }
        ],
        phase: "introduction"
      },
      "manor-whispers": {
        id: "manor-whispers",
        content: [
          "You close your eyes, allowing your senses to extend beyond the patter of rain. At first, there's nothing but the storm's rhythm and distant thunder.",
          "Then – almost imperceptibly – voices seem to ride the wind. Not words exactly, but impressions: *danger below... not the door... window sees all...*",
          "A sudden clarity washes over you. The manor isn't just a house; it's awake somehow, and different paths through it hold different fates."
        ],
        choices: [
          {
            id: "heed-warning",
            text: "Heed the warning and seek entry through the upper floor.",
            sanityChange: 5,
            nextPassageId: "manor-upper-floor"
          },
          {
            id: "ignore-whispers",
            text: "Dismiss these thoughts as nerves and approach the front door.",
            sanityChange: -10,
            nextPassageId: "manor-front-door"
          },
          {
            id: "flee-manor",
            text: "The whispers disturb you deeply. Leave this place immediately.",
            sanityChange: -20,
            nextPassageId: "manor-flee-early",
            critical: true
          }
        ],
        phase: "introduction"
      },
      "manor-entrance-hall": {
        id: "manor-entrance-hall",
        content: [
          "The entrance hall unfolds before you – a grand space of faded opulence. Dust-covered chandeliers hang from a vaulted ceiling, and twin staircases curve to the upper floor.",
          "Your footsteps echo against marble floors, each sound seeming to awaken the house further. Portraits line the walls, their eyes following your movement with uncanny precision.",
          "A soft click behind you – the front door has closed itself. When you try the handle, it won't budge. You are now committed to whatever secrets this place holds."
        ],
        choices: [
          {
            id: "explore-ground",
            text: "Explore the ground floor rooms.",
            sanityChange: -5,
            nextPassageId: "manor-ground-floor"
          },
          {
            id: "climb-stairs",
            text: "Climb the grand staircase to the upper floor.",
            sanityChange: -10,
            nextPassageId: "manor-upper-main"
          },
          {
            id: "examine-portraits",
            text: "Examine the ancestral portraits more closely.",
            sanityChange: -15,
            requiredSanity: 70,
            nextPassageId: "manor-portraits"
          }
        ],
        phase: "descent"
      },
      // More passages would continue here, creating a complete story with multiple branches
    }
  },
  {
    id: "the-forgotten-lighthouse",
    title: "THE FORGOTTEN LIGHTHOUSE",
    startPassageId: "lighthouse-intro",
    passages: {
      "lighthouse-intro": {
        id: "lighthouse-intro",
        title: "THE FORGOTTEN LIGHTHOUSE",
        content: [
          "The narrow coastal road ends abruptly at a cliff edge. Salt spray mists the air as waves crash violently against jagged rocks below.",
          "Before you stands the Morrow Point Lighthouse – a solitary stone tower that hasn't guided ships for decades. Its beacon remains dark, yet locals speak of lights sometimes seen from within.",
          "You've traveled here following coordinates found in your late father's research journal. Whatever he discovered about this place, it drove him to madness in his final days."
        ],
        choices: [
          {
            id: "enter-lighthouse",
            text: "Approach and enter the lighthouse.",
            sanityChange: -5,
            nextPassageId: "lighthouse-entrance"
          },
          {
            id: "circle-exterior",
            text: "Circle the exterior to inspect the structure first.",
            sanityChange: 0,
            nextPassageId: "lighthouse-exterior"
          },
          {
            id: "check-journal",
            text: "Consult your father's journal for specific guidance.",
            sanityChange: -5,
            requiredSanity: 85,
            nextPassageId: "lighthouse-journal"
          }
        ],
        phase: "introduction"
      },
      // Additional passages would be defined here
    }
  },
  // Three more stories would be defined here to complete the five interconnected stories
];

export const getStory = (storyId: string): Story | undefined => {
  return stories.find(story => story.id === storyId);
};

export const getInitialStory = (): Story => {
  return stories[0];
};

export default stories;
