import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Download, Trash2, Settings as SettingsIcon, Volume2, Volume, Moon, Sun, HelpCircle, Home } from 'lucide-react';
import { GameState, GameSettings, GameSaveData } from '../types';

interface GameMenuProps {
  onClose: () => void;
  onSave: () => void;
  onLoad: (saveId: string) => void;
  onSettingsChange: (settings: GameSettings) => void;
  onQuit: () => void;
  isOpen: boolean;
  savedGames: GameSaveData[];
  currentState: GameState;
  settings: GameSettings;
}

export default function GameMenu({ onClose, onSave, onLoad, onSettingsChange, onQuit, isOpen, savedGames, currentState, settings }: GameMenuProps) {
  const [activeTab, setActiveTab] = useState<'saves' | 'settings' | 'help'>('saves');
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [tempSettings, setTempSettings] = useState<GameSettings>(settings);
  
  // Apply settings changes
  const applySettings = () => {
    onSettingsChange(tempSettings);
  };
  
  // Reset settings to defaults
  const resetSettings = () => {
    setTempSettings({
      textSpeed: 'medium',
      volume: 0.7,
      darkMode: true,
      showHints: true,
      language: 'en',
      autoSave: true
    });
  };
  
  // Handle quit confirmation
  const handleQuit = () => {
    if (!confirmQuit) {
      setConfirmQuit(true);
      return;
    }
    
    onQuit();
  };
  
  // Get the current date formatted for display
  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring' }}
          className="bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full mx-auto overflow-hidden"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the menu
        >
          {/* Header */}
          <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
            <h2 className="text-xl text-white font-semibold">Game Menu</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('saves')}
              className={`flex-1 px-4 py-3 text-center transition-colors ${
                activeTab === 'saves' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Saves
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-4 py-3 text-center transition-colors ${
                activeTab === 'settings' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`flex-1 px-4 py-3 text-center transition-colors ${
                activeTab === 'help' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Help
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {/* Saves Tab */}
            {activeTab === 'saves' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg text-white">Saved Games</h3>
                  <button 
                    onClick={onSave}
                    className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded flex items-center transition-colors"
                  >
                    <Save size={18} className="mr-2" />
                    Save Current Game
                  </button>
                </div>
                
                {savedGames.length === 0 ? (
                  <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-400 mb-2">No saved games found</p>
                    <p className="text-gray-500 text-sm">Your saved games will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedGames.map((save) => (
                      <div 
                        key={save.id}
                        className="bg-gray-800 rounded-lg p-3 flex justify-between items-center"
                      >
                        <div>
                          <h4 className="text-white">{save.name || `Save #${save.id}`}</h4>
                          <p className="text-gray-400 text-sm">{save.timestamp || getFormattedDate()}</p>
                          <p className="text-gray-500 text-xs mt-1">Scene: {save.data.currentScene}</p>
                        </div>
                        <div className="flex space-x-2">
                          {deleteConfirm === save.id ? (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => {
                                  // Handle delete
                                  setDeleteConfirm(null);
                                }}
                                className="bg-red-700 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition-colors"
                              >
                                Confirm
                              </button>
                              <button 
                                onClick={() => setDeleteConfirm(null)}
                                className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <button 
                                onClick={() => onLoad(save.id)}
                                className="bg-blue-700 hover:bg-blue-600 text-white p-2 rounded transition-colors"
                                title="Load this save"
                              >
                                <Download size={18} />
                              </button>
                              <button 
                                onClick={() => setDeleteConfirm(save.id)}
                                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors"
                                title="Delete this save"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6">
                  <h3 className="text-lg text-white mb-2">Auto-Save</h3>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoSave"
                      checked={tempSettings.autoSave}
                      onChange={(e) => {
                        setTempSettings({
                          ...tempSettings,
                          autoSave: e.target.checked
                        });
                        onSettingsChange({
                          ...settings,
                          autoSave: e.target.checked
                        });
                      }}
                      className="mr-2 rounded"
                    />
                    <label htmlFor="autoSave" className="text-gray-300">Enable auto-save (every 5 minutes and at checkpoints)</label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg text-white mb-4">Game Settings</h3>
                
                {/* Volume Control */}
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2 flex items-center">
                    <Volume2 size={20} className="mr-2" />
                    Volume
                  </label>
                  <div className="flex items-center">
                    <Volume size={16} className="text-gray-400 mr-2" />
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={tempSettings.volume}
                      onChange={(e) => setTempSettings({
                        ...tempSettings,
                        volume: parseFloat(e.target.value)
                      })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <Volume2 size={16} className="text-gray-400 ml-2" />
                  </div>
                </div>
                
                {/* Text Speed */}
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">Text Speed</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => setTempSettings({
                        ...tempSettings,
                        textSpeed: 'slow'
                      })}
                      className={`py-2 px-4 rounded text-center ${
                        tempSettings.textSpeed === 'slow' 
                          ? 'bg-purple-700 text-white' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Slow
                    </button>
                    <button 
                      onClick={() => setTempSettings({
                        ...tempSettings,
                        textSpeed: 'medium'
                      })}
                      className={`py-2 px-4 rounded text-center ${
                        tempSettings.textSpeed === 'medium' 
                          ? 'bg-purple-700 text-white' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Medium
                    </button>
                    <button 
                      onClick={() => setTempSettings({
                        ...tempSettings,
                        textSpeed: 'fast'
                      })}
                      className={`py-2 px-4 rounded text-center ${
                        tempSettings.textSpeed === 'fast' 
                          ? 'bg-purple-700 text-white' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Fast
                    </button>
                  </div>
                </div>
                
                {/* Dark Mode Toggle */}
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2 flex items-center">
                    {tempSettings.darkMode ? <Moon size={20} className="mr-2" /> : <Sun size={20} className="mr-2" />}
                    Dark Mode
                  </label>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={tempSettings.darkMode}
                        onChange={(e) => setTempSettings({
                          ...tempSettings,
                          darkMode: e.target.checked
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
                
                {/* Show Hints Toggle */}
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2 flex items-center">
                    <HelpCircle size={20} className="mr-2" />
                    Gameplay Hints
                  </label>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={tempSettings.showHints}
                        onChange={(e) => setTempSettings({
                          ...tempSettings,
                          showHints: e.target.checked
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
                
                {/* Language Selection */}
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">Language</label>
                  <select 
                    value={tempSettings.language}
                    onChange={(e) => setTempSettings({
                      ...tempSettings,
                      language: e.target.value
                    })}
                    className="bg-gray-800 text-white rounded p-2 w-full"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-between mt-6">
                  <button 
                    onClick={resetSettings}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Reset to Defaults
                  </button>
                  <button 
                    onClick={applySettings}
                    className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Apply Settings
                  </button>
                </div>
              </div>
            )}
            
            {/* Help Tab */}
            {activeTab === 'help' && (
              <div>
                <h3 className="text-lg text-white mb-4">How to Play</h3>
                
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <h4 className="text-white font-semibold mb-2">Game Controls</h4>
                  <ul className="text-gray-300 space-y-2">
                    <li className="flex items-start">
                      <span className="bg-gray-700 text-xs px-2 py-1 rounded mr-2 mt-0.5">Click</span>
                      <span>Interact with the scene, characters, and items</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gray-700 text-xs px-2 py-1 rounded mr-2 mt-0.5">I</span>
                      <span>Open inventory</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gray-700 text-xs px-2 py-1 rounded mr-2 mt-0.5">M</span>
                      <span>Open map</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gray-700 text-xs px-2 py-1 rounded mr-2 mt-0.5">ESC</span>
                      <span>Open game menu</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gray-700 text-xs px-2 py-1 rounded mr-2 mt-0.5">Space</span>
                      <span>Skip dialog text</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <h4 className="text-white font-semibold mb-2">Getting Started</h4>
                  <p className="text-gray-300 mb-3">
                    Welcome to Eden's Hollow, a first-person atmospheric horror adventure. Explore the abandoned town, solve puzzles, and uncover its dark secrets.
                  </p>
                  <p className="text-gray-300">
                    Begin by examining your surroundings. Click on objects to interact with them or add them to your inventory. Talk to any characters you encounter to learn more about the town's history.
                  </p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Tips</h4>
                  <ul className="text-gray-300 space-y-2">
                    <li>• Pay attention to environmental clues</li>
                    <li>• Collect items that may be useful later</li>
                    <li>• Remember details from conversations</li>
                    <li>• Try different combinations when solving puzzles</li>
                    <li>• Save your game regularly</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="bg-gray-800 p-4 border-t border-gray-700 flex justify-between">
            <button
              onClick={handleQuit}
              className={`${
                confirmQuit ? 'bg-red-700 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
              } text-white px-4 py-2 rounded transition-colors flex items-center`}
            >
              <Home size={18} className="mr-2" />
              {confirmQuit ? 'Confirm Quit' : 'Quit Game'}
            </button>
            <button
              onClick={onClose}
              className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors"
            >
              Return to Game
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}