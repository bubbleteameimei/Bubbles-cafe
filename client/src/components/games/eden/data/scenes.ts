import { SceneData } from '../types';

export const gameScenes: Record<string, SceneData> = {
  // Introduction Scene
  intro: {
    id: 'intro',
    text: [
      "The ancient texts spoke of Eden's Hollow - a realm caught between the living and the dead, where forgotten gods whispered secrets to those brave enough to listen.",
      "Many sought its treasures. Few returned with their sanity intact.",
      "You find yourself at the edge of a mist-shrouded forest, drawn by dreams that have haunted you for months. The full moon hangs unnaturally large in the night sky, casting an eerie blue glow across the twisted landscape.",
      "A chill runs down your spine as you realize the dreams were not mere fantasies. Eden's Hollow is real, and its darkness calls to you."
    ],
    choices: [
      {
        text: "Step into the mist and begin your journey",
        nextScene: "forest_entrance"
      },
      {
        text: "Examine the strange runes carved into a nearby stone",
        nextScene: "intro_runes"
      }
    ],
    triggers: []
  },
  
  // Rune Examination
  intro_runes: {
    id: 'intro_runes',
    text: [
      "You approach the ancient stone monolith standing at the forest's edge. Its surface is covered in strange symbols that seem to shift and change as you look at them.",
      "As your fingers trace the cold surface, the runes begin to glow with a subtle blue light. Ancient knowledge flows into your mind - fragments of a forgotten language."
    ],
    choices: [
      {
        text: "Continue examining the runes",
        nextScene: "intro_runes_puzzle"
      },
      {
        text: "Step away and enter the forest",
        nextScene: "forest_entrance"
      }
    ],
    triggers: []
  },
  
  // Rune Puzzle
  intro_runes_puzzle: {
    id: 'intro_runes_puzzle',
    text: [
      "The runes pulse brighter as you focus on them. You sense there's a pattern here - a message left by someone... or something.",
      "If you could decipher the correct sequence, perhaps you might gain insight into what awaits in Eden's Hollow."
    ],
    choices: [
      {
        text: "Return to the forest entrance",
        nextScene: "forest_entrance"
      }
    ],
    triggers: [
      {
        type: "puzzle",
        data: {
          puzzleId: "ancient_runes"
        }
      }
    ]
  },
  
  // Forest Entrance
  forest_entrance: {
    id: 'forest_entrance',
    text: [
      "The twisted trees of Mistwood Forest loom before you, their branches reaching like skeletal fingers against the night sky. Mist swirls around your ankles, eerily warm compared to the chill air.",
      "Strange sounds echo from deep within - not quite animal, not quite human. The path ahead splits three ways: a worn trail leading deeper into the woods, a narrow path climbing uphill, and an overgrown route descending into a ravine."
    ],
    choices: [
      {
        text: "Follow the main path deeper into the woods",
        nextScene: "deep_forest"
      },
      {
        text: "Take the uphill path",
        nextScene: "forest_hilltop"
      },
      {
        text: "Descend into the ravine",
        nextScene: "forest_ravine"
      }
    ],
    triggers: []
  },
  
  // Deep Forest
  deep_forest: {
    id: 'deep_forest',
    text: [
      "The forest grows denser as you proceed. Twisted roots threaten to trip you with every step, and the canopy above blocks out most of the moonlight.",
      "You hear soft whispers on the edge of perception - voices speaking in a language you almost understand. They seem to be coming from all directions.",
      "Ahead, you spot a faint, pulsing blue light between the trees."
    ],
    choices: [
      {
        text: "Approach the mysterious light",
        nextScene: "forest_shrine"
      },
      {
        text: "Listen carefully to the whispers",
        nextScene: "forest_whispers"
      },
      {
        text: "Return to the forest entrance",
        nextScene: "forest_entrance"
      }
    ],
    triggers: []
  },
  
  // Forest Hilltop
  forest_hilltop: {
    id: 'forest_hilltop',
    text: [
      "The path winds steeply upward, carrying you above the mist. At the hill's summit, you find yourself standing on a rocky outcrop with a view of the entire valley.",
      "Below, the forest stretches out like a dark sea. In the distance, you can make out the silhouette of a massive castle perched atop a cliff, its towers jutting into the night sky like spears.",
      "Closer, nestled in a clearing, lies what appears to be a small village - though no lights shine from its windows."
    ],
    choices: [
      {
        text: "Make your way toward the castle",
        nextScene: "path_to_castle"
      },
      {
        text: "Head down toward the village",
        nextScene: "path_to_village"
      },
      {
        text: "Return to the forest entrance",
        nextScene: "forest_entrance"
      }
    ],
    triggers: []
  },
  
  // Forest Ravine
  forest_ravine: {
    id: 'forest_ravine',
    text: [
      "The path descends sharply into a mist-filled ravine. The temperature drops with each step, until your breath forms white clouds before you.",
      "At the bottom, a small stream flows with water so clear it seems almost invisible. The only indication of its presence is the soft gurgling sound and the way the moonlight reflects off its surface.",
      "On the far bank, partially hidden by stone and root, you notice the entrance to what appears to be an ancient crypt."
    ],
    choices: [
      {
        text: "Investigate the crypt entrance",
        nextScene: "dungeon_entrance"
      },
      {
        text: "Drink from the crystal-clear stream",
        nextScene: "forest_ravine_drink"
      },
      {
        text: "Climb back up to the forest entrance",
        nextScene: "forest_entrance"
      }
    ],
    triggers: []
  },
  
  // Forest Shrine
  forest_shrine: {
    id: 'forest_shrine',
    text: [
      "You approach the source of the blue light - a small clearing where stands a weathered stone shrine. The light emanates from a series of runes etched into its surface, similar to those you saw at the forest's edge.",
      "The shrine appears to be a place of offering. A shallow bowl sits atop it, and ancient carvings depict figures leaving items within a similar vessel.",
      "Something about this place feels significant - a nexus of power within Eden's Hollow."
    ],
    choices: [
      {
        text: "Leave an offering at the shrine",
        nextScene: "forest_shrine_offering"
      },
      {
        text: "Examine the runes more closely",
        nextScene: "forest_shrine_runes"
      },
      {
        text: "Return to the deeper forest",
        nextScene: "deep_forest"
      }
    ],
    triggers: []
  },
  
  // Forest Whispers
  forest_whispers: {
    id: 'forest_whispers',
    text: [
      "You close your eyes and focus on the whispers surrounding you. Gradually, the sounds begin to coalesce into something almost comprehensible.",
      "\"...the binding requires blood... castle holds the key... beware the one who smiles... ritual must be completed when the moon reaches its apex...\"",
      "As you listen, you feel a presence drawing near - something attracted by your attention to the voices."
    ],
    choices: [
      {
        text: "Open your eyes and look around",
        nextScene: "forest_spirit_encounter"
      },
      {
        text: "Continue listening, trying to understand more",
        nextScene: "forest_whispers_deeper"
      },
      {
        text: "Retreat back toward the deeper forest",
        nextScene: "deep_forest"
      }
    ],
    triggers: []
  },
  
  // Path to Castle
  path_to_castle: {
    id: 'path_to_castle',
    text: [
      "You descend from the hilltop and follow a winding path that seems to lead toward the distant castle. The forest gradually thins as you travel, replaced by rocky terrain and sparse, twisted vegetation.",
      "After some time, you reach the edge of a vast chasm that separates you from the castle cliff. A single stone bridge spans the gulf - ancient but seemingly intact.",
      "Looking down into the chasm, you see only darkness, so deep that it appears to swallow the moonlight itself."
    ],
    choices: [
      {
        text: "Cross the bridge toward the castle",
        nextScene: "castle_bridge"
      },
      {
        text: "Look for another way across",
        nextScene: "castle_chasm_descent"
      },
      {
        text: "Return to the forest hilltop",
        nextScene: "forest_hilltop"
      }
    ],
    triggers: []
  },
  
  // Path to Village
  path_to_village: {
    id: 'path_to_village',
    text: [
      "The path down from the hilltop winds through progressively less dense forest until you emerge at the edge of a clearing. There stands the village you spotted from above.",
      "The buildings are constructed of dark wood and stone, their design ancient and strange. No lights shine from windows, and no smoke rises from chimneys despite the chill night air.",
      "The village square lies ahead, dominated by a large well at its center. The silence is absolute - not even insects chirp in this place."
    ],
    choices: [
      {
        text: "Enter the village square",
        nextScene: "village_square"
      },
      {
        text: "Circle around the village perimeter",
        nextScene: "village_outskirts"
      },
      {
        text: "Return to the forest hilltop",
        nextScene: "forest_hilltop"
      }
    ],
    triggers: []
  },
  
  // Dungeon Entrance
  dungeon_entrance: {
    id: 'dungeon_entrance',
    text: [
      "The crypt entrance is a dark archway carved directly into the ravine wall, framed by weathered stone columns. Ancient symbols adorn the lintel, similar to the runes you've seen elsewhere but more elaborate.",
      "A cold breeze emanates from the darkness within, carrying the scent of old stone and something else - a metallic tang that might be blood.",
      "Stone steps descend into shadow, their edges worn smooth by the passage of countless feet over centuries."
    ],
    choices: [
      {
        text: "Enter the crypt",
        nextScene: "dungeon_stairs"
      },
      {
        text: "Inspect the carvings around the entrance",
        nextScene: "dungeon_entrance_carvings"
      },
      {
        text: "Return to the ravine",
        nextScene: "forest_ravine"
      }
    ],
    triggers: []
  },

  // Castle Bridge
  castle_bridge: {
    id: 'castle_bridge',
    text: [
      "The stone bridge is wider than it appeared from a distance, easily allowing four people to walk abreast. Its surface is worn but sturdy, with elaborate carvings along the railings depicting scenes of ancient battles and rituals.",
      "As you cross, the wind picks up, carrying whispers that seem to emanate from the chasm below. The castle looms larger with each step - a massive structure of black stone that seems to absorb the moonlight rather than reflect it.",
      "Halfway across, you notice a figure standing at the far end of the bridge - motionless, watching your approach."
    ],
    choices: [
      {
        text: "Continue forward to meet the figure",
        nextScene: "castle_guardian"
      },
      {
        text: "Call out to the figure",
        nextScene: "castle_guardian_call"
      },
      {
        text: "Turn back toward the forest",
        nextScene: "path_to_castle"
      }
    ],
    triggers: []
  },

  // Village Square
  village_square: {
    id: 'village_square',
    text: [
      "The village square is paved with irregular stones, between which grow patches of pale, luminescent moss. Buildings surround the square - what might once have been shops, homes, and a small temple.",
      "The well at the center is a circular stone structure about waist-high. Peering over its edge reveals no water below - only darkness. A rusted chain extends down into the shadows.",
      "Though you've seen no signs of current inhabitants, you can't shake the feeling of being watched from the darkened windows around you."
    ],
    choices: [
      {
        text: "Investigate the well more closely",
        nextScene: "village_well"
      },
      {
        text: "Enter the abandoned temple",
        nextScene: "village_temple"
      },
      {
        text: "Explore one of the houses",
        nextScene: "village_house"
      }
    ],
    triggers: []
  },

  // Dungeon Stairs
  dungeon_stairs: {
    id: 'dungeon_stairs',
    text: [
      "The stairs descend in a tight spiral into the earth. The walls are close on either side, decorated with bas-reliefs depicting robed figures engaged in some kind of ritual.",
      "As you descend, the temperature continues to drop until your breath forms clouds before you. The only light comes from patches of luminescent fungi clinging to the walls, casting everything in a pale blue glow.",
      "After what seems like dozens of rotations, the stairs finally open into a large underground chamber. The room is roughly circular, with several archways leading off in different directions."
    ],
    choices: [
      {
        text: "Examine the central chamber",
        nextScene: "dungeon_chamber"
      },
      {
        text: "Take the left passage",
        nextScene: "dungeon_left_passage"
      },
      {
        text: "Take the right passage",
        nextScene: "dungeon_right_passage"
      }
    ],
    triggers: []
  },

  // Village Well
  village_well: {
    id: 'village_well',
    text: [
      "You approach the well and place your hands on its cold stone rim. Up close, you can see that the stonework is carved with small symbols similar to those you've encountered elsewhere in Eden's Hollow.",
      "The chain disappearing into the darkness is attached to a rusted winch mechanism. Despite its age, the mechanism seems functional.",
      "From deep within the well, you hear a faint, rhythmic sound - like the slow beating of an enormous heart."
    ],
    choices: [
      {
        text: "Turn the winch to raise whatever is attached to the chain",
        nextScene: "village_well_chain"
      },
      {
        text: "Drop a small stone into the well to gauge its depth",
        nextScene: "village_well_stone"
      },
      {
        text: "Return to the village square",
        nextScene: "village_square"
      }
    ],
    triggers: []
  },

  // Dungeon Chamber
  dungeon_chamber: {
    id: 'dungeon_chamber',
    text: [
      "The central chamber is dominated by a large stone altar in its center. The altar's surface is stained dark with what you suspect is centuries of dried blood.",
      "Around the chamber's perimeter stand seven stone statues, each depicting a robed figure with its face concealed by a hood. Their hands are outstretched toward the altar in a gesture that might be offering or supplication.",
      "The floor is inlaid with a complex pattern of metal strips - silver, copper, and what appears to be black iron - forming an intricate geometric design centered on the altar."
    ],
    choices: [
      {
        text: "Examine the altar more closely",
        nextScene: "dungeon_altar"
      },
      {
        text: "Inspect one of the statues",
        nextScene: "dungeon_statue"
      },
      {
        text: "Study the floor pattern",
        nextScene: "dungeon_floor_pattern"
      }
    ],
    triggers: []
  },

  // Castle Guardian
  castle_guardian: {
    id: 'castle_guardian',
    text: [
      "As you approach, the figure at the end of the bridge becomes clearer. It stands nearly seven feet tall, clad in ancient plate armor that glints dully in the moonlight. Where a head should be, there is only darkness within the helmet.",
      "It holds a massive sword point-down before it, both hands resting on the pommel. As you draw near, it speaks in a voice like stone grinding against stone:",
      "\"Those who seek entry to Shadowspire Castle must prove their worth. Answer my riddle, or turn back to whence you came.\""
    ],
    choices: [
      {
        text: "\"I will answer your riddle.\"",
        nextScene: "castle_guardian_riddle"
      },
      {
        text: "\"I seek entry by right of blood.\"",
        nextScene: "castle_guardian_blood"
      },
      {
        text: "Turn back toward the forest",
        nextScene: "path_to_castle"
      }
    ],
    triggers: []
  },

  // Castle Guardian Riddle
  castle_guardian_riddle: {
    id: 'castle_guardian_riddle',
    text: [
      "The guardian's hollow helmet inclines slightly toward you. The voice emerges again, echoing with ancient power:",
      "\"I have no life, yet I can die. I have no lungs, yet I must breathe. I have no mouth, yet I can devour all things. What am I?\""
    ],
    choices: [
      {
        text: "Return to the bridge",
        nextScene: "castle_bridge"
      }
    ],
    triggers: [
      {
        type: "puzzle",
        data: {
          puzzleId: "guardian_riddle"
        }
      }
    ]
  },

  // Dungeon Altar
  dungeon_altar: {
    id: 'dungeon_altar',
    text: [
      "The stone altar is approximately waist-high and large enough to accommodate a human body. Its surface is carved with channels that direct fluid toward a central basin.",
      "The basin itself contains a small amount of dark residue - ancient blood turned to dust over centuries. At the basin's center is a small depression that seems designed to hold something round, perhaps the size of an apple.",
      "You notice that the metal inlays from the floor continue up the sides of the altar, forming symbols you can't quite decipher."
    ],
    choices: [
      {
        text: "Place your hand on the altar",
        nextScene: "dungeon_altar_touch"
      },
      {
        text: "Examine the central depression more carefully",
        nextScene: "dungeon_altar_depression"
      },
      {
        text: "Return to the central chamber",
        nextScene: "dungeon_chamber"
      }
    ],
    triggers: []
  },

  // Village Well Chain
  village_well_chain: {
    id: 'village_well_chain',
    text: [
      "With considerable effort, you begin to turn the rusted winch. The mechanism groans in protest but slowly begins to wind the chain upward from the depths.",
      "The rhythmic beating sound grows louder as whatever is attached to the chain ascends. There's a weight to it - something substantial.",
      "Finally, the end of the chain appears. Attached to it is a small wooden bucket. Inside the bucket is a pulsing, glowing object - a heart, still beating, but made of what appears to be crystal or glass."
    ],
    choices: [
      {
        text: "Take the crystal heart from the bucket",
        nextScene: "village_well_heart",
        consequences: {
          addItem: "crystal_heart"
        }
      },
      {
        text: "Lower the bucket back into the well",
        nextScene: "village_well_lower"
      },
      {
        text: "Return to the village square",
        nextScene: "village_square"
      }
    ],
    triggers: []
  },

  // Solved Puzzle Path (after solving the castle guardian riddle)
  castle_entrance: {
    id: 'castle_entrance',
    text: [
      "The guardian steps aside, its armor creaking with the movement. \"You may pass,\" it intones, the voice fading like distant thunder.",
      "Beyond lies the castle entrance - a massive pair of iron-bound wooden doors set into the black stone walls. They stand slightly ajar, as if inviting you in.",
      "The courtyard beyond appears empty in the moonlight, with cracked flagstones and long-dead gardens visible through the opening."
    ],
    choices: [
      {
        text: "Enter the castle courtyard",
        nextScene: "castle_courtyard"
      },
      {
        text: "Speak to the guardian again",
        nextScene: "castle_guardian_again"
      },
      {
        text: "Return to the bridge",
        nextScene: "castle_bridge"
      }
    ],
    triggers: []
  },

  // Castle Courtyard
  castle_courtyard: {
    id: 'castle_courtyard',
    text: [
      "The castle courtyard is a study in elegant decay. What once must have been manicured gardens and ornate pathways are now overgrown and crumbling, though some strange, pale flowers bloom among the weeds.",
      "Directly ahead stands the main keep - a towering structure with many windows, though few show any light. To your left is what appears to be a chapel or temple, while a crumbling tower rises to your right.",
      "In the center of the courtyard stands a large statue of a robed figure, one arm raised toward the sky, its face worn smooth by centuries of exposure."
    ],
    choices: [
      {
        text: "Approach the main keep",
        nextScene: "castle_keep"
      },
      {
        text: "Investigate the chapel",
        nextScene: "castle_chapel"
      },
      {
        text: "Examine the statue",
        nextScene: "castle_statue"
      }
    ],
    triggers: []
  },

  // Castle Keep
  castle_keep: {
    id: 'castle_keep',
    text: [
      "The main keep looms before you, its stone walls rising high into the night sky. The entrance is a set of ornate double doors, carved with scenes depicting a royal court - though the rulers and courtiers have strangely distorted features.",
      "The doors are unlocked, swinging open with a ponderous groan when you push against them. Inside is a grand entrance hall, illuminated by moonlight streaming through high windows.",
      "Dust covers everything, and the air smells of age and abandonment. A massive staircase rises at the far end of the hall, and doorways lead off to either side."
    ],
    choices: [
      {
        text: "Climb the main staircase",
        nextScene: "castle_stairs"
      },
      {
        text: "Explore the doorway to the left",
        nextScene: "castle_dining"
      },
      {
        text: "Explore the doorway to the right",
        nextScene: "castle_library"
      }
    ],
    triggers: []
  },

  // Final example scene: Ritual Grounds
  ritual_grounds: {
    id: 'ritual_grounds',
    text: [
      "You've arrived at the Circle of Binding - an ancient site of power mentioned in the whispers and texts throughout Eden's Hollow. Seven stone pillars form a perfect circle around a central altar of black obsidian.",
      "The ground is bare earth, marked with intricate patterns that glow faintly with an inner light. The air here feels charged, as if a storm is about to break, though the sky remains clear.",
      "This is where the boundaries between worlds are thinnest - where the ritual must be performed when the moon reaches its apex."
    ],
    choices: [
      {
        text: "Examine the central altar",
        nextScene: "ritual_altar"
      },
      {
        text: "Study the stone pillars",
        nextScene: "ritual_pillars"
      },
      {
        text: "Leave this place",
        nextScene: "ritual_exit"
      }
    ],
    triggers: []
  }
};