import { DialogData } from '../types';

export const gameDialogs: Record<string, DialogData> = {
  // Old Sage
  old_sage: {
    character: {
      name: 'Elder Lorhaven',
      portrait: '/images/portraits/old-sage.jpg'
    },
    text: [
      "Ah, another seeker of mysteries. Eden's Hollow has claimed many such as you.",
      "I was once like you - driven by curiosity, by hunger for knowledge. That was before I learned what dwells in the heart of this accursed place.",
      "I cannot stop you from your path, but I can offer guidance. The castle holds the key you seek, but the price of entry is steep."
    ],
    responses: [
      {
        text: "Tell me more about the castle.",
        nextDialog: "old_sage_castle"
      },
      {
        text: "What dwells in the heart of Eden's Hollow?",
        nextDialog: "old_sage_secret"
      },
      {
        text: "I need no guidance. My path is my own.",
        action: "leave"
      }
    ]
  },
  
  // Old sage discussing castle
  old_sage_castle: {
    character: {
      name: 'Elder Lorhaven',
      portrait: '/images/portraits/old-sage.jpg'
    },
    text: [
      "Shadowspire Castle was once the seat of powerful rulers - though whether they were human is a matter of debate.",
      "The castle is guarded by ancient magic. Its guardian will test you with riddles of fire and shadow.",
      "But be warned: what you find within may not be what you seek. The castle holds many secrets, and not all of them should be unearthed."
    ],
    responses: [
      {
        text: "How can I overcome the guardian?",
        nextDialog: "old_sage_guardian"
      },
      {
        text: "What secrets should remain buried?",
        nextDialog: "old_sage_secret"
      },
      {
        text: "Thank you for the warning. I'll be on my way.",
        action: "leave"
      }
    ]
  },
  
  // Dark Priestess
  dark_priestess: {
    character: {
      name: 'Lady Morvaine',
      portrait: '/images/portraits/dark-priestess.jpg'
    },
    text: [
      "So, another pilgrim arrives. How... delicious.",
      "You seek knowledge of the ritual, do you not? All who come to Eden's Hollow eventually find their way to me.",
      "I can guide you to what you seek, but all knowledge has its price. Are you willing to pay it?"
    ],
    responses: [
      {
        text: "What is this ritual you speak of?",
        nextDialog: "dark_priestess_ritual"
      },
      {
        text: "What price do you demand?",
        nextDialog: "dark_priestess_price"
      },
      {
        text: "I don't trust you. I'll find my own way.",
        nextDialog: "dark_priestess_rejection"
      }
    ]
  },
  
  // The Bound Spirit
  bound_spirit: {
    character: {
      name: 'Ethereal Presence',
      portrait: '/images/portraits/bound-spirit.jpg'
    },
    text: [
      "...free... me...",
      "Centuries... bound... by their magic...",
      "Help me... and I will reveal... the secret path..."
    ],
    responses: [
      {
        text: "How can I free you?",
        nextDialog: "bound_spirit_freedom"
      },
      {
        text: "What secret path do you speak of?",
        nextDialog: "bound_spirit_path"
      },
      {
        text: "I sense deception. I will not help you.",
        nextDialog: "bound_spirit_refusal"
      }
    ]
  },
  
  // Guardian of Knowledge
  guardian_of_knowledge: {
    character: {
      name: 'The Keeper',
      portrait: '/images/portraits/guardian.jpg'
    },
    text: [
      "Halt, wanderer. The archives beyond are not for mortal eyes.",
      "Countless secrets lie within - knowledge that shaped Eden's Hollow into what it is today.",
      "Prove your worthiness, and I may grant you passage. Fail, and your mind will shatter beneath the weight of truths it cannot bear."
    ],
    responses: [
      {
        text: "I seek only specific knowledge, not all your secrets.",
        nextDialog: "guardian_knowledge_specific"
      },
      {
        text: "How can I prove my worthiness?",
        nextDialog: "guardian_knowledge_test"
      },
      {
        text: "I'll find another way to learn what I need.",
        nextDialog: "guardian_knowledge_departure"
      }
    ]
  },
  
  // Village Elder
  village_elder: {
    character: {
      name: 'Griseld',
      portrait: '/images/portraits/village-elder.jpg'
    },
    text: [
      "Stranger... you should not be here. This village belongs to the dead now.",
      "We who remain are but echoes, bound to this place by ancient magic and bitter regret.",
      "The well in the square is the heart of our curse. From it rises the crystal heart that keeps us chained to this half-life."
    ],
    responses: [
      {
        text: "Tell me more about the well and the crystal heart.",
        nextDialog: "village_elder_well"
      },
      {
        text: "Is there a way to break this curse?",
        nextDialog: "village_elder_curse"
      },
      {
        text: "I'm sorry for your fate. I'll leave you in peace.",
        nextDialog: "village_elder_departure"
      }
    ]
  },
  
  // Dark Knight
  dark_knight: {
    character: {
      name: 'Sir Malgrave',
      portrait: '/images/portraits/dark-knight.jpg'
    },
    text: [
      "Stand and declare yourself, trespasser. Few walk these halls unbidden.",
      "I was once the captain of the royal guard, before... the change. Now I serve a different master.",
      "The throne room ahead is forbidden to all but the most devoted servants. Turn back now, while you still can."
    ],
    responses: [
      {
        text: "What change do you speak of?",
        nextDialog: "dark_knight_change"
      },
      {
        text: "I seek an audience with your master.",
        nextDialog: "dark_knight_audience"
      },
      {
        text: "I challenge you, knight. Stand aside or fall.",
        nextDialog: "dark_knight_challenge"
      }
    ]
  },
  
  // The Whispering One
  whispering_one: {
    character: {
      name: 'Nameless Entity',
      portrait: '/images/portraits/whispering-one.jpg'
    },
    text: [
      "...at last... a vessel approaches...",
      "I have waited so long... watching from between worlds... seeking one like you...",
      "The ritual remains incomplete... the old gods hunger... will you be the one to finish what was started?"
    ],
    responses: [
      {
        text: "What ritual do you speak of?",
        nextDialog: "whispering_one_ritual"
      },
      {
        text: "I am no one's vessel.",
        nextDialog: "whispering_one_rejection"
      },
      {
        text: "Tell me how to complete the ritual.",
        nextDialog: "whispering_one_completion"
      }
    ]
  },
  
  // Library Ghost
  library_ghost: {
    character: {
      name: 'Spectral Librarian',
      portrait: '/images/portraits/library-ghost.jpg'
    },
    text: [
      "Welcome to the archives, seeker. Few find their way here anymore.",
      "I have maintained these collections for centuries, cataloging the history and secrets of Eden's Hollow even as my physical form faded to dust.",
      "Tell me what knowledge you seek, and I shall guide you to the appropriate texts - if you prove yourself worthy of such revelations."
    ],
    responses: [
      {
        text: "I seek information on the ritual of binding.",
        nextDialog: "library_ghost_ritual"
      },
      {
        text: "Tell me about the true history of Eden's Hollow.",
        nextDialog: "library_ghost_history"
      },
      {
        text: "I'm just browsing. What notable volumes do you recommend?",
        nextDialog: "library_ghost_recommendations"
      }
    ]
  }
};