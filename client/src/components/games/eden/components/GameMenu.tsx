import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameSettings, GameSaveData, GameState } from '../types';

interface GameMenuProps {
  onSave: () => void;
  onLoad: (saveId: string) => void;
  onSettingsChange: (settings: Partial<GameSettings>) => void;
  onQuit: () => void;
  isOpen: boolean;
  onClose: () => void;
  savedGames: GameSaveData[];
  currentState: GameState;
  settings: GameSettings;
}

export const GameMenu: React.FC<GameMenuProps> = ({
  onSave,
  onLoad,
  onSettingsChange,
  onQuit,
  isOpen,
  onClose,
  savedGames,
  currentState,
  settings
}) => {
  const [activeTab, setActiveTab] = useState<'save' | 'load' | 'settings'>('save');
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-2xl bg-gray-900 rounded-lg overflow-hidden shadow-2xl border border-gray-700"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
          >
            {/* Menu Header */}
            <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-serif text-amber-500">Eden's Hollow</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('save')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'save' 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-900 text-gray-400'
                }`}
              >
                Save Game
              </button>
              <button
                onClick={() => setActiveTab('load')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'load' 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-900 text-gray-400'
                }`}
              >
                Load Game
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'settings' 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-900 text-gray-400'
                }`}
              >
                Settings
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {/* Save Tab */}
              {activeTab === 'save' && (
                <div>
                  <p className="text-gray-300 mb-4">
                    Save your current progress in Eden's Hollow.
                  </p>
                  
                  <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <h3 className="font-medium text-white">Current Game</h3>
                        <p className="text-sm text-gray-400">Scene: {currentState.currentScene}</p>
                      </div>
                      <button
                        onClick={onSave}
                        className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white text-sm rounded-md"
                      >
                        Save Game
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-white mt-6 mb-3">Recent Saves</h3>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {savedGames.length === 0 ? (
                      <p className="text-gray-400 text-sm italic">No saved games found.</p>
                    ) : (
                      savedGames.map(save => (
                        <div 
                          key={save.id} 
                          className="bg-gray-800 rounded-lg p-3 flex items-center"
                        >
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h4 className="font-medium text-white">
                                {save.gameState.currentScene}
                              </h4>
                              <span className="text-xs text-gray-400 ml-2">
                                {formatTimestamp(save.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">
                              Play time: {formatPlayTime(save.playTime)}
                            </p>
                          </div>
                          <button
                            onClick={() => onLoad(save.id)}
                            className="text-amber-500 hover:text-amber-400 text-sm"
                          >
                            Load
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {/* Load Tab */}
              {activeTab === 'load' && (
                <div>
                  <p className="text-gray-300 mb-4">
                    Load a previously saved game.
                  </p>
                  
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {savedGames.length === 0 ? (
                      <p className="text-gray-400 text-sm italic">No saved games found.</p>
                    ) : (
                      savedGames.map(save => (
                        <div 
                          key={save.id} 
                          className="bg-gray-800 rounded-lg p-4 flex items-center"
                        >
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h4 className="font-medium text-white">
                                {save.gameState.currentScene}
                              </h4>
                              <span className="text-xs text-gray-400 ml-2">
                                {formatTimestamp(save.timestamp)}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center text-xs text-gray-400">
                              <div className="mr-3">Play time: {formatPlayTime(save.playTime)}</div>
                              <div>Items: {save.gameState.inventory.length}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => onLoad(save.id)}
                            className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white text-sm rounded-md"
                          >
                            Load
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <p className="text-gray-300 mb-4">
                    Adjust game settings to customize your experience.
                  </p>
                  
                  <div className="space-y-5">
                    {/* Text Speed */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Text Speed
                      </label>
                      <div className="flex space-x-3">
                        {['slow', 'medium', 'fast'].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => onSettingsChange({ textSpeed: speed as any })}
                            className={`px-4 py-2 rounded-md ${
                              settings.textSpeed === speed
                                ? 'bg-amber-700 text-white'
                                : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            {speed.charAt(0).toUpperCase() + speed.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Volume Slider */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Volume: {Math.round(settings.volume * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.volume}
                        onChange={(e) => onSettingsChange({ volume: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    
                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">Dark Mode</span>
                      <button
                        onClick={() => onSettingsChange({ darkMode: !settings.darkMode })}
                        className={`w-11 h-6 flex items-center rounded-full p-1 ${
                          settings.darkMode ? 'bg-amber-700' : 'bg-gray-700'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            settings.darkMode ? 'translate-x-5' : ''
                          }`}
                        />
                      </button>
                    </div>
                    
                    {/* Show Hints Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">Show Hints</span>
                      <button
                        onClick={() => onSettingsChange({ showHints: !settings.showHints })}
                        className={`w-11 h-6 flex items-center rounded-full p-1 ${
                          settings.showHints ? 'bg-amber-700' : 'bg-gray-700'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            settings.showHints ? 'translate-x-5' : ''
                          }`}
                        />
                      </button>
                    </div>
                    
                    {/* Auto Save Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">Auto Save</span>
                      <button
                        onClick={() => onSettingsChange({ autoSave: !settings.autoSave })}
                        className={`w-11 h-6 flex items-center rounded-full p-1 ${
                          settings.autoSave ? 'bg-amber-700' : 'bg-gray-700'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            settings.autoSave ? 'translate-x-5' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer Actions */}
            <div className="bg-gray-800 px-6 py-4 flex justify-between">
              <button
                onClick={onQuit}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-sm rounded-md"
              >
                Quit Game
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md"
              >
                Resume
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameMenu;