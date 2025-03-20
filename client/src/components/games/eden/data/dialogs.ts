import { Dialog } from '../types';

// Map of all game dialogs
const dialogs: Record<string, Dialog> = {
  // Mysterious whispers dialog
  'mysterious_whisper': {
    id: 'mysterious_whisper',
    content: [
      {
        text: "As you speak to the corpse, a cold whisper responds from behind you. You turn quickly, but there's no one there. The voice seems to come from everywhere and nowhere at once.",
        speaker: {
          name: "Whisper",
          color: "#a0c0ff"
        }
      },
      {
        text: "...visitor... it has been so long... so very long since we've had... company...",
        speaker: {
          name: "Whisper",
          color: "#a0c0ff"
        }
      },
      {
        text: "You feel a chill run down your spine as the voice continues to speak, seemingly delighted by your presence.",
        speaker: {
          name: "Narrator",
          color: "#ffffff"
        }
      },
      {
        text: "What brings you to Eden's Hollow? So few come willingly... so few... and none leave unchanged...",
        speaker: {
          name: "Whisper",
          color: "#a0c0ff"
        },
        responses: [
          {
            text: "I'm exploring this abandoned village.",
            nextIndex: 4,
            outcome: {
              status: { 'told_whisper_exploring': true }
            }
          },
          {
            text: "Who or what are you?",
            nextIndex: 5,
            outcome: {
              status: { 'asked_whisper_identity': true }
            }
          },
          {
            text: "What happened to this place?",
            nextIndex: 6,
            outcome: {
              status: { 'asked_whisper_about_village': true }
            }
          },
          {
            text: "Leave me alone! (End conversation)",
            nextIndex: 7,
            outcome: {
              status: { 'rejected_whisper': true }
            }
          }
        ]
      },
      {
        text: "Exploring? Yes... there is much to discover here. Secrets buried deep. Some should remain buried, others... perhaps not. Look beneath the fountain, stranger. That's where it all began...",
        speaker: {
          name: "Whisper",
          color: "#a0c0ff"
        },
        responses: [
          {
            text: "What's beneath the fountain?",
            nextIndex: 8
          },
          {
            text: "Who are you?",
            nextIndex: 5
          }
        ]
      },
      {
        text: "I am... a memory. An echo. Once I had a name, a life... but now I am bound to this place, like all who remained. You may call me... the Hollow One.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Are you a ghost?",
            nextIndex: 9
          },
          {
            text: "What happened to this village?",
            nextIndex: 6
          }
        ]
      },
      {
        text: "Eden's Hollow was once prosperous, peaceful. Then we dug too deep... found something ancient beneath the fountain. The water changed. Those who drank became... different. Obsessed. Then the fog came, and with it... the hunger.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "What was found beneath the fountain?",
            nextIndex: 8
          },
          {
            text: "What hunger do you mean?",
            nextIndex: 10
          }
        ]
      },
      {
        text: "The whispers fade as you reject them, but you can still feel a presence lingering, watching. There's a sense that your rejection has disappointed something ancient and patient.",
        speaker: {
          name: "Narrator",
          color: "#ffffff"
        }
      },
      {
        text: "An artifact... old beyond reckoning. Black stone that whispers to those who touch it. It promised knowledge, power... immortality. The mayor kept it secret at first, but its influence spread through the water. By the time we understood, it was too late.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Where is this artifact now?",
            nextIndex: 11
          },
          {
            text: "Can it be destroyed?",
            nextIndex: 12
          }
        ]
      },
      {
        text: "Ghost? Perhaps. Something between life and death. Not quite departed, not quite here. The artifact bound many of us to this place. We are... remnants. Echoes. Trapped between worlds.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "How can you be freed?",
            nextIndex: 13
          },
          {
            text: "Tell me about the artifact.",
            nextIndex: 8
          }
        ]
      },
      {
        text: "The hunger for knowledge became... something else. A literal hunger. Those most affected began to change. Their appetites grew strange, insatiable. They craved things no human should. When food ran out, they turned on each other.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Is it safe here now?",
            nextIndex: 14
          },
          {
            text: "Did anyone escape?",
            nextIndex: 15
          }
        ]
      },
      {
        text: "Still below, I would imagine. In the chambers beneath the town hall. That's where the 'faithful' moved it after the troubles began. They formed a cult around it, believing it would grant them transcendence. Instead, it gave them... transformation.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "How do I reach these chambers?",
            nextIndex: 16
          },
          {
            text: "What kind of transformation?",
            nextIndex: 17
          }
        ]
      },
      {
        text: "Destroyed? I... do not know. It has existed for millennia, perhaps longer. It was found in deep earth, encased in strange metal. Those who tried to damage it suffered... terribly. Their minds broke first, then their bodies.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "What happens if I find it?",
            nextIndex: 18
          },
          {
            text: "I need to see it for myself.",
            nextIndex: 16
          }
        ]
      },
      {
        text: "Freedom... a distant hope. Some believe if the artifact is removed or its power contained, we might pass beyond. Others think we must resolve what bound us here - guilt, fear, unfinished business. I simply wish for rest.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I'll help if I can.",
            nextIndex: 19,
            outcome: {
              status: { 'promised_to_help_spirit': true }
            }
          },
          {
            text: "I'll find the artifact.",
            nextIndex: 16,
            outcome: {
              status: { 'determined_to_find_artifact': true }
            }
          }
        ]
      },
      {
        text: "Safe? No. The changed ones still lurk in shadows and forgotten places. They sleep during day, hunt at night. And the artifact's influence remains, growing stronger as you draw nearer to it. Your mind will feel its pull.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "How can I protect myself?",
            nextIndex: 20
          },
          {
            text: "I should leave while I can.",
            nextIndex: 21
          }
        ]
      },
      {
        text: "A few fled in the early days, before the roads vanished in fog. Whether they truly escaped or simply died elsewhere, I cannot say. The fog has a way of leading you back here, no matter which direction you travel.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Is there no way out?",
            nextIndex: 22
          },
          {
            text: "I need to find that artifact.",
            nextIndex: 16
          }
        ]
      },
      {
        text: "The town hall contains a hidden passage. You'll need a key - the mayor's key, likely in his office or home. And be wary of symbols on the floor - step only where the crescent moon marks the path, or traps will trigger.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Where is the mayor's home or office?",
            nextIndex: 23
          },
          {
            text: "What dangers should I expect below?",
            nextIndex: 24
          }
        ]
      },
      {
        text: "Their bodies twisted, elongated. Skin hardened like bark in some, became translucent in others. Minds fractured, filled with whispers not their own. The most devoted became vessels, their humanity hollowed out to make room for... something else.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Are these... things still alive?",
            nextIndex: 25
          },
          {
            text: "I need to see for myself.",
            nextIndex: 16
          }
        ]
      },
      {
        text: "It will call to you, promise what you most desire. Knowledge, power, reunions with lost loved ones. All lies, or twisted truths. Whatever you see or hear, do not touch the black stone with bare skin. That's how it begins.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "How do I safely handle it?",
            nextIndex: 26
          },
          {
            text: "What if I destroy it?",
            nextIndex: 12
          }
        ]
      },
      {
        text: "Your kindness is... unexpected. If you truly wish to help, find the old journal in the library. My journal. It contains rituals that might sever the artifact's hold. And... there's something in the tavern cellar you should find.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "What's in the cellar?",
            nextIndex: 27
          },
          {
            text: "I'll find your journal.",
            nextIndex: 28,
            outcome: {
              status: { 'promised_to_find_journal': true }
            }
          }
        ]
      },
      {
        text: "Strong will helps. As does avoiding the water - any water - in this place. Some herbs growing in the forest repel the influence - blue flowers with golden centers. And iron, cold iron, weakens the changed ones if they attack.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Where can I find these herbs?",
            nextIndex: 29
          },
          {
            text: "Where can I get iron weapons?",
            nextIndex: 30
          }
        ]
      },
      {
        text: "You may try, but the fog surrounds Eden's Hollow for miles. It disorients, confuses. You'll walk for hours only to find yourself back here. The only way out may be to confront what lies beneath.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Then I'll find the artifact.",
            nextIndex: 16,
            outcome: {
              status: { 'determined_to_find_artifact': true }
            }
          },
          {
            text: "I need time to think about this.",
            nextIndex: 31
          }
        ]
      },
      {
        text: "There is one way, though few have found it. The artifact's influence has... thinned the boundaries between worlds. Find the standing stones in the forest clearing. At midnight, when fog is thickest, the right words might open a door.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "What are the right words?",
            nextIndex: 32
          },
          {
            text: "Where is this clearing?",
            nextIndex: 33
          }
        ]
      },
      {
        text: "The mayor's home stands on the hill overlooking the square - largest house with the stone fence. His office is in the town hall, east wing, second floor. Both likely locked. Check the tavern for keys - the barkeep kept spares.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Thank you for your help.",
            nextIndex: 34,
            outcome: {
              status: { 'thanked_hollow_one': true }
            }
          },
          {
            text: "What should I do once I find the artifact?",
            nextIndex: 35
          }
        ]
      },
      {
        text: "The changed ones dwell below - sensitive to light, but strong and fast. Traps guard the inner sanctum. And the artifact's influence grows stronger - you'll hear whispers, see visions of your deepest desires or fears.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I'll be careful.",
            nextIndex: 36,
            outcome: {
              status: { 'promised_caution': true }
            }
          },
          {
            text: "How do I fight the changed ones?",
            nextIndex: 37
          }
        ]
      },
      {
        text: "If alive is the right word. They don't eat, sleep, or breathe as we do. They serve the artifact's will. Some retain fragments of memory, hints of who they were. Most are... hollow. Animate but empty of true consciousness.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Can they be helped or cured?",
            nextIndex: 38
          },
          {
            text: "Can they be killed?",
            nextIndex: 37
          }
        ]
      },
      {
        text: "Cloth or leather won't suffice. There's a ritual - gloves made from a mix of iron filings, salt, and wax. Instructions are in my journal in the library. Without proper protection, your mind will fracture within moments of contact.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I'll find your journal.",
            nextIndex: 28,
            outcome: {
              status: { 'promised_to_find_journal': true }
            }
          },
          {
            text: "What should I do with the artifact?",
            nextIndex: 35
          }
        ]
      },
      {
        text: "A relic I stored there, hoping to counter the artifact's power. An amulet of silver and obsidian - it offers some protection against the whispers. And wine - special wine I brewed with the blue herbs. It will clear your mind if influence takes hold.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "How do I access the cellar?",
            nextIndex: 39
          },
          {
            text: "I'll find these items.",
            nextIndex: 40,
            outcome: {
              status: { 'promised_to_find_cellar_items': true }
            }
          }
        ]
      },
      {
        text: "The whisper seems to fade briefly, as if gathering thoughts or strength. When it returns, there's a hint of gratitude in its ethereal tone.",
        speaker: {
          name: "Narrator",
          color: "#ffffff"
        }
      },
      {
        text: "Look in the old greenhouse behind the doctor's house. The protective herbs grow there - cultivated for research when people began falling ill. Harvest only the blue flowers; the red ones that often grow alongside are toxic.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Where is the doctor's house?",
            nextIndex: 41
          },
          {
            text: "What do I do with the herbs?",
            nextIndex: 42
          }
        ]
      },
      {
        text: "The blacksmith's shop at the eastern edge of town. Look for a trap door beneath the main anvil - he kept his finest work hidden there. You'll find cold iron tools untainted by the artifact. The door requires a simple puzzle to open.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "What's the puzzle solution?",
            nextIndex: 43
          },
          {
            text: "Thank you for your help.",
            nextIndex: 34,
            outcome: {
              status: { 'thanked_hollow_one': true }
            }
          }
        ]
      },
      {
        text: "The presence seems to understand, though there's a hint of disappointment in the sudden chill that passes through the room. The whisper fades slightly, becoming more distant.",
        speaker: {
          name: "Narrator",
          color: "#ffffff"
        },
        responses: [
          {
            text: "I'll return when I'm ready.",
            nextIndex: 34,
            outcome: {
              status: { 'will_return_to_hollow_one': true }
            }
          }
        ]
      },
      {
        text: "The words are in my journal. A phrase in a language older than any you know. Written phonetically as: 'Ahn'kahet alar'vahesh nu divinius.' Speak it three times while walking counterclockwise around the center stone.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I'll remember that.",
            nextIndex: 44,
            outcome: {
              status: { 'learned_exit_ritual': true }
            }
          },
          {
            text: "Is there any other way out?",
            nextIndex: 45
          }
        ]
      },
      {
        text: "Northeast of the village, past the old mill. Follow the stream uphill until you reach a fork. Take the left path - the right leads to the mines where this all began. The clearing lies beyond a grove of twisted pines. You'll feel it before you see it.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "What will I feel?",
            nextIndex: 46
          },
          {
            text: "Thank you for your help.",
            nextIndex: 34,
            outcome: {
              status: { 'thanked_hollow_one': true }
            }
          }
        ]
      },
      {
        text: "You... are welcome. Few have spoken to me with kindness since I became... this. Perhaps in helping us, you help yourself. The fog parts for those who bring light to darkness. Remember that.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        }
      },
      {
        text: "It must be contained or removed. My journal details a ritual to bind it temporarily. Long enough to transport it from this place. Take it far from here, to deep water - an ocean trench if possible. Its influence weakens with distance and depth.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I understand.",
            nextIndex: 47,
            outcome: {
              status: { 'understands_artifact_plan': true }
            }
          },
          {
            text: "What if I can't take it that far?",
            nextIndex: 48
          }
        ]
      },
      {
        text: "Caution is wise. The changed ones can sense fear and doubt. Move with purpose. Trust nothing you see below ground unless you've verified it with touch. The artifact creates illusions - some beautiful, some horrific.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        }
      },
      {
        text: "They're vulnerable to light, especially sunlight or flame. Cold iron wounds them where steel might not. They're fast but predictable - they always attack the eyes first. Cover your face if confronted. And they cannot cross running water.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Thank you for the advice.",
            nextIndex: 49,
            outcome: {
              status: { 'knows_how_to_fight_changed': true }
            }
          },
          {
            text: "How many of them are there?",
            nextIndex: 50
          }
        ]
      },
      {
        text: "Cured? I don't know. Those recently changed might be reached, but those who've served for years are lost. Their bodies and minds have transformed too completely. Freedom for them may only come through the artifact's removal... or destruction.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "How would I reach the recently changed?",
            nextIndex: 51
          },
          {
            text: "I'll focus on the artifact then.",
            nextIndex: 35
          }
        ]
      },
      {
        text: "Trapdoor behind the bar, hidden beneath a wine rack. The key should be in the till or perhaps... yes, check the corpse at that corner table. That's the barkeep - my old friend. He wore the cellar key on a chain around his neck.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I'll find it.",
            nextIndex: 40,
            outcome: {
              status: { 'promised_to_find_cellar_items': true },
              item: 'cellar_key'
            }
          },
          {
            text: "Was the barkeep your friend?",
            nextIndex: 52
          }
        ]
      },
      {
        text: "The Hollow One's presence seems pleased, a subtle warmth replacing the previous chill in the air. The whispers grow clearer, more focused.",
        speaker: {
          name: "Narrator",
          color: "#ffffff"
        }
      },
      {
        text: "Small blue cottage on the west side of town, near the creek. The greenhouse is glass and iron, partially collapsed now. Be careful inside - the floor has rotted in places. The herbs grow in copper pots along the eastern wall.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I'll find it.",
            nextIndex: 53,
            outcome: {
              status: { 'promised_to_find_herbs': true }
            }
          },
          {
            text: "Was the doctor trying to stop this?",
            nextIndex: 54
          }
        ]
      },
      {
        text: "Brew them in boiled water, drink as tea. You can also crush them and mix with wax to make a salve - apply to temples and wrists for protection. The most potent use requires distillation, but that's detailed in my journal.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Thank you for explaining.",
            nextIndex: 55,
            outcome: {
              status: { 'knows_herb_uses': true }
            }
          },
          {
            text: "I should go find these things.",
            nextIndex: 56,
            outcome: {
              status: { 'ready_to_explore': true }
            }
          }
        ]
      },
      {
        text: "Arrange the small anvils in the shape of a pentagram. Place hammer at top point, tongs at bottom left, and bellows at bottom right. Strike the center anvil three times, then pull the leather strap beneath it. Simple, but effectiveagainst thieves.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I'll try to remember all that.",
            nextIndex: 57,
            outcome: {
              status: { 'knows_blacksmith_puzzle': true }
            }
          },
          {
            text: "I should go now.",
            nextIndex: 56,
            outcome: {
              status: { 'ready_to_explore': true }
            }
          }
        ]
      },
      {
        text: "I've told you much, stranger. More than I've spoken in... decades? Centuries? Time moves strangely here. Remember what you've learned. Trust little, question everything. And if you hear singing beneath the earth, run.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        }
      },
      {
        text: "Only the ritual in the forest. Any other exits from Eden's Hollow are... unreliable. Some lead to worse places. Others simply bring you back, but... changed. The forest ritual is dangerous, but it's the only way I know to be sure.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I understand.",
            nextIndex: 58,
            outcome: {
              status: { 'understands_exit_dangers': true }
            }
          }
        ]
      },
      {
        text: "A stillness. A weight. The air there feels heavy yet empty at once. Sounds become muted. You might see... shadows of things not quite there. The stones stand at a junction between worlds. It's not a natural place.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Is it dangerous?",
            nextIndex: 59
          },
          {
            text: "I'll be careful.",
            nextIndex: 36,
            outcome: {
              status: { 'promised_caution': true }
            }
          }
        ]
      },
      {
        text: "Then there's another way. A binding ritual - in my journal - can contain it indefinitely. You must encase it in a mixture of salt, iron, and the blue herbs, then bury it beneath running water. The ritual must be performed at dawn.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I'll find your journal.",
            nextIndex: 28,
            outcome: {
              status: { 'promised_to_find_journal': true }
            }
          },
          {
            text: "Why dawn specifically?",
            nextIndex: 60
          }
        ]
      },
      {
        text: "Then you must work quickly. Once contained, you have just days before the binding weakens. Take it as far as possible from people. Bury it deep. Mark no graves, build no monuments. Let it be forgotten. That's the only safety.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I understand.",
            nextIndex: 61,
            outcome: {
              status: { 'understands_artifact_plan': true }
            }
          }
        ]
      },
      {
        text: "You're welcome. Remember, they hunt by sound first, then smell. Move quietly. If discovered, create noise away from your position to distract them. They communicate through clicks and whistles - if you hear those sounds, you've been spotted.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        }
      },
      {
        text: "Dozens at least. But many are dormant - hibernating in cocoon-like structures. Avoid disturbing these at all costs. The awakened ones serve as guardians, primarily in the tunnels beneath the town hall and near the fountain chamber.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I'll remember that.",
            nextIndex: 62,
            outcome: {
              status: { 'knows_changed_locations': true }
            }
          }
        ]
      },
      {
        text: "Speak their original names - it causes pain but may awaken memories. Show them objects from their past lives. But be cautious - this can trigger violent responses. The blue herb tea may help, forced down their throats if necessary.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "How would I know their names?",
            nextIndex: 63
          },
          {
            text: "That sounds risky.",
            nextIndex: 64
          }
        ]
      },
      {
        text: "Yes. Thomas was... kind. Listened to troubles, offered solutions. He suspected something was wrong early on. Tried to warn people about the water. They didn't listen. He stayed to help evacuate the elderly. Paid with his life... and after.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I'm sorry.",
            nextIndex: 65,
            outcome: {
              status: { 'expressed_sympathy': true }
            }
          },
          {
            text: "What do you mean 'and after'?",
            nextIndex: 66
          }
        ]
      },
      {
        text: "The Hollow One's presence seems to brighten slightly, as if your promise has given it some small measure of hope. The whispers become more energetic.",
        speaker: {
          name: "Narrator",
          color: "#ffffff"
        }
      },
      {
        text: "She was. Dr. Elizabeth Gray. Brilliant woman. She identified the contaminant in the water, developed the herbal countermeasure. She was working on a cure when they took her - the changed ones. Her notes might still be in her office. Valuable.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I'll look for her notes too.",
            nextIndex: 67,
            outcome: {
              status: { 'will_find_doctor_notes': true }
            }
          },
          {
            text: "Did anyone else try to help?",
            nextIndex: 68
          }
        ]
      },
      {
        text: "Your courtesy is... refreshing. Most who visit Eden's Hollow only take. Demand. I was the village librarian before... this. I've always believed in the power of shared knowledge. Perhaps that's why some part of me remains.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        }
      },
      {
        text: "The Hollow One's presence seems to shift slightly, as if turning toward the door. The whispers become more urgent, pushing you toward action.",
        speaker: {
          name: "Narrator",
          color: "#ffffff"
        }
      },
      {
        text: "The whisper seems approving, though there's an undercurrent of anxiety. The temperature in the room fluctuates slightly as the presence shifts around you.",
        speaker: {
          name: "Narrator",
          color: "#ffffff"
        }
      },
      {
        text: "Only marginally. The place has a certain... hunger. It doesn't distinguish between visitors and residents. Stay on the path, perform the ritual correctly, and leave immediately once the way opens. Don't look back, and don't respond to voices.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Thank you for the warning.",
            nextIndex: 34,
            outcome: {
              status: { 'thanked_hollow_one': true }
            }
          },
          {
            text: "What happens if I look back?",
            nextIndex: 69
          }
        ]
      },
      {
        text: "The dawn represents transition - neither night nor day fully. The artifact exists in a similar state, neither fully in our world nor its own. This alignment weakens its defenses. The ritual uses this vulnerability to bind its power.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I see. Thank you for explaining.",
            nextIndex: 70,
            outcome: {
              status: { 'understands_dawn_ritual': true }
            }
          }
        ]
      },
      {
        text: "Good. Knowledge is your best weapon here. Ignorance claimed most who fell. I must... rest now. Speaking like this requires... effort. Return if you need more guidance. I'll be here. I'm always here.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        }
      },
      {
        text: "The Hollow One seems to fade slightly, its presence becoming dimmer as if exhausted by the extended conversation. The whispers become fainter, but still audible.",
        speaker: {
          name: "Narrator",
          color: "#ffffff"
        }
      },
      {
        text: "The town hall records room - there's a census book with photographs. Or check homes for family portraits. Most changed ones still wear or carry identification - a pocket watch, a badge, jewelry. Look for these.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I'll keep that in mind.",
            nextIndex: 71,
            outcome: {
              status: { 'knows_about_identification': true }
            }
          }
        ]
      },
      {
        text: "Extremely. They're stronger, faster than humans. Their skin often forms natural armor. Some secrete toxins. Don't attempt this unless absolutely necessary. The blue herb protection is your priority. The artifact is the true threat.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I understand.",
            nextIndex: 61,
            outcome: {
              status: { 'understands_artifact_plan': true }
            }
          }
        ]
      },
      {
        text: "For a moment, the whisper seems taken aback by your empathy. There's a surprised pause before it continues, the voice slightly warmer than before.",
        speaker: {
          name: "Narrator",
          color: "#ffffff"
        }
      },
      {
        text: "They took his body after death. Used it for... experiments. Testing the artifact's power to animate the dead. He was among the first revenants - not quite changed ones, not quite... like me. Something between. He suffered greatly.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Can he be freed somehow?",
            nextIndex: 72
          },
          {
            text: "I should look for the items now.",
            nextIndex: 56,
            outcome: {
              status: { 'ready_to_explore': true }
            }
          }
        ]
      },
      {
        text: "The Hollow One's presence brightens noticeably at your offer. There's a surge of what feels like gratitude in the air around you.",
        speaker: {
          name: "Narrator",
          color: "#ffffff"
        }
      },
      {
        text: "A few. The sheriff organized an evacuation. The priest tried exorcisms. Some formed a resistance, fighting the changed ones with fire and iron. All failed eventually. Those who didn't escape either died, changed, or... became like me.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "What about you? What's your story?",
            nextIndex: 73
          },
          {
            text: "I should go find these things now.",
            nextIndex: 56,
            outcome: {
              status: { 'ready_to_explore': true }
            }
          }
        ]
      },
      {
        text: "The others following you will seem real - people you've known, loved ones long gone. They'll beg you to turn around, to help them. But they're not real. They're reflections of your mind, twisted by the boundary between worlds.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "And if I do look back?",
            nextIndex: 74
          },
          {
            text: "I'll keep my eyes forward.",
            nextIndex: 75,
            outcome: {
              status: { 'will_not_look_back': true }
            }
          }
        ]
      },
      {
        text: "The Hollow One's presence flickers with what might be approval. The temperature around you warms slightly.",
        speaker: {
          name: "Narrator",
          color: "#ffffff"
        }
      },
      {
        text: "A note, a signature of acknowledgment. Even small gestures like this make... existence more bearable. Forgive my sentiment. It's been long since anyone... listened.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        }
      },
      {
        text: "Perhaps. His revenant form might be released if the artifact is contained. Or through a ritual of peace - in my journal, again. It requires personal items he valued in life. His favorite whiskey bottle should still be behind the bar.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I'll try to help him too.",
            nextIndex: 76,
            outcome: {
              status: { 'will_help_barkeep': true }
            }
          },
          {
            text: "I need to focus on the artifact first.",
            nextIndex: 77
          }
        ]
      },
      {
        text: "I was James Thorne. Village librarian and historian. I studied the occult as academic pursuit. When things began, I recognized signs from ancient texts. I tried to organize countermeasures, but it was too late. I died in the library fire.",
        speaker: {
          name: "James Thorne",
          color: "#c09fff"
        },
        responses: [
          {
            text: "How did you become... this?",
            nextIndex: 78
          },
          {
            text: "I'm sorry for what happened to you.",
            nextIndex: 79,
            outcome: {
              status: { 'expressed_sympathy_for_thorne': true }
            }
          }
        ]
      },
      {
        text: "You join them. The boundary claims you. You become another voice, another shadow calling to future travelers. Neither alive nor dead, just... here. Forever. The standing stones have claimed many who couldn't resist looking back.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I understand. I'll be careful.",
            nextIndex: 80,
            outcome: {
              status: { 'fully_understands_standing_stones': true }
            }
          }
        ]
      },
      {
        text: "Wise. The path forward is always safer than looking back, especially in places where reality thins. One final warning - the ritual only works at certain times. The moon must be visible, even faintly. No moon, no passage.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Thank you for all your help.",
            nextIndex: 34,
            outcome: {
              status: { 'thanked_hollow_one': true }
            }
          }
        ]
      },
      {
        text: "Your kindness is unexpected but... welcome. Thomas deserves peace. His whiskey is Dalmore 18 - distinctive blue bottle with silver cap. His pocket watch should be on his body. And find the letter in his breast pocket - from his daughter.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I'll gather these things.",
            nextIndex: 81,
            outcome: {
              status: { 'will_gather_thomas_items': true }
            }
          }
        ]
      },
      {
        text: "A practical approach. Yes, the artifact must be the priority. Without addressing it, no one finds peace - not Thomas, not me, not even you eventually. The infection of this place spreads to all who linger.",
        speaker: {
          name: "The Hollow One",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I'll move quickly then.",
            nextIndex: 56,
            outcome: {
              status: { 'ready_to_explore': true }
            }
          }
        ]
      },
      {
        text: "My research... ironically protected me from complete dissolution. I understood enough to resist full corruption. As my body burned, my consciousness separated but remained tethered to this reality. I exist as memory and will, nothing more.",
        speaker: {
          name: "James Thorne",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Can you be freed like the others?",
            nextIndex: 82
          },
          {
            text: "I'll find your journal and help.",
            nextIndex: 83,
            outcome: {
              status: { 'committed_to_helping_thorne': true }
            }
          }
        ]
      },
      {
        text: "A sincere sentiment, I believe. I've existed long enough to recognize truth in a human voice. Your compassion is... noteworthy. This place rarely attracts the compassionate. They sense the darkness and stay away.",
        speaker: {
          name: "James Thorne",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I'll do what I can to help you.",
            nextIndex: 83,
            outcome: {
              status: { 'committed_to_helping_thorne': true }
            }
          },
          {
            text: "I should go now.",
            nextIndex: 56,
            outcome: {
              status: { 'ready_to_explore': true }
            }
          }
        ]
      },
      {
        text: "The Hollow One - now revealed as James Thorne - seems to gather himself for one final push of energy. The whispers become clear and focused once more.",
        speaker: {
          name: "Narrator",
          color: "#ffffff"
        }
      },
      {
        text: "The whisper fades slightly, as if the spirit is gathering strength. When it returns, there's a touch of what might be hope in its ethereal voice.",
        speaker: {
          name: "Narrator",
          color: "#ffffff"
        }
      },
      {
        text: "Perhaps. If the artifact is contained, if the proper rituals are performed... I might pass beyond. My consciousness has remained partially because my work was unfinished. My research could have saved this place. That regret anchors me.",
        speaker: {
          name: "James Thorne",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I'll complete your work.",
            nextIndex: 84,
            outcome: {
              status: { 'will_complete_thornes_work': true }
            }
          },
          {
            text: "What research specifically?",
            nextIndex: 85
          }
        ]
      },
      {
        text: "Before you go - one final warning. Trust your instincts. If something feels wrong, it likely is. The artifact distorts perception, plants suggestions. Question what you see, especially if it's exactly what you want to see. Now go. Time grows short.",
        speaker: {
          name: "James Thorne",
          color: "#c09fff"
        }
      },
      {
        text: "That promise means more than you know. If my research could save even one person from this fate, perhaps my existence held purpose. The library key is in a hollow book - 'Myths of the Ancient World' - third shelf, eastern wall. Be careful. Be wise.",
        speaker: {
          name: "James Thorne",
          color: "#c09fff"
        }
      },
      {
        text: "The binding rituals mainly. I discovered the artifact isn't unique - others exist, scattered across the world. Each outbreak similar to ours. I was translating texts that described successful containment procedures when the changed ones attacked.",
        speaker: {
          name: "James Thorne",
          color: "#c09fff"
        },
        responses: [
          {
            text: "Where did you find these texts?",
            nextIndex: 86
          },
          {
            text: "I'll find and finish your translations.",
            nextIndex: 84,
            outcome: {
              status: { 'will_complete_thornes_work': true }
            }
          }
        ]
      },
      {
        text: "University archives initially. Then private collections. The most valuable came from a secret chamber beneath the church. Father Michael had accumulated knowledge of similar events dating back centuries. Look for a hidden room behind the altar.",
        speaker: {
          name: "James Thorne",
          color: "#c09fff"
        },
        responses: [
          {
            text: "I'll check both locations.",
            nextIndex: 87,
            outcome: {
              status: { 'will_check_church': true }
            }
          },
          {
            text: "I should go now.",
            nextIndex: 56,
            outcome: {
              status: { 'ready_to_explore': true }
            }
          }
        ]
      },
      {
        text: "The whisper of James Thorne grows fainter, as if he's expended nearly all his energy in this long conversation. His final words come as barely audible impressions in your mind.",
        speaker: {
          name: "Narrator",
          color: "#ffffff"
        }
      }
    ]
  }
};

export default dialogs;