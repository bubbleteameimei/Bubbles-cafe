/**
 * Eden's Hollow Game Settings Modal
 * 
 * Settings modal for the Eden's Hollow game.
 */

import React, { useState } from 'react';
import { GameSettings } from '../../types/game';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface GameSettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onClose: () => void;
  onSave: (settings: GameSettings) => void;
}

export default function GameSettingsModal({
  isOpen,
  settings,
  onClose,
  onSave
}: GameSettingsModalProps) {
  // Local state for settings (to avoid changing global settings until Save is clicked)
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);

  // Update a single setting
  const updateSetting = (key: keyof GameSettings, value: any) => {
    setLocalSettings({
      ...localSettings,
      [key]: value
    });
  };

  // Handle music volume change
  const handleMusicVolumeChange = (value: number[]) => {
    updateSetting('musicVolume', value[0]);
  };

  // Handle SFX volume change
  const handleSfxVolumeChange = (value: number[]) => {
    updateSetting('sfxVolume', value[0]);
  };

  // Handle text speed change
  const handleTextSpeedChange = (speed: 'slow' | 'normal' | 'fast') => {
    updateSetting('textSpeed', speed);
  };

  // Handle save settings
  const handleSave = () => {
    onSave(localSettings);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Game Settings</DialogTitle>
          <DialogDescription>
            Customize your Eden's Hollow experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-toggle" className="flex flex-col space-y-1">
              <span>Sound</span>
              <span className="text-sm text-gray-500">Enable game audio</span>
            </Label>
            <Switch
              id="sound-toggle"
              checked={localSettings.soundEnabled}
              onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
            />
          </div>

          {/* Music Volume */}
          <div className="space-y-2">
            <Label htmlFor="music-volume">
              Music Volume: {Math.round(localSettings.musicVolume * 100)}%
            </Label>
            <Slider
              id="music-volume"
              disabled={!localSettings.soundEnabled}
              value={[localSettings.musicVolume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleMusicVolumeChange}
            />
          </div>

          {/* SFX Volume */}
          <div className="space-y-2">
            <Label htmlFor="sfx-volume">
              Sound Effects Volume: {Math.round(localSettings.sfxVolume * 100)}%
            </Label>
            <Slider
              id="sfx-volume"
              disabled={!localSettings.soundEnabled}
              value={[localSettings.sfxVolume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleSfxVolumeChange}
            />
          </div>

          {/* Text Speed */}
          <div className="space-y-2">
            <Label>Text Speed</Label>
            <div className="flex space-x-2">
              <Button
                variant={localSettings.textSpeed === 'slow' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTextSpeedChange('slow')}
              >
                Slow
              </Button>
              <Button
                variant={localSettings.textSpeed === 'normal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTextSpeedChange('normal')}
              >
                Normal
              </Button>
              <Button
                variant={localSettings.textSpeed === 'fast' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTextSpeedChange('fast')}
              >
                Fast
              </Button>
            </div>
          </div>

          {/* Gore Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="gore-toggle" className="flex flex-col space-y-1">
              <span>Graphic Content</span>
              <span className="text-sm text-gray-500">Show intense horror imagery</span>
            </Label>
            <Switch
              id="gore-toggle"
              checked={localSettings.showGore}
              onCheckedChange={(checked) => updateSetting('showGore', checked)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}