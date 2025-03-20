import { Item } from '../types';

/**
 * Items available in Eden's Hollow
 * These can be collected and used by the player
 */
export const gameItems: Record<string, Item> = {
  // General items
  torn_page: {
    id: 'torn_page',
    name: 'Torn Page',
    description: 'A torn page from what appears to be a journal. The writing is smudged, but you can make out something about "five children" and "the sacrifice."',
    isConsumable: false,
    isUsable: true,
    useEffect: {
      message: 'You read the torn page again, but discover no new information.'
    }
  },
  
  rusty_key: {
    id: 'rusty_key',
    name: 'Rusty Key',
    description: 'An old iron key, heavily rusted. It could fit any number of locks in the village.',
    isConsumable: false,
    isUsable: false
  },
  
  strange_amulet: {
    id: 'strange_amulet',
    name: 'Strange Amulet',
    description: 'A peculiar amulet made of tarnished silver. It\'s inscribed with five symbols around its edge - the same symbols as on the church altar.',
    isConsumable: false,
    isUsable: true,
    useEffect: {
      message: 'The amulet feels cold to the touch, and for a moment you swear you hear children\'s whispers emanating from it.'
    }
  },
  
  // Consumable items
  bread: {
    id: 'bread',
    name: 'Stale Bread',
    description: 'A hard loaf of bread. Despite being stale, it looks edible and could restore some health.',
    isConsumable: true,
    isUsable: true,
    useEffect: {
      health: 15,
      message: 'You eat the stale bread. It\'s not great, but you feel a bit better.'
    }
  },
  
  herbal_tea: {
    id: 'herbal_tea',
    name: 'Herbal Tea',
    description: 'A small flask of strange-smelling herbal tea. The innkeeper claimed it would "restore your energy."',
    isConsumable: true,
    isUsable: true,
    useEffect: {
      mana: 20,
      message: 'You drink the tea. It tastes bitter but invigorating.'
    }
  },
  
  healing_herbs: {
    id: 'healing_herbs',
    name: 'Healing Herbs',
    description: 'Medicinal herbs that grow only in the forest around Eden\'s Hollow. They have powerful restorative properties.',
    isConsumable: true,
    isUsable: true,
    useEffect: {
      health: 30,
      message: 'You apply the herbs to your wounds. They have a soothing effect.'
    }
  },
  
  // Quest items and keys
  ornate_key: {
    id: 'ornate_key',
    name: 'Ornate Key',
    description: 'A beautifully crafted key with intricate engravings. It looks like it would fit the lock of something important.',
    isConsumable: false,
    isUsable: false
  },
  
  pastor_diary: {
    id: 'pastor_diary',
    name: 'Pastor\'s Diary',
    description: 'The diary of Pastor Blackwood from 1891. Many pages are torn out, but the remaining entries speak of "the ritual" and "necessary sacrifice."',
    isConsumable: false,
    isUsable: true,
    useEffect: {
      status: { read_pastor_diary: true },
      message: 'You read through more of the diary. One entry catches your eye: "The children must be marked with the symbols. Only then will the circle be complete."'
    }
  },
  
  lantern: {
    id: 'lantern',
    name: 'Old Lantern',
    description: 'A oil-burning lantern that provides light in dark areas. It looks well-used but functional.',
    isConsumable: false,
    isUsable: true,
    useEffect: {
      status: { has_light: true },
      message: 'You light the lantern. Its warm glow illuminates the darkness around you.'
    }
  },
  
  pocket_watch: {
    id: 'pocket_watch',
    name: 'Pocket Watch',
    description: 'An antique silver pocket watch that hasn\'t ticked in years. The time is frozen at 3:17.',
    isConsumable: false,
    isUsable: true,
    useEffect: {
      message: 'You open the pocket watch. The inside of the case has an inscription: "To remember the five who were lost. Time stands still at the moment of choice."'
    }
  },
  
  music_box: {
    id: 'music_box',
    name: 'Child\'s Music Box',
    description: 'A small wooden music box with a dancing ballerina. It plays a haunting lullaby when wound up.',
    isConsumable: false,
    isUsable: true,
    useEffect: {
      message: 'You wind up the music box. It plays a melancholy tune that sounds like a children\'s nursery rhyme, but with disturbing lyrics about "the dark one" and "the endless sleep."'
    }
  },
  
  church_candle: {
    id: 'church_candle',
    name: 'Black Candle',
    description: 'A pure black candle from the church storage. It smells faintly of beeswax and something metallic.',
    isConsumable: false,
    isUsable: true,
    useEffect: {
      message: 'You light the candle. Its flame burns with an unusual steadiness, casting strange shadows that seem to move of their own accord.'
    }
  },
  
  ritual_dagger: {
    id: 'ritual_dagger',
    name: 'Ceremonial Dagger',
    description: 'An ornate dagger with a bone handle and symbols etched into the blade. It doesn\'t appear to have been designed for combat.',
    isConsumable: false,
    isUsable: true,
    useEffect: {
      message: 'You examine the dagger closely. The symbols match those in the ritual circle. There are dark stains on the blade that you suspect might be old blood.'
    }
  }
};