/**
 * Game Settings Modal
 * 
 * This component provides a modal interface for the player to adjust game settings
 * such as sound volume, text speed, and visual preferences.
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Volume, Volume2, VolumeX } from 'lucide-react';
import { GameSettings } from '../../types/game';

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSettingChange: (key: keyof GameSettings, value: any) => void;
}

const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingChange
}) => {
  // Local state to track changes before saving
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);
  
  // Reset local settings when modal opens
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);
  
  // Update local settings
  const updateSetting = (key: keyof GameSettings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Save changes
  const handleSave = () => {
    // Apply all changed settings
    Object.keys(localSettings).forEach(key => {
      const settingKey = key as keyof GameSettings;
      if (localSettings[settingKey] !== settings[settingKey]) {
        onSettingChange(settingKey, localSettings[settingKey]);
      }
    });
    
    onClose();
  };
  
  // Render volume icon based on value
  const getVolumeIcon = (volume: number) => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.5) return <Volume className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Game Settings</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Adjust your experience in Eden's Hollow.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-toggle" className="text-white">Sound Effects</Label>
            <Switch
              id="sound-toggle"
              checked={localSettings.soundEnabled}
              onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
            />
          </div>
          
          {/* Music Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-white">Music Volume</Label>
              <div className="flex items-center gap-2">
                {getVolumeIcon(localSettings.musicVolume)}
                <span className="text-sm text-zinc-400">
                  {Math.round(localSettings.musicVolume * 100)}%
                </span>
              </div>
            </div>
            <Slider
              disabled={!localSettings.soundEnabled}
              value={[localSettings.musicVolume * 100]}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => updateSetting('musicVolume', value[0] / 100)}
              className="cursor-pointer"
            />
          </div>
          
          {/* SFX Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-white">Sound Effects Volume</Label>
              <div className="flex items-center gap-2">
                {getVolumeIcon(localSettings.sfxVolume)}
                <span className="text-sm text-zinc-400">
                  {Math.round(localSettings.sfxVolume * 100)}%
                </span>
              </div>
            </div>
            <Slider
              disabled={!localSettings.soundEnabled}
              value={[localSettings.sfxVolume * 100]}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => updateSetting('sfxVolume', value[0] / 100)}
              className="cursor-pointer"
            />
          </div>
          
          {/* Text Speed */}
          <div className="space-y-2">
            <Label className="text-white">Text Speed</Label>
            <RadioGroup
              value={localSettings.textSpeed}
              onValueChange={(value) => updateSetting('textSpeed', value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="slow" id="speed-slow" />
                <Label htmlFor="speed-slow" className="text-zinc-300">Slow</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="speed-normal" />
                <Label htmlFor="speed-normal" className="text-zinc-300">Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fast" id="speed-fast" />
                <Label htmlFor="speed-fast" className="text-zinc-300">Fast</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Gore Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="gore-toggle" className="text-white block">Show Disturbing Content</Label>
              <p className="text-xs text-zinc-400">May include blood, unsettling imagery</p>
            </div>
            <Switch
              id="gore-toggle"
              checked={localSettings.showGore}
              onCheckedChange={(checked) => updateSetting('showGore', checked)}
            />
          </div>
          
          {/* Auto Save Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="autosave-toggle" className="text-white">Auto-Save Progress</Label>
            <Switch
              id="autosave-toggle"
              checked={localSettings.autoSave}
              onCheckedChange={(checked) => updateSetting('autoSave', checked)}
            />
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-emerald-700 hover:bg-emerald-600 text-white"
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameSettingsModal;