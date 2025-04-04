/**
 * Eden's Hollow Game Scenes
 * Defines all scenes, choices, and narrative paths in the game
 */

import { Scene, GameState } from '../types';

/**
 * Collection of all game scenes
 */
export const gameScenes: Record<string, Scene> = {
  // Introduction Scene
  intro: {
    id: 'intro',
    title: 'The Road to Eden\'s Hollow',
    description: 
      'The carriage rattles beneath you as it traverses the uneven forest road. Dusk has fallen, painting the woods in hues of amber and shadow. You've come seeking answers about your missing sister, whose last letter mentioned this remote village—Eden's Hollow.\n\n' +
      'The driver hasn't spoken a word since you left the last outpost hours ago. Through the window, you notice strange markings carved into the trees, symbols you've never seen before. In the distance, a church bell tolls an uneven rhythm.',
    choices: [
      {
        id: 'ask_driver',
        text: 'Ask the driver about the strange tree markings',
        type: 'rational',
        nextSceneId: 'driver_conversation',
        available: true,
        sanityEffect: 0,
        corruptionEffect: 0
      },
      {
        id: 'stay_silent',
        text: 'Remain silent and watch the forest',
        type: 'rational',
        nextSceneId: 'arrive_village',
        available: true,
        sanityEffect: -5,
        corruptionEffect: 0
      },
      {
        id: 'examine_letter',
        text: 'Re-read your sister\'s letter',
        type: 'emotional',
        nextSceneId: 'read_letter',
        available: true,
        sanityEffect: 0,
        corruptionEffect: 0
      }
    ]
  },
  
  // Driver Conversation
  driver_conversation: {
    id: 'driver_conversation',
    title: 'A Reluctant Guide',
    description: 
      '"Those marks?" The driver speaks without turning, his voice like gravel. "Protection symbols. The Hollow folk believe they keep the forest's... inhabitants... at bay."\n\n' +
      'He falls silent for a moment, then adds, "Strange things happen in these woods after dark. I wouldn't linger outside the village if I were you."\n\n' +
      'As if to punctuate his warning, a distant howl echoes through the trees—too deep and resonant to belong to any wolf you've ever heard.',
    choices: [
      {
        id: 'ask_more',
        text: 'Ask what he means by "inhabitants"',
        type: 'rational',
        nextSceneId: 'driver_warning',
        available: true,
        sanityEffect: -5,
        corruptionEffect: 0
      },
      {
        id: 'change_subject',
        text: 'Ask about the village instead',
        type: 'rational',
        nextSceneId: 'driver_village_info',
        available: true,
        sanityEffect: 0,
        corruptionEffect: 0
      },
      {
        id: 'silence',
        text: 'Fall into uneasy silence',
        type: 'emotional',
        nextSceneId: 'arrive_village',
        available: true,
        sanityEffect: -5,
        corruptionEffect: 5
      }
    ]
  },
  
  // Driver Warning
  driver_warning: {
    id: 'driver_warning',
    title: 'Unsettling Revelations',
    description: 
      'The driver's knuckles whiten on the reins. "Some call them the Hollow Ones. Old as the forest itself. The village elders say they were once men, but..."\n\n' +
      'He shakes his head. "Listen. Don't venture outside after nightfall. Don't accept gifts. And whatever you hear calling your name at night—it's not who you think it is."\n\n' +
      'The carriage rounds a bend, and the first lights of Eden's Hollow come into view, nestled in a valley that seems unnaturally dark despite the late afternoon sun still lingering above.',
    choices: [
      {
        id: 'thank_driver',
        text: 'Thank him for the warning',
        type: 'rational',
        nextSceneId: 'arrive_village',
        available: true,
        sanityEffect: 5,
        corruptionEffect: 0,
        flag: 'warned_by_driver'
      },
      {
        id: 'dismiss_warning',
        text: 'Dismiss his superstitions',
        type: 'rational',
        nextSceneId: 'arrive_village',
        available: true,
        sanityEffect: 0,
        corruptionEffect: 10
      },
      {
        id: 'feel_watched',
        text: 'Feel like something in the forest is watching you',
        type: 'emotional',
        nextSceneId: 'arrive_village_unease',
        available: true,
        sanityEffect: -10,
        corruptionEffect: 5
      }
    ]
  },
  
  // Read Sister's Letter
  read_letter: {
    id: 'read_letter',
    title: 'Troubling Correspondence',
    description: 
      'You unfold the wrinkled letter, reading your sister's elegant handwriting by the fading light:\n\n' +
      '"Dearest,\n\nI've found something remarkable in Eden's Hollow. The villagers speak of ancient wisdom hidden in the surrounding hills—a power that could change everything. But there's something else here too. Something watching. The locals call it by many names, though never directly...\n\n' +
      'I'm staying at the Blackthorne Inn. If I'm not there when you arrive, ask for Father Mercer at the church. And whatever you do, don't trust—"\n\n' +
      'The letter ends abruptly, the final words torn away. A dark smudge stains the bottom of the page—you've never been certain if it's ink or blood.',
    choices: [
      {
        id: 'ponder_letter',
        text: 'Consider what could have happened to her',
        type: 'rational',
        nextSceneId: 'arrive_village',
        available: true,
        sanityEffect: -5,
        corruptionEffect: 0,
        flag: 'read_letter'
      },
      {
        id: 'worry_sister',
        text: 'Feel a deep sense of dread for your sister',
        type: 'emotional',
        nextSceneId: 'arrive_village',
        available: true,
        sanityEffect: -10,
        corruptionEffect: 0,
        flag: 'read_letter'
      },
      {
        id: 'rage_builds',
        text: 'Feel rage building toward whoever harmed her',
        type: 'desperate',
        nextSceneId: 'arrive_village_anger',
        available: true,
        sanityEffect: -5,
        corruptionEffect: 10,
        flag: 'read_letter'
      }
    ]
  },
  
  // Arrive at Village
  arrive_village: {
    id: 'arrive_village',
    title: 'The Hollow Awaits',
    description: 
      'Eden's Hollow emerges from the mist like a reluctant revelation. Stone cottages with thatched roofs cluster around a central square, where a dried-up fountain stands. Villagers pause to watch your carriage pass, their faces etched with wariness.\n\n' +
      'The driver stops before a weathered building with a sign depicting a blackened tree. "Blackthorne Inn," he announces flatly. "End of the line."\n\n' +
      'As you gather your belongings, you notice a church spire looming above the village, its bell now silent. To your right, a path leads away from the square toward what seems to be a marketplace. The daylight is fading rapidly.',
    choices: [
      {
        id: 'enter_inn',
        text: 'Enter the Blackthorne Inn immediately',
        type: 'rational',
        nextSceneId: 'blackthorne_inn',
        available: true,
        sanityEffect: 0,
        corruptionEffect: 0
      },
      {
        id: 'inquire_village',
        text: 'Ask a nearby villager about your sister',
        type: 'rational',
        nextSceneId: 'villager_conversation',
        available: true,
        sanityEffect: 0,
        corruptionEffect: 0
      },
      {
        id: 'visit_church',
        text: 'Head directly to the church to find Father Mercer',
        type: 'rational',
        nextSceneId: 'church_exterior',
        available: true,
        sanityEffect: 0,
        corruptionEffect: 0
      }
    ]
  },
  
  // Arrive with Unease
  arrive_village_unease: {
    id: 'arrive_village_unease',
    title: 'Shadows of Arrival',
    description: 
      'The carriage enters Eden's Hollow, but you can't shake the feeling of being followed. Every shadow among the trees seems to shift with purpose, and when you turn to look, shapes dart just beyond your field of vision.\n\n' +
      'The village itself sits unnaturally still in the valley. Faces peer from windows, quickly retreating when you meet their gaze. The driver stops at an old inn with a blackened tree on its sign, the wood carved with the same strange symbols you saw in the forest.\n\n' +
      '"Blackthorne Inn," the driver mutters. "I leave at first light tomorrow. If you've any sense, you'll be on that carriage with me."',
    choices: [
      {
        id: 'enter_inn_quickly',
        text: 'Hurry inside the inn without looking back',
        type: 'emotional',
        nextSceneId: 'blackthorne_inn',
        available: true,
        sanityEffect: -5,
        corruptionEffect: 0
      },
      {
        id: 'scan_surroundings',
        text: 'Carefully scan your surroundings before entering',
        type: 'rational',
        nextSceneId: 'notice_watcher',
        available: true,
        sanityEffect: -10,
        corruptionEffect: 5
      },
      {
        id: 'confront_feeling',
        text: 'Turn and stare directly into the forest, challenging whatever watches',
        type: 'desperate',
        nextSceneId: 'forest_call',
        available: true,
        sanityEffect: -15,
        corruptionEffect: 15,
        requiresConfirmation: true,
        confirmationText: "Something urges you to look deep into the forest. The feeling is unnatural—almost like an invasion of your thoughts. Are you certain you wish to answer this compulsion?"
      }
    ]
  },
  
  // Arrive with Anger
  arrive_village_anger: {
    id: 'arrive_village_anger',
    title: 'Bitter Arrival',
    description: 
      'The carriage rolls into Eden's Hollow as your mind burns with thoughts of retribution. If someone in this village harmed your sister, they will pay dearly. The picturesque setting feels like a facade—something rotten lurks beneath the quaint exterior.\n\n' +
      'Villagers scatter as your carriage approaches, as if sensing your dark mood. The driver pulls up to a weathered inn with a blackened tree on its sign.\n\n' +
      '"Blackthorne Inn," he announces, not meeting your eye. "Your sister stayed here, didn't she? Strange business, that. Very strange."',
    choices: [
      {
        id: 'question_driver_sharply',
        text: 'Demand what he knows about your sister',
        type: 'desperate',
        nextSceneId: 'driver_defensive',
        available: true,
        sanityEffect: -5,
        corruptionEffect: 5
      },
      {
        id: 'enter_inn_determined',
        text: 'Enter the inn with determined purpose',
        type: 'rational',
        nextSceneId: 'blackthorne_inn_hostile',
        available: true,
        sanityEffect: 0,
        corruptionEffect: 5
      },
      {
        id: 'observe_village',
        text: 'Survey the village for anything suspicious',
        type: 'rational',
        nextSceneId: 'notice_rituals',
        available: true,
        sanityEffect: -5,
        corruptionEffect: 0
      }
    ]
  },
  
  // Driver Defensive
  driver_defensive: {
    id: 'driver_defensive',
    title: 'Guarded Answers',
    description: 
      'The driver recoils at your aggressive questioning. "Easy now! I only carried her up like I did you. She was asking questions all over—about the old ruins in the hills, about village traditions. Folks don't like outsiders prying."\n\n' +
      'He glances nervously at the gathering dusk. "Some say she went up to the old stone circle during the new moon. Nobody goes there, especially then. Not if they want to come back...unchanged."\n\n' +
      'Without another word, he throws your bag down and flicks the reins, eager to stable his horses before full dark.',
    choices: [
      {
        id: 'enter_inn_troubled',
        text: 'Enter the inn with newfound concern',
        type: 'emotional',
        nextSceneId: 'blackthorne_inn',
        available: true,
        sanityEffect: -5,
        corruptionEffect: 0,
        flag: 'knows_about_stone_circle'
      },
      {
        id: 'follow_driver',
        text: 'Follow the driver to learn more',
        type: 'desperate',
        nextSceneId: 'stables_conversation',
        available: true,
        sanityEffect: -5,
        corruptionEffect: 5
      },
      {
        id: 'seek_stone_circle',
        text: 'Ask a local where to find the stone circle',
        type: 'corrupted',
        nextSceneId: 'suspicious_directions',
        available: true,
        sanityEffect: -10,
        corruptionEffect: 15,
        requiresConfirmation: true,
        confirmationText: "Even contemplating a visit to the stone circle fills you with inexplicable dread. The mere thought of it seems to attract dark whispers at the edge of your hearing. Are you sure you want to pursue this?"
      }
    ]
  },
  
  // Blackthorne Inn
  blackthorne_inn: {
    id: 'blackthorne_inn',
    title: 'A Strange Welcome',
    description: 
      'The interior of the Blackthorne Inn is warm but oddly quiet. A fire crackles in the hearth, casting long shadows across the common room. A few patrons sit at scattered tables, falling silent as you enter.\n\n' +
      'Behind the worn oak counter, a heavy-set man with a peculiar star-shaped scar on his cheek watches your approach. "Haven't had many travelers lately," he says, his voice surprisingly gentle for his imposing stature. "What brings you to our little hollow?"\n\n' +
      'Before you can answer, your attention is drawn to a small shrine in the corner—a wooden carving of a tree surrounded by candles. The same symbol you saw on the trees along the road.',
    choices: [
      {
        id: 'ask_about_sister',
        text: 'Ask directly about your sister',
        type: 'rational',
        nextSceneId: 'innkeeper_evasive',
        available: true,
        sanityEffect: 0,
        corruptionEffect: 0
      },
      {
        id: 'request_room',
        text: 'Request a room and be discreet',
        type: 'rational',
        nextSceneId: 'room_assignment',
        available: true,
        sanityEffect: 0,
        corruptionEffect: 0
      },
      {
        id: 'inquire_shrine',
        text: 'Ask about the strange shrine',
        type: 'rational',
        nextSceneId: 'innkeeper_explains_shrine',
        available: true,
        sanityEffect: -5,
        corruptionEffect: 5
      }
    ]
  },
  
  // And many more scenes would follow here...
  
  // Example of an ending scene
  forest_end: {
    id: 'forest_end',
    title: 'The Hollow Claims Another',
    description: 
      'The forest envelops you completely. The path behind has vanished, and the trees cluster so tightly that the sky is only a memory of light. Yet some terrible understanding has dawned within you.\n\n' +
      'You now know what happened to your sister. You understand what the villagers fear. And most of all, you recognize that you've ventured too far to ever return to what you once were.\n\n' +
      'As your sanity fractures, you hear them approaching—the Hollow Ones, coming to welcome their newest member. Your transformation has begun, and soon, you too will call out to lost travelers from the shadows between the trees.',
    isEnding: true,
    endType: 'defeat',
    choices: [] // No choices in an ending
  },
  
  // Another example ending
  sister_rescue: {
    id: 'sister_rescue',
    title: 'Escaping The Hollow',
    description: 
      'Dawn breaks as you flee Eden's Hollow, your sister's weak form leaning against you in the stolen cart. Though her eyes hold shadows that may never fully recede, she's alive—saved from the ritual that would have completed her transformation.\n\n' +
      'Behind you, the village elders' curses fade, but their warning lingers: "The Hollow Ones are patient. They've marked you both. Distance won't save you."\n\n' +
      'Perhaps they're right. Sometimes you catch your sister staring at nothing, whispering words in a language you don't recognize. And in quiet moments, you still hear the call of the forest—a soft, seductive promise of power in exchange for your humanity. But for now, at least, you've escaped with what matters most.',
    isEnding: true,
    endType: 'victory',
    choices: [] // No choices in an ending
  }
};