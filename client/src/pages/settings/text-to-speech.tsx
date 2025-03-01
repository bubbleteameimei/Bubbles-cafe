import { useState } from "react";
import { useUserSettings } from "@/hooks/use-user-settings";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Volume2, Play, Pause } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TextToSpeechPage() {
  const { settings, updateSettings } = useUserSettings();
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize speech synthesis
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();

  const handleTextToSpeechToggle = async (enabled: boolean) => {
    await updateSettings({
      textToSpeech: {
        ...settings.textToSpeech,
        enabled
      }
    });
  };

  const handleVolumeChange = async (value: number[]) => {
    await updateSettings({
      textToSpeech: {
        ...settings.textToSpeech,
        volume: value[0]
      }
    });
  };

  const handleRateChange = async (value: number[]) => {
    await updateSettings({
      textToSpeech: {
        ...settings.textToSpeech,
        rate: value[0]
      }
    });
  };

  const handlePitchChange = async (value: number[]) => {
    await updateSettings({
      textToSpeech: {
        ...settings.textToSpeech,
        pitch: value[0]
      }
    });
  };

  const handleVoiceChange = async (value: string) => {
    await updateSettings({
      textToSpeech: {
        ...settings.textToSpeech,
        voice: value
      }
    });
  };

  const handleTestSpeech = () => {
    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      "This is a test of the text-to-speech settings. You can adjust the volume, rate, and pitch to customize how the voice sounds."
    );

    utterance.volume = settings.textToSpeech.volume / 100;
    utterance.rate = settings.textToSpeech.rate;
    utterance.pitch = settings.textToSpeech.pitch;

    if (settings.textToSpeech.voice) {
      utterance.voice = voices.find(v => v.name === settings.textToSpeech.voice) || null;
    }

    utterance.onend = () => setIsPlaying(false);

    setIsPlaying(true);
    synth.speak(utterance);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Text-to-Speech Settings</h1>

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Enable Text-to-Speech</h2>
            <p className="text-sm text-muted-foreground">
              Allow the application to read text content aloud
            </p>
          </div>
          <Switch
            checked={settings.textToSpeech.enabled}
            onCheckedChange={handleTextToSpeechToggle}
            aria-label="Toggle text-to-speech"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Voice Settings</h3>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Volume</span>
                <span>{settings.textToSpeech.volume}%</span>
              </div>
              <Slider
                value={[settings.textToSpeech.volume]}
                onValueChange={handleVolumeChange}
                min={0}
                max={100}
                step={1}
                disabled={!settings.textToSpeech.enabled}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Speed</span>
                <span>{settings.textToSpeech.rate}x</span>
              </div>
              <Slider
                value={[settings.textToSpeech.rate]}
                onValueChange={handleRateChange}
                min={0.5}
                max={2}
                step={0.1}
                disabled={!settings.textToSpeech.enabled}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pitch</span>
                <span>{settings.textToSpeech.pitch}</span>
              </div>
              <Slider
                value={[settings.textToSpeech.pitch]}
                onValueChange={handlePitchChange}
                min={0.5}
                max={2}
                step={0.1}
                disabled={!settings.textToSpeech.enabled}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Voice</label>
              <Select
                value={settings.textToSpeech.voice}
                onValueChange={handleVoiceChange}
                disabled={!settings.textToSpeech.enabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={handleTestSpeech}
            disabled={!settings.textToSpeech.enabled}
            className="w-full"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop Preview
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Test Settings
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}