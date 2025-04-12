import { GameSettings } from "../types";

export const defaultGameSettings: GameSettings = {
  typewriterSpeed: 40,
  soundEnabled: true,
  musicEnabled: true
};

export const saveGameSettings = (settings: GameSettings): void => {
  localStorage.setItem('darkEchoes_settings', JSON.stringify(settings));
};

export const loadGameSettings = (): GameSettings => {
  const savedSettings = localStorage.getItem('darkEchoes_settings');
  if (savedSettings) {
    try {
      return JSON.parse(savedSettings);
    } catch (e) {
      console.error('Failed to parse saved settings:', e);
    }
  }
  return defaultGameSettings;
};
