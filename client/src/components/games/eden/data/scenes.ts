import { GameScene } from '../types';

export const gameScenes: Record<string, GameScene> = {
  // Starting location - Forest Edge
  forest_edge: {
    id: 'forest_edge',
    title: 'The Edge of Whispering Woods',
    description: [
      "You stand at the threshold of the notorious Whispering Woods, the boundary between the known world and Eden's Hollow. Twisted trees reach toward the darkening sky, their branches like gnarled fingers.",
      "A narrow path winds into the gloom ahead, barely visible through the undergrowth. Behind you lies the safety of the road home, but it grows more distant with each passing moment.",
      "The air is unnaturally still, carrying the faint scent of decay and something else—something ancient and heavy with promise."
    ],
    image: 'forest_edge.jpg',
    backgroundAudio: 'ambient_forest.mp3',
    exits: [
      {
        label: 'Follow the path deeper into the woods',
        destination: 'deep_woods',
        requirement: null
      },
      {
        label: 'Investigate the abandoned shrine',
        destination: 'forgotten_shrine',
        requirement: null
      },
      {
        label: 'Turn back while you still can',
        destination: 'game_intro',
        requirement: null
      }
    ],
    characters: [],
    items: [],
    actions: [
      {
        label: 'Listen to the whispers of the forest',
        action: 'listen',
        result: "You close your eyes and focus on the sounds around you. At first, there is only silence, but then... voices. Distant, unintelligible whispers that seem to come from everywhere and nowhere at once. They speak of ancient secrets and forbidden knowledge, of power and sacrifice. The whispers grow more insistent, more seductive, until you force your eyes open, breaking their hold on you. Whatever dwells in these woods knows you are here now.",
        outcomes: [
          {
            type: 'status',
            value: { 'heard_whispers': true }
          }
        ]
      }
    ],
    discovery: {
      text: "As the light fades, you notice strange symbols carved into some of the trees. They appear ancient, worn by weather and time, yet still clearly visible. Some primal instinct tells you they are warnings, not welcome signs.",
      requires: { time: 'dusk' }
    }
  },
  
  // Deep Woods
  deep_woods: {
    id: 'deep_woods',
    title: 'Heart of Whispering Woods',
    description: [
      "The forest has swallowed you completely. Towering trees block out the sky, leaving you in a perpetual twilight broken only by occasional shafts of weak light penetrating the canopy.",
      "The path has all but disappeared, and the undergrowth grows thicker with each step. Mist clings to the forest floor, swirling around your ankles as if alive.",
      "Strange sounds echo between the trees—cracking branches, rustling leaves, and occasionally what might be distant laughter, though no human has dwelled here for generations."
    ],
    image: 'deep_woods.jpg',
    backgroundAudio: 'deep_forest.mp3',
    exits: [
      {
        label: 'Push forward toward the castle',
        destination: 'castle_approach',
        requirement: null
      },
      {
        label: 'Veer toward the village ruins',
        destination: 'abandoned_village',
        requirement: null
      },
      {
        label: 'Return to the forest edge',
        destination: 'forest_edge',
        requirement: null
      }
    ],
    characters: [
      {
        id: 'old_sage',
        name: 'Elder Lorhaven',
        description: 'An ancient man leans against a gnarled oak, his weathered face a map of wrinkles. His eyes, however, are sharp and clear, watching your approach with knowing intensity.',
        dialog: 'old_sage',
        requirement: null
      }
    ],
    items: [
      {
        id: 'ghostlight_lantern',
        requirement: { status: { 'heard_whispers': true } },
        hidden: true
      }
    ],
    actions: [
      {
        label: 'Examine the unusual fungi',
        action: 'examine',
        result: "The forest floor is dotted with luminescent fungi, casting an eerie blue glow across the mist. As you bend to examine them closer, you notice they pulse in rhythm, like a heartbeat. Some appear to form patterns—perhaps natural, perhaps not. One cluster seems to point deeper into the woods, toward what must be Shadowspire Castle.",
        outcomes: []
      },
      {
        label: 'Search for useful herbs',
        action: 'search',
        result: "You carefully search the undergrowth, mindful of what might lurk within. Among the common forest plants, you find several sprigs of nightshade and a rare bloodroot plant. Both are potent ingredients in certain rituals, though harvesting them requires care. You gather what you can, tucking them safely away.",
        outcomes: [
          {
            type: 'item',
            value: 'healing_potion',
            message: "You've crafted a small vial of Crimson Elixir from the herbs you gathered."
          }
        ]
      }
    ],
    discovery: {
      text: "As you move deeper into the woods, you stumble upon an ancient stone marker half-buried in the earth. Clearing away the moss reveals a warning carved in an old script: 'The veil thins where the hollowed tree stands. Speak not to what answers from within.'",
      requires: null
    }
  },
  
  // Forgotten Shrine
  forgotten_shrine: {
    id: 'forgotten_shrine',
    title: 'The Forgotten Shrine',
    description: [
      "A small clearing opens before you, dominated by the remains of a stone shrine. Once dedicated to some forgotten deity, the structure now lies in partial ruin, reclaimed by the forest.",
      "Stone pillars, most broken and fallen, surround a central altar stained dark with what might be centuries of offerings. Vines crawl over the weathered stone, yet they seem to avoid the altar itself.",
      "The air feels charged here, heavy with potential. The whispers of the forest are louder, more insistent, as if the veil between worlds is thinner in this sacred space."
    ],
    image: 'forgotten_shrine.jpg',
    backgroundAudio: 'shrine_ambience.mp3',
    exits: [
      {
        label: 'Return to the forest edge',
        destination: 'forest_edge',
        requirement: null
      },
      {
        label: 'Follow the overgrown path behind the shrine',
        destination: 'hidden_glade',
        requirement: { item: 'ancient_amulet' }
      }
    ],
    characters: [],
    items: [
      {
        id: 'ancient_amulet',
        requirement: { status: { 'completed_offering': true } },
        hidden: false
      }
    ],
    actions: [
      {
        label: 'Examine the altar',
        action: 'examine',
        result: "You approach the altar cautiously. The stone is smooth and cold to the touch, unnaturally so given the warm air around it. Ancient symbols are carved around its edges, partially obscured by time but still legible to those who know how to read them. A shallow basin in the center appears designed to hold offerings, and deep channels lead from it to the ground, suggesting that whatever was placed there was meant to flow down and into the earth.",
        outcomes: []
      },
      {
        label: 'Make an offering at the altar',
        action: 'offer',
        result: "You contemplate what might appease whatever entity this shrine once honored—or perhaps still honors. Acting on instinct, you prick your finger and allow a single drop of blood to fall into the basin. For a moment, nothing happens. Then the blood begins to move of its own accord, tracing the patterns carved into the stone. The whispers around you intensify, reaching a fever pitch before falling suddenly silent. In the basin lies a silver amulet that wasn't there before, gleaming as if newly forged.",
        outcomes: [
          {
            type: 'status',
            value: { 'completed_offering': true }
          }
        ]
      }
    ],
    discovery: {
      text: "Behind the altar, nearly hidden by overgrowth, you discover a small alcove containing a stone tablet. The writing is in an ancient script, but somehow you understand it: 'The worthy shall pass beyond the veil, bearing the mark of the old ones. The unworthy shall wander lost, their souls forfeit to the hollow.'",
      requires: { status: { 'completed_offering': true } }
    }
  },
  
  // Castle Approach
  castle_approach: {
    id: 'castle_approach',
    title: 'The Path to Shadowspire',
    description: [
      "The forest gradually thins, revealing a barren expanse of land dominated by Shadowspire Castle in the distance. The massive structure looms against the twilight sky, its towers and spires like daggers piercing the heavens.",
      "The path before you winds across terrain that seems deliberately cleared—no tree or structure stands to offer shelter or hiding place on the approach to the castle gates.",
      "Ravens circle overhead, their harsh cries the only sound besides your footsteps and the distant howl of wind through the castle's empty windows."
    ],
    image: 'castle_approach.jpg',
    backgroundAudio: 'wind_ravens.mp3',
    exits: [
      {
        label: 'Proceed to the castle gates',
        destination: 'castle_gates',
        requirement: null
      },
      {
        label: 'Return to the deep woods',
        destination: 'deep_woods',
        requirement: null
      },
      {
        label: 'Investigate the watchtower',
        destination: 'crumbling_watchtower',
        requirement: null
      }
    ],
    characters: [],
    items: [],
    actions: [
      {
        label: 'Study the castle from afar',
        action: 'examine',
        result: "From this vantage point, you can see that Shadowspire Castle is even more imposing than tales suggest. Its architecture defies conventional design, with towers that seem to bend at impossible angles and wings that couldn't possibly connect as they appear to. More disturbing still, you occasionally glimpse movement at the windows—shadows passing back and forth, though the castle is reportedly abandoned. As you watch, you feel an uncomfortable certainty that the castle is watching you in return.",
        outcomes: []
      }
    ],
    discovery: {
      text: "As you survey the landscape, your eye catches on a detail that seems out of place. Near the base of the castle's eastern wall, partially hidden in shadow, appears to be a small entrance—perhaps a service door or drainage tunnel. It might offer an alternative way into the castle, less obvious than the main gate.",
      requires: { item: 'ghostlight_lantern' }
    }
  },
  
  // Abandoned Village
  abandoned_village: {
    id: 'abandoned_village',
    title: 'The Forsaken Settlement',
    description: [
      "What was once a thriving village now stands in haunting ruin. Collapsed roofs, crumbling walls, and empty doorways create a landscape of decay and abandonment.",
      "The village square centers around an ancient well, its stones blackened and cracked. Unlike the rest of the village, the well seems untouched by time, an unnatural preservation that makes it all the more unsettling.",
      "Though no living residents remain, there's a palpable sense that you are not alone. Shadows move in peripheral vision, and the air occasionally ripples as if disturbed by passing figures."
    ],
    image: 'abandoned_village.jpg',
    backgroundAudio: 'ghost_village.mp3',
    exits: [
      {
        label: 'Return to the deep woods',
        destination: 'deep_woods',
        requirement: null
      },
      {
        label: 'Explore the village houses',
        destination: 'village_ruins',
        requirement: null
      },
      {
        label: 'Approach the well',
        destination: 'ancient_well',
        requirement: null
      }
    ],
    characters: [
      {
        id: 'village_elder',
        name: 'Griseld',
        description: 'A translucent figure sits on a broken wall, her elderly form hunched with the weight of centuries. She flickers in and out of visibility, but her eyes remain fixed on you when present.',
        dialog: 'village_elder',
        requirement: { item: 'ghostlight_lantern' }
      }
    ],
    items: [],
    actions: [
      {
        label: 'Listen for spectral voices',
        action: 'listen',
        result: "You stand still and focus your senses beyond the physical. At first, there is only the wind and distant forest sounds. Then, gradually, you begin to hear them—whispered conversations, fragments of laughter, a child's song cut short. The voices of those who once lived here linger still, trapped in an endless echo of the life that was.",
        outcomes: []
      }
    ],
    discovery: {
      text: "Near the village boundary, you discover a small cemetery overgrown with twisted vegetation. Most of the headstones are worn beyond recognition, but one stands out—newer, cleaner, and bearing a name you recognize from your research: 'Here lies Elara, Last Guardian of the Seal. May her sacrifice not be in vain.'",
      requires: null
    }
  },
  
  // Castle Gates
  castle_gates: {
    id: 'castle_gates',
    title: 'The Gates of Shadowspire',
    description: [
      "You stand before the imposing entrance to Shadowspire Castle. Massive iron gates, intricately worked with scenes of torment and transformation, bar your path. The stone walls rise impossibly high on either side, offering no alternative entry.",
      "Despite their apparent age and the abandoned state of the castle, the gates show no sign of rust or decay. They radiate a subtle heat, as if recently forged or perhaps imbued with some internal fire.",
      "Two stone guardians flank the entrance, their features worn smooth by time but their postures eternally vigilant. Their empty eye sockets seem to track your movement."
    ],
    image: 'castle_gates.jpg',
    backgroundAudio: 'castle_ambience.mp3',
    exits: [
      {
        label: 'Enter the castle courtyard',
        destination: 'castle_courtyard',
        requirement: { puzzle: 'guardian_riddle' }
      },
      {
        label: 'Return to the castle approach',
        destination: 'castle_approach',
        requirement: null
      }
    ],
    characters: [],
    items: [],
    puzzles: [
      {
        id: 'guardian_riddle',
        introduction: "As you approach the gates, the stone guardians suddenly animate, their heads turning in unison to face you. A voice emanates from them both simultaneously, echoing with supernatural resonance: 'Answer our riddle, mortal, and you may pass. Fail, and join the countless others who decorate our halls.'",
        type: 'riddle'
      }
    ],
    actions: [
      {
        label: 'Examine the gates more closely',
        action: 'examine',
        result: "Upon closer inspection, the scenes depicted on the gates tell a disturbing story. They appear to show the transformation of human figures into something other—beings of shadow and flame with too many limbs and features that defy natural law. At the center of the gates, where the two sides meet, is a large keyhole shaped like a twisted flame.",
        outcomes: []
      },
      {
        label: 'Test the gates',
        action: 'interact',
        result: "You place your hands on the gates, prepared to push. The metal is uncomfortably hot, but not enough to burn. As you apply pressure, the gates do not budge in the slightest. Whatever mechanism or magic holds them closed, it will not yield to simple force.",
        outcomes: []
      }
    ],
    discovery: {
      text: "As you step back from the gates, contemplating your next move, something catches your eye. A small symbol has appeared on the ground at your feet—a circle containing a spiral, glowing with faint blue light. It wasn't there moments ago, and as you watch, it slowly fades from sight.",
      requires: { status: { 'heard_whispers': true } }
    }
  },
  
  // Hidden Glade
  hidden_glade: {
    id: 'hidden_glade',
    title: 'The Veiled Sanctuary',
    description: [
      "The overgrown path behind the shrine leads to a secluded glade that seems impossibly serene compared to the rest of the forest. The air is still, the light a perpetual golden dusk.",
      "A perfect circle of ancient standing stones surrounds a pool of water so clear and still it mirrors the sky above with perfect clarity. The stones bear carvings similar to those at the shrine, but more elaborate, more complete.",
      "Flowers bloom here that you've never seen before—blooms of midnight blue and silver that seem to emit their own subtle light. They track your movement as if watching, sentient guardians of this sacred space."
    ],
    image: 'hidden_glade.jpg',
    backgroundAudio: 'mystical_glade.mp3',
    exits: [
      {
        label: 'Return to the forgotten shrine',
        destination: 'forgotten_shrine',
        requirement: null
      }
    ],
    characters: [
      {
        id: 'bound_spirit',
        name: 'Ethereal Presence',
        description: 'A wispy, transparent figure hovers above the pool, its form constantly shifting between humanoid and something more abstract. It ripples like the surface of disturbed water, never quite settling into a definitive shape.',
        dialog: 'bound_spirit',
        requirement: null
      }
    ],
    items: [
      {
        id: 'spirit_essence',
        requirement: { status: { 'freed_bound_spirit': true } },
        hidden: false
      }
    ],
    puzzles: [
      {
        id: 'spirit_binding',
        introduction: "The bound spirit gestures toward the standing stones, and suddenly lines of energy become visible, connecting each stone in a complex pattern. The spirit's voice echoes in your mind: 'Recreate the binding pattern in reverse, and I shall be freed to aid you. Fail, and the binding will strengthen, trapping us both.'",
        type: 'pattern'
      }
    ],
    actions: [
      {
        label: 'Meditate beside the pool',
        action: 'meditate',
        result: "You sit at the edge of the pool and clear your mind, allowing yourself to become receptive to the energy of this place. Gradually, your consciousness expands. The boundary between your mind and the glade blurs. You perceive the network of power flowing beneath the earth, connecting this place to others throughout Eden's Hollow. For a brief moment, you glimpse the true nature of the realm—a construct, a prison, a gateway—before the vision fades, leaving you with clarity of purpose if not complete understanding.",
        outcomes: [
          {
            type: 'status',
            value: { 'meditation_insight': true }
          }
        ]
      }
    ],
    discovery: {
      text: "After solving the spirit's puzzle, the water in the pool begins to ripple and change color, shifting from clear to a luminescent blue. Images form on its surface—visions of the past, perhaps, or possible futures. You see the castle's interior, a vast library with books chained to shelves, and a chamber deep below where something massive stirs in darkness.",
      requires: { status: { 'freed_bound_spirit': true } }
    }
  },
  
  // Castle Courtyard
  castle_courtyard: {
    id: 'castle_courtyard',
    title: 'The Courtyard of Shadows',
    description: [
      "Beyond the gates lies a vast courtyard, once grand but now overtaken by decay. Cracked flagstones form uneven paths between patches of strange vegetation—plants with black leaves and thorns that seem to reach toward you as you pass.",
      "Statues line the perimeter, their features twisted in expressions of agony or ecstasy, so detailed they appear almost alive. Some bear fresh scratches in the stone, as if they had moved recently.",
      "At the center stands a dried fountain, its basin stained with what might be centuries of mineral deposits—or something darker. The main castle doors loom ahead, flanked by burning braziers that cast long, dancing shadows across the courtyard."
    ],
    image: 'castle_courtyard.jpg',
    backgroundAudio: 'courtyard_wind.mp3',
    exits: [
      {
        label: 'Enter the castle grand hall',
        destination: 'castle_grand_hall',
        requirement: null
      },
      {
        label: 'Return to the castle gates',
        destination: 'castle_gates',
        requirement: null
      },
      {
        label: 'Explore the east wing ruins',
        destination: 'east_wing_ruins',
        requirement: null
      }
    ],
    characters: [],
    items: [
      {
        id: 'castle_key',
        requirement: { status: { 'fountain_secret': true } },
        hidden: true
      }
    ],
    actions: [
      {
        label: 'Examine the dried fountain',
        action: 'examine',
        result: "The fountain's central figure is a winged being whose species you cannot identify—not quite human, not quite beast. Its mouth is open in what could be song or scream, and once spouted water. The basin below is etched with symbols similar to those you've seen before, but more complex. As you study them, you realize they form instructions—a ritual to activate the fountain once more. The final line reads: 'Only blood freely given may unlock the path.'",
        outcomes: []
      },
      {
        label: 'Perform the fountain ritual',
        action: 'ritual',
        result: "Following the instructions carved in the basin, you prepare the simple ritual. The final step requires blood. You make a small cut on your palm and allow your blood to drip into the fountain. For a moment, nothing happens. Then the blood begins to flow along the channels in the basin, tracing the symbols there. The central statue shudders and rotates, revealing a hidden compartment in its base containing a heavy iron key shaped like a twisted flame.",
        outcomes: [
          {
            type: 'status',
            value: { 'fountain_secret': true }
          }
        ]
      }
    ],
    discovery: {
      text: "As twilight deepens, you notice something unusual about the shadows cast by the statues. They don't quite match the figures casting them—extra limbs reach from some, while others show shapes with too many eyes or mouths frozen in silent screams. When you look directly at any shadow, it appears normal, but in your peripheral vision, they move independently of their sources.",
      requires: { time: 'dusk' }
    }
  },
  
  // Ancient Well
  ancient_well: {
    id: 'ancient_well',
    title: 'The Well of Echoes',
    description: [
      "The ancient well dominates the village square, a perfect circle of blackened stone that seems to absorb rather than reflect light. Unlike the crumbling buildings around it, the well appears untouched by time or elements.",
      "Peering over its edge reveals no water below—only a darkness so complete it might well be bottomless. No sound returns when small stones are dropped into its depths.",
      "Strange symbols adorn the well's outer rim, glowing faintly with an inner light that pulses like a heartbeat. The air around the well is noticeably colder, your breath forming clouds even on this mild evening."
    ],
    image: 'ancient_well.jpg',
    backgroundAudio: 'well_whispers.mp3',
    exits: [
      {
        label: 'Return to the village square',
        destination: 'abandoned_village',
        requirement: null
      }
    ],
    characters: [],
    items: [
      {
        id: 'crystal_heart',
        requirement: { puzzle: 'blood_lock' },
        hidden: false
      }
    ],
    puzzles: [
      {
        id: 'blood_lock',
        introduction: "As you examine the well more closely, the symbols around its rim begin to glow more intensely. They shift and rearrange themselves, forming a circular pattern with empty spaces between certain symbols. A whispered voice emerges from the well: 'The blood seal guards the heart. Trace the pattern of the ancient bloodline to release what lies below.'",
        type: 'pattern'
      }
    ],
    actions: [
      {
        label: 'Listen to the well',
        action: 'listen',
        result: "You lean cautiously over the edge of the well and focus on listening. At first, there is only the heavy silence of the depths. Then, gradually, you begin to hear it—whispers, hundreds of them, layered upon each other in a cacophony of pleas, warnings, and confessions. Individual words occasionally rise clear above the rest: 'trapped,' 'hungry,' 'release,' 'beware.' The voices grow more insistent the longer you listen, until you must pull away or risk being drawn into their desperate chorus.",
        outcomes: []
      }
    ],
    discovery: {
      text: "After solving the blood lock puzzle, the well's darkness recedes slightly, revealing a pulsing light far below. Suspended in the depths is a crystal formation in the perfect shape of a human heart, beating in rhythm with the glowing symbols. As you watch, it rises slowly to the surface, hovering momentarily before settling into your outstretched hands. The crystal is warm to the touch and continues to pulse with an inner light.",
      requires: { puzzle: 'blood_lock' }
    }
  }
};