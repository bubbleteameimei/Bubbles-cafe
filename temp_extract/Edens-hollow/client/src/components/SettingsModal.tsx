import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameSettings } from "../types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onClose: () => void;
  onSave: (newSettings: GameSettings) => void;
}

export default function SettingsModal({
  isOpen,
  settings,
  onClose,
  onSave
}: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);
  
  // Update local settings when props change
  if (settings !== localSettings && !isOpen) {
    setLocalSettings(settings);
  }
  
  const handleSpeedChange = (value: number[]) => {
    setLocalSettings(prev => ({
      ...prev,
      typewriterSpeed: 60 - value[0] // Invert the value for more intuitive behavior
    }));
  };
  
  const handleSoundToggle = (checked: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      soundEnabled: checked
    }));
  };
  
  const handleMusicToggle = (checked: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      musicEnabled: checked
    }));
  };
  
  const handleSave = () => {
    onSave(localSettings);
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-primary border border-accent pixel-border p-6 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-ui text-accent text-lg">SETTINGS</h3>
              <button 
                onClick={onClose}
                className="text-textColor hover:text-accent"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Text Speed */}
              <div>
                <Label className="font-ui text-sm text-textColor block mb-2">
                  TEXT SPEED
                </Label>
                <Slider
                  value={[60 - localSettings.typewriterSpeed]} // Invert for intuitive behavior
                  min={10}
                  max={50}
                  step={1}
                  onValueChange={handleSpeedChange}
                  className="w-full"
                />
              </div>
              
              {/* Sound Effects */}
              <div>
                <Label className="font-ui text-sm text-textColor block mb-2">
                  SOUND EFFECTS
                </Label>
                <div className="flex items-center">
                  <Switch
                    checked={localSettings.soundEnabled}
                    onCheckedChange={handleSoundToggle}
                    className="mr-2"
                  />
                  <span className="font-dialogue">
                    {localSettings.soundEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
              
              {/* Background Music */}
              <div>
                <Label className="font-ui text-sm text-textColor block mb-2">
                  BACKGROUND MUSIC
                </Label>
                <div className="flex items-center">
                  <Switch
                    checked={localSettings.musicEnabled}
                    onCheckedChange={handleMusicToggle}
                    className="mr-2"
                  />
                  <span className="font-dialogue">
                    {localSettings.musicEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={handleSave}
                className="mt-4 w-full font-ui bg-secondary hover:bg-accent text-textColor py-2 transition-colors"
              >
                SAVE SETTINGS
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
