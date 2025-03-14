import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AudioControlsProps {
  defaultBgmEnabled?: boolean;
  defaultTtsEnabled?: boolean;
  defaultBgmVolume?: number;
  defaultTtsVolume?: number;
}

/**
 * Component for controlling audio settings including background music and text-to-speech
 * This component allows users to enable/disable and adjust volume levels independently
 */
export function AudioControls({
  defaultBgmEnabled = true,
  defaultTtsEnabled = true,
  defaultBgmVolume = 50,
  defaultTtsVolume = 80,
}: AudioControlsProps) {
  // Background music controls
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(() => {
    const savedValue = localStorage.getItem('bgm-enabled');
    return savedValue === 'true' || (savedValue === null && defaultBgmEnabled);
  });
  
  const [bgmVolume, setBgmVolume] = useState<number>(() => {
    const savedValue = localStorage.getItem('bgm-volume');
    return savedValue ? parseInt(savedValue) : defaultBgmVolume;
  });

  // Text-to-speech controls
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(() => {
    const savedValue = localStorage.getItem('tts-enabled');
    return savedValue === 'true' || (savedValue === null && defaultTtsEnabled);
  });
  
  const [ttsVolume, setTtsVolume] = useState<number>(() => {
    const savedValue = localStorage.getItem('tts-volume');
    return savedValue ? parseInt(savedValue) : defaultTtsVolume;
  });

  // Save preferences to localStorage and apply changes when they update
  useEffect(() => {
    // Save background music settings
    localStorage.setItem('bgm-enabled', bgmEnabled.toString());
    localStorage.setItem('bgm-volume', bgmVolume.toString());
    
    // Apply background music settings
    // This would connect to the actual audio system in a real implementation
    const audioElements = document.querySelectorAll('audio.background-music');
    audioElements.forEach(audio => {
      (audio as HTMLAudioElement).volume = bgmVolume / 100;
      if (bgmEnabled) {
        audio.removeAttribute('muted');
      } else {
        audio.setAttribute('muted', 'true');
      }
    });
  }, [bgmEnabled, bgmVolume]);

  // Save and apply text-to-speech settings
  useEffect(() => {
    // Save text-to-speech settings
    localStorage.setItem('tts-enabled', ttsEnabled.toString());
    localStorage.setItem('tts-volume', ttsVolume.toString());
    
    // This would connect to the TTS system in a real implementation
    // For now, we're just setting global attributes that the TTS system would use
    document.documentElement.style.setProperty('--tts-volume', (ttsVolume / 100).toString());
    document.documentElement.setAttribute('data-tts-enabled', ttsEnabled.toString());
  }, [ttsEnabled, ttsVolume]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adjustable Audio Levels</CardTitle>
        <CardDescription>
          Control background music and text-to-speech audio settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Background Music Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="bgm-switch">Background Music</Label>
            <Switch 
              id="bgm-switch" 
              checked={bgmEnabled}
              onCheckedChange={setBgmEnabled}
              aria-label="Toggle background music"
              size="md"
            />
          </div>
          
          <div className={bgmEnabled ? "" : "opacity-50"}>
            <Label htmlFor="bgm-volume" className="block mb-2">
              Volume: {bgmVolume}%
            </Label>
            <Slider
              id="bgm-volume"
              disabled={!bgmEnabled}
              value={[bgmVolume]}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => setBgmVolume(value[0])}
              aria-label="Background music volume"
              className="w-full"
            />
          </div>
        </div>

        {/* Text-to-Speech Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="tts-switch">Text-to-Speech</Label>
            <Switch 
              id="tts-switch" 
              checked={ttsEnabled}
              onCheckedChange={setTtsEnabled}
              aria-label="Toggle text-to-speech"
              size="md"
            />
          </div>
          
          <div className={ttsEnabled ? "" : "opacity-50"}>
            <Label htmlFor="tts-volume" className="block mb-2">
              Volume: {ttsVolume}%
            </Label>
            <Slider
              id="tts-volume"
              disabled={!ttsEnabled}
              value={[ttsVolume]}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => setTtsVolume(value[0])}
              aria-label="Text-to-speech volume"
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AudioControls;