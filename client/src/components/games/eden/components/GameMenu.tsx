import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Upload, Settings as SettingsIcon, LogOut } from 'lucide-react';

// Types
import { GameState } from '../types';

export interface GameSettings {
  textSpeed: 'slow' | 'medium' | 'fast';
  volume: number;
  darkMode: boolean;
  showHints: boolean;
  language: string;
  autoSave: boolean;
}

export interface SaveGame {
  id: string;
  timestamp: string;
  name?: string;
  screenshot?: string;
  lastScene?: string;
}

interface GameMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onLoad: (saveId: string) => void;
  onSettingsChange: (settings: Partial<GameSettings>) => void;
  onQuit: () => void;
  savedGames: SaveGame[];
  currentState: GameState;
  settings: GameSettings;
}

const GameMenu: React.FC<GameMenuProps> = ({
  isOpen,
  onClose,
  onSave,
  onLoad,
  onSettingsChange,
  onQuit,
  savedGames,
  currentState,
  settings
}) => {
  const [activeTab, setActiveTab] = useState<'save' | 'load' | 'settings'>('settings');
  const [volume, setVolume] = useState(settings.volume);
  const [textSpeed, setTextSpeed] = useState(settings.textSpeed);
  const [darkMode, setDarkMode] = useState(settings.darkMode);
  const [showHints, setShowHints] = useState(settings.showHints);
  const [autoSave, setAutoSave] = useState(settings.autoSave);
  
  if (!isOpen) return null;
  
  const handleSave = () => {
    onSave();
  };
  
  const handleLoad = (saveId: string) => {
    onLoad(saveId);
    onClose();
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    onSettingsChange({ volume: newVolume });
  };
  
  const handleTextSpeedChange = (speed: 'slow' | 'medium' | 'fast') => {
    setTextSpeed(speed);
    onSettingsChange({ textSpeed: speed });
  };
  
  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    onSettingsChange({ darkMode: newDarkMode });
  };
  
  const handleHintsToggle = () => {
    const newShowHints = !showHints;
    setShowHints(newShowHints);
    onSettingsChange({ showHints: newShowHints });
  };
  
  const handleAutoSaveToggle = () => {
    const newAutoSave = !autoSave;
    setAutoSave(newAutoSave);
    onSettingsChange({ autoSave: newAutoSave });
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative bg-gray-900 text-white rounded-lg w-full max-w-xl p-6 shadow-xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-serif mb-6">Game Menu</h2>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button 
            onClick={() => setActiveTab('save')}
            className={`py-2 px-4 ${activeTab === 'save' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'}`}
          >
            <div className="flex items-center">
              <Save size={16} className="mr-2" />
              Save
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('load')}
            className={`py-2 px-4 ${activeTab === 'load' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'}`}
          >
            <div className="flex items-center">
              <Upload size={16} className="mr-2" />
              Load
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-4 ${activeTab === 'settings' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'}`}
          >
            <div className="flex items-center">
              <SettingsIcon size={16} className="mr-2" />
              Settings
            </div>
          </button>
        </div>
        
        {/* Tab content */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {activeTab === 'save' && (
              <motion.div
                key="save"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Save Current Game</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Your current progress in {currentState.currentScene && currentState.currentScene.split('_').join(' ')}
                  </p>
                  <button 
                    onClick={handleSave}
                    className="w-full py-2 px-4 bg-amber-700 hover:bg-amber-600 rounded-md font-medium"
                  >
                    Save Game
                  </button>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'load' && (
              <motion.div
                key="load"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg font-medium mb-2">Load Game</h3>
                {savedGames.length === 0 ? (
                  <p className="text-gray-400 text-sm">No saved games found.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {savedGames.map(save => (
                      <div 
                        key={save.id}
                        className="flex items-center justify-between bg-gray-800 rounded-md p-3 cursor-pointer hover:bg-gray-700"
                        onClick={() => handleLoad(save.id)}
                      >
                        <div>
                          <p className="font-medium">{save.name || 'Saved Game'}</p>
                          <p className="text-gray-400 text-xs">{new Date(save.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="w-16 h-16 bg-gray-900 rounded-md overflow-hidden">
                          {save.screenshot ? (
                            <img 
                              src={save.screenshot} 
                              alt="Save preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                              <p className="text-xs">No preview</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
            
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg font-medium mb-4">Game Settings</h3>
                
                <div className="space-y-6">
                  {/* Volume */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Volume</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Off</span>
                      <span>Max</span>
                    </div>
                  </div>
                  
                  {/* Text Speed */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Text Speed</label>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleTextSpeedChange('slow')}
                        className={`flex-1 py-1 px-2 rounded-md text-sm ${textSpeed === 'slow' ? 'bg-amber-700 text-white' : 'bg-gray-800 text-gray-300'}`}
                      >
                        Slow
                      </button>
                      <button 
                        onClick={() => handleTextSpeedChange('medium')}
                        className={`flex-1 py-1 px-2 rounded-md text-sm ${textSpeed === 'medium' ? 'bg-amber-700 text-white' : 'bg-gray-800 text-gray-300'}`}
                      >
                        Medium
                      </button>
                      <button 
                        onClick={() => handleTextSpeedChange('fast')}
                        className={`flex-1 py-1 px-2 rounded-md text-sm ${textSpeed === 'fast' ? 'bg-amber-700 text-white' : 'bg-gray-800 text-gray-300'}`}
                      >
                        Fast
                      </button>
                    </div>
                  </div>
                  
                  {/* Toggles */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Dark Mode</span>
                      <button 
                        onClick={handleDarkModeToggle}
                        className={`w-12 h-6 rounded-full ${darkMode ? 'bg-amber-700' : 'bg-gray-700'} relative transition-colors duration-200`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${darkMode ? 'left-7' : 'left-1'}`}></span>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Show Hints</span>
                      <button 
                        onClick={handleHintsToggle}
                        className={`w-12 h-6 rounded-full ${showHints ? 'bg-amber-700' : 'bg-gray-700'} relative transition-colors duration-200`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${showHints ? 'left-7' : 'left-1'}`}></span>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Auto-Save</span>
                      <button 
                        onClick={handleAutoSaveToggle}
                        className={`w-12 h-6 rounded-full ${autoSave ? 'bg-amber-700' : 'bg-gray-700'} relative transition-colors duration-200`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${autoSave ? 'left-7' : 'left-1'}`}></span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Quit button */}
        <div className="mt-8 pt-4 border-t border-gray-700">
          <button 
            onClick={onQuit}
            className="text-gray-400 hover:text-white flex items-center"
          >
            <LogOut size={16} className="mr-2" />
            Quit to Main Menu
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GameMenu;