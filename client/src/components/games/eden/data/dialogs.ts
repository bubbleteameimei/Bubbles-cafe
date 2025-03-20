import { Dialog } from '../types';

/**
 * Eden's Hollow Dialogs Data
 * Defines all conversations and narrative text in the game
 */

const dialogs: Record<string, Dialog> = {
  // Introduction dialog
  'mysterious_voice_welcome': {
    id: 'mysterious_voice_welcome',
    content: [
      {
        text: "A voice whispers in your mind as you approach the village entrance...",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "Welcome, seeker, to Eden's Hollow. Few travelers find their way to our humble village these days.",
        speaker: {
          name: "Mysterious Voice",
          color: "#5b2a80"
        }
      },
      {
        text: "The village has been... changed. Darkness has taken root here. But perhaps you are the one who can lift the curse.",
        speaker: {
          name: "Mysterious Voice",
          color: "#5b2a80"
        }
      },
      {
        text: "Be wary. Not everything is as it appears. Trust your instincts, and remember... the truth lies beneath.",
        speaker: {
          name: "Mysterious Voice",
          color: "#5b2a80"
        }
      }
    ],
    choices: [
      {
        text: "Who are you?",
        next: "mysterious_voice_who"
      },
      {
        text: "What curse?",
        next: "mysterious_voice_curse"
      },
      {
        text: "I should leave now.",
        next: "mysterious_voice_leave"
      }
    ]
  },
  
  'mysterious_voice_who': {
    id: 'mysterious_voice_who',
    content: [
      {
        text: "I am... a remnant. A memory. Once I called this village home. Now I exist between worlds.",
        speaker: {
          name: "Mysterious Voice",
          color: "#5b2a80"
        }
      },
      {
        text: "Find me in the village, if you can. Perhaps then I can offer more assistance.",
        speaker: {
          name: "Mysterious Voice",
          color: "#5b2a80"
        }
      }
    ]
  },
  
  'mysterious_voice_curse': {
    id: 'mysterious_voice_curse',
    content: [
      {
        text: "Many years ago, the villagers disturbed something ancient. Something that should have remained buried.",
        speaker: {
          name: "Mysterious Voice",
          color: "#5b2a80"
        }
      },
      {
        text: "A ritual was performed in desperation, but it only made things worse. Now the village is caught between realms, and its inhabitants...",
        speaker: {
          name: "Mysterious Voice",
          color: "#5b2a80"
        }
      },
      {
        text: "Well, you'll see soon enough what became of them.",
        speaker: {
          name: "Mysterious Voice",
          color: "#5b2a80"
        }
      }
    ]
  },
  
  'mysterious_voice_leave': {
    id: 'mysterious_voice_leave',
    content: [
      {
        text: "You could try to leave... but the fog has a way of bringing you back. The village doesn't let go of visitors so easily.",
        speaker: {
          name: "Mysterious Voice",
          color: "#5b2a80"
        }
      },
      {
        text: "Better to face what lies ahead than to wander lost in the mist forever.",
        speaker: {
          name: "Mysterious Voice",
          color: "#5b2a80"
        }
      }
    ]
  },
  
  // Village entrance dialogs
  'village_sign_dialog': {
    id: 'village_sign_dialog',
    content: [
      {
        text: "You examine the weathered sign more closely.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "'Welcome to Eden's Hollow - Founded 1842'. Below that, scratched in what appears to be a different hand: 'TURN BACK WHILE YOU CAN'.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ]
  },
  
  'strange_markings_dialog': {
    id: 'strange_markings_dialog',
    content: [
      {
        text: "You examine the strange markings on the tree. They appear to be ritualistic symbols carved into the bark with precision.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "The symbols form a circular pattern with what looks like an eye at the center. You feel uneasy looking at it for too long.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "As you touch the carving, your fingertips tingle with an unnatural cold.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ]
  },
  
  // Village square dialogs
  'fountain_dialog': {
    id: 'fountain_dialog',
    content: [
      {
        text: "You approach the dry fountain in the center of the square. It must have been beautiful once, but now it stands cracked and empty.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "Around the rim, strange symbols have been carved into the stone. They remind you of the markings you saw on the tree.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "At the bottom of the basin, barely visible through the cracks, you notice a faint glow emanating from beneath.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ],
    choices: [
      {
        text: "Reach into the cracks",
        next: "fountain_reach"
      },
      {
        text: "Study the symbols",
        next: "fountain_symbols"
      },
      {
        text: "Step away",
        next: "fountain_leave"
      }
    ]
  },
  
  'fountain_reach': {
    id: 'fountain_reach',
    content: [
      {
        text: "You cautiously reach your hand into one of the wider cracks in the fountain basin.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "The stone feels unnaturally cold. As your fingers probe deeper, they touch something liquid, despite the fountain appearing completely dry.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "A sudden sharp pain causes you to withdraw your hand quickly. There's a small cut on your finger, and a drop of your blood has been left behind.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "The glow beneath the cracks intensifies momentarily, then fades.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ],
    choices: [
      {
        text: "I shouldn't have done that...",
        effect: {
          type: 'health',
          value: -5
        }
      }
    ]
  },
  
  'fountain_symbols': {
    id: 'fountain_symbols',
    content: [
      {
        text: "You carefully examine the symbols carved around the rim of the fountain.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "They appear to be an ancient form of writing, depicting what might be a ritual or ceremony. One recurring symbol looks like an eye surrounded by tentacle-like appendages.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "You notice that some of the symbols match the ones you saw at the village entrance. Perhaps they're connected somehow.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "As you study the carvings, you begin to feel a slight headache forming. There's something unsettling about their composition.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ],
    choices: [
      {
        text: "I should remember these patterns",
        effect: {
          type: 'status',
          value: 'learnedSymbolPattern'
        }
      }
    ]
  },
  
  'fountain_leave': {
    id: 'fountain_leave',
    content: [
      {
        text: "You decide it's best not to tamper with the fountain and step away.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "As you back away, you could swear you hear a faint whisper emanating from the cracks, almost like a sigh of disappointment.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ]
  },
  
  // Abandoned house dialogs
  'broken_window_dialog': {
    id: 'broken_window_dialog',
    content: [
      {
        text: "You approach the broken window carefully, mindful of the jagged glass still in the frame.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "Through the shattered pane, you can see into what appears to be a former living room. Furniture lies toppled and broken.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "Something metallic catches your eye on a table inside. It looks like a key.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ],
    choices: [
      {
        text: "Reach through the window",
        next: "window_reach"
      },
      {
        text: "Look for another way in",
        next: "window_leave"
      }
    ]
  },
  
  'window_reach': {
    id: 'window_reach',
    content: [
      {
        text: "You carefully reach through the broken window, trying to avoid the sharp edges of glass.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "Despite your caution, your arm brushes against a jagged shard. Pain shoots through your arm as it cuts into your skin.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "You stretch further, fingers straining to reach the key on the table. Just as you're about to grasp it, a sudden gust of wind slams the window shut!",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "You barely manage to pull your arm back in time, heart pounding. The window frame creaks as if it had never been broken at all.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ],
    choices: [
      {
        text: "That was too close...",
        effect: {
          type: 'health',
          value: -10
        }
      }
    ]
  },
  
  'window_leave': {
    id: 'window_leave',
    content: [
      {
        text: "You decide it's too risky to reach through the broken glass. There must be a safer way to enter.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "As you step back from the window, you notice the front door of the house is slightly ajar.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ]
  },
  
  'strange_doll_dialog': {
    id: 'strange_doll_dialog',
    content: [
      {
        text: "You kneel down to examine the worn porcelain doll propped against the steps.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "Its once-white face is now stained with dirt and age, but its glass eyes remain bright and unnervingly lifelike.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "The doll wears a faded blue dress with intricate embroidery. Something is stitched into the hem - a name perhaps?",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "You turn the doll over carefully to read the stitching: 'ELIZA'",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ],
    choices: [
      {
        text: "Take the doll",
        next: "doll_take"
      },
      {
        text: "Leave it alone",
        next: "doll_leave"
      }
    ]
  },
  
  'doll_take': {
    id: 'doll_take',
    content: [
      {
        text: "You decide to take the doll with you. As you pick it up, you feel an inexplicable chill run down your spine.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "Did the doll's eyes just blink? No, it must have been a trick of the light.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "You carefully place the doll in your bag. For a moment, you could swear you heard a child's giggle.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ],
    choices: [
      {
        text: "This is creepy, but it might be important",
        effect: {
          type: 'item',
          value: 'eliza_doll'
        }
      }
    ]
  },
  
  'doll_leave': {
    id: 'doll_leave',
    content: [
      {
        text: "You decide to leave the doll where it is. Something about it makes you uneasy.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "As you turn to walk away, you hear what sounds like a child's whisper behind you.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "\"Don't leave me here...\"",
        speaker: {
          name: "???",
          color: "#e6a2ff"
        }
      },
      {
        text: "You spin around, but there's no one there - just the doll, still propped against the steps, its glassy eyes reflecting the dim light.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ]
  },
  
  // House interior dialogs
  'bookshelf_dialog': {
    id: 'bookshelf_dialog',
    content: [
      {
        text: "You carefully examine the dusty bookshelf. Most of the books are damaged beyond recognition, their pages rotted and covers warped from exposure.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "A few volumes remain in somewhat readable condition. One in particular catches your eye - a leather-bound journal with a curious symbol embossed on its spine.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "You carefully pull it from the shelf and open it to a random page.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ],
    choices: [
      {
        text: "Read the journal",
        next: "bookshelf_journal"
      },
      {
        text: "Search for other books",
        next: "bookshelf_search"
      }
    ]
  },
  
  'bookshelf_journal': {
    id: 'bookshelf_journal',
    content: [
      {
        text: "The journal appears to belong to someone named Thomas Harper, dated 1879. The handwriting becomes increasingly erratic as you flip through the pages.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "\"April 16 - The excavation of the old well has revealed something unusual. Worker Collins found a strange artifact buried in the clay. An amulet of some sort, unlike anything I've seen.\"",
        speaker: {
          name: "Journal",
          color: "#a65c28"
        }
      },
      {
        text: "\"April 20 - Nightmares. Always the same. Eyes watching from the dark. The amulet grows colder each day.\"",
        speaker: {
          name: "Journal",
          color: "#a65c28"
        }
      },
      {
        text: "\"April 28 - The circle must be completed. The symbols must be drawn exactly as shown. May God forgive what we are about to do.\"",
        speaker: {
          name: "Journal",
          color: "#a65c28"
        }
      },
      {
        text: "The final pages are stained with what looks disturbingly like dried blood.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ],
    choices: [
      {
        text: "Take the journal",
        effect: {
          type: 'item',
          value: 'harpers_journal'
        }
      }
    ]
  },
  
  'bookshelf_search': {
    id: 'bookshelf_search',
    content: [
      {
        text: "You search through the other books on the shelf, most crumbling at your touch.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "One small volume, tucked behind the others, catches your attention. It appears to be a child's diary, with a faded floral pattern on the cover.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "You open it carefully and read the first legible page.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "\"Dear Diary, Daddy says I can't go near the well anymore. He says it's dangerous. But I saw something shiny down there. Something pretty. Maybe I can go look when everyone is sleeping.\"",
        speaker: {
          name: "Child's Diary",
          color: "#e6a2ff"
        }
      },
      {
        text: "The remaining pages are blank, except for a crude drawing on the final page - a stick figure of a little girl holding hands with a much taller, spindly figure with too many arms.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ]
  },
  
  'locked_cellar_dialog': {
    id: 'locked_cellar_dialog',
    content: [
      {
        text: "You try to open the heavy trap door, but it won't budge. It appears to be locked from the inside.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "Around the edges of the door, you notice strange symbols carved into the wood - similar to those you've seen elsewhere in the village.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "There's a keyhole with an unusual shape. A specific key must be needed to unlock it.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ]
  },
  
  'open_cellar_dialog': {
    id: 'open_cellar_dialog',
    content: [
      {
        text: "With the cellar key in hand, you approach the trap door again.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "The key slides perfectly into the lock. As you turn it, the symbols around the edge of the door begin to glow faintly with an unnatural blue light.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "You hear a heavy mechanism click, and the trap door opens slightly, releasing a gust of cold, stale air from below.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "A faint sound reaches your ears - something between a whisper and a chant, emanating from the darkness below.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ],
    choices: [
      {
        text: "Enter the cellar",
        next: "enter_cellar"
      },
      {
        text: "Not yet",
        next: "delay_cellar"
      }
    ]
  },
  
  'enter_cellar': {
    id: 'enter_cellar',
    content: [
      {
        text: "You pull the trap door fully open, revealing a set of stone steps descending into darkness.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "The whispering grows slightly louder, though still indecipherable. Whatever awaits you below, it seems to be aware of your presence.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "Gathering your courage, you begin to descend the stairs into the cellar...",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ]
  },
  
  'delay_cellar': {
    id: 'delay_cellar',
    content: [
      {
        text: "You decide not to enter the cellar just yet. Something tells you that you should be better prepared before descending.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "You carefully close the trap door, but it doesn't fully latch. It will remain unlocked now that you've used the key.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "The whispering fades as the door closes, but you can't shake the feeling that something down there is waiting for you.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ]
  },
  
  // Cellar dialogs
  'ritual_circle_dialog': {
    id: 'ritual_circle_dialog',
    content: [
      {
        text: "You approach the ritual circle drawn on the cellar floor. The symbols match those you've seen throughout the village, but here they form a complete pattern.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "The circle is drawn in what appears to be dried blood, darkened with age. Five smaller circles are positioned at key points around the main circle.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "In the center of the pattern is a symbol you recognize from the journals - an eye surrounded by tentacle-like appendages.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "As you study the pattern, the air seems to grow colder, and the whispering you heard earlier intensifies.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ],
    choices: [
      {
        text: "Step into the circle",
        next: "circle_enter"
      },
      {
        text: "Touch the center symbol",
        next: "circle_touch"
      },
      {
        text: "Back away",
        next: "circle_leave"
      }
    ]
  },
  
  'circle_enter': {
    id: 'circle_enter',
    content: [
      {
        text: "Something compels you to step into the ritual circle. As your foot crosses the boundary, the blood-drawn lines begin to glow with an eerie crimson light.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "The whispering suddenly crescendos to a chorus of voices, and you feel a sharp pain in your head.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "Visions flash before your eyes - the village as it once was, people gathered around the well, a darkness rising from below, screams...",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "Then a voice, louder than the others, speaks directly into your mind.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "\"THE PACT REMAINS UNBROKEN. FIVE WERE TAKEN. ONE MUST RETURN.\"",
        speaker: {
          name: "Ancient Voice",
          color: "#660000"
        }
      },
      {
        text: "The pain becomes unbearable, and you stagger backward out of the circle. The glow fades, but something of the ritual has marked you.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ],
    choices: [
      {
        text: "I shouldn't have done that...",
        effect: {
          type: 'status',
          value: 'ritualInsight'
        }
      }
    ]
  },
  
  'circle_touch': {
    id: 'circle_touch',
    content: [
      {
        text: "You reach out and touch the central eye symbol. The moment your finger makes contact, a jolt of energy surges through your body.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "The room seems to distort around you, and for a brief moment, you see through different eyes - eyes that view the world from multiple angles simultaneously.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "Glimpses of other places flash in your mind: a church altar with a hidden compartment, a well with something glinting at the bottom, a grave marked with the same eye symbol.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "When the vision fades, you find yourself on your knees, gasping for breath. Your hand is unmarked, but your mind feels... expanded.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ],
    choices: [
      {
        text: "These visions might be useful",
        effect: {
          type: 'mana',
          value: -15
        }
      }
    ]
  },
  
  'circle_leave': {
    id: 'circle_leave',
    content: [
      {
        text: "You decide not to tamper with the ritual circle and back away cautiously.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "As you step back, the whispering subsides slightly. Whatever power resides in those symbols, it seems content to let you leave - for now.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "You can't help but feel you're being watched by unseen eyes.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ]
  },

  // Well dialogs
  'well_water_dialog': {
    id: 'well_water_dialog',
    content: [
      {
        text: "You peer down into the well. Despite its apparent age and neglect, the water within is crystal clear - unnaturally so.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "Your reflection stares back at you from the still surface, but something seems off about it. The face looking back at you appears subtly different - older, perhaps, or somehow altered.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "As you watch, ripples suddenly disturb the water, though nothing has touched its surface. The ripples form patterns that remind you of the symbols you've seen throughout the village.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ],
    choices: [
      {
        text: "Reach toward the water",
        next: "well_reach"
      },
      {
        text: "Drop a stone in",
        next: "well_stone"
      },
      {
        text: "Back away",
        next: "well_away"
      }
    ]
  },
  
  'well_reach': {
    id: 'well_reach',
    content: [
      {
        text: "You cautiously reach your hand toward the water's surface. The air grows noticeably colder as your fingers approach the well.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "Just before you touch the water, your reflection's hand reaches up - as if to meet yours from below!",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "You recoil in shock, nearly losing your balance. When you look again, your reflection is normal once more, mimicking your movements exactly as it should.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "But something in the depths of the well catches your eye - a faint glimmer of metal.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ]
  },
  
  'well_stone': {
    id: 'well_stone',
    content: [
      {
        text: "You pick up a small stone from nearby and drop it into the well.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "The stone breaks the surface with a splash, creating ripples across your reflection. But something strange happens - there's no sound of it hitting bottom.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "You wait, but the expected distant 'plunk' never comes. It's as if the well has no bottom, or the stone simply ceased to exist after entering the water.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "As the ripples settle, you notice a change in your reflection - for just a moment, there appears to be someone standing behind you. You spin around, but there's no one there.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ]
  },
  
  'well_away': {
    id: 'well_away',
    content: [
      {
        text: "You decide not to tempt fate and back away from the well. As you do, a soft sigh seems to emanate from its depths.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "The unnatural stillness of the water is disturbed by ripples that form on their own, as if something below is stirring.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      },
      {
        text: "You can't shake the feeling that the well is somehow central to the village's dark history.",
        speaker: {
          name: "Narrator",
          color: "#888888"
        }
      }
    ]
  }
};

export default dialogs;