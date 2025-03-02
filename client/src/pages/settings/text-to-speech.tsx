import { useState, useEffect } from "react";
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
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [rate, setRate] = useState([1]);
  const [pitch, setPitch] = useState([1]);
  const [voice, setVoice] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Initialize speech synthesis and handle voices loading
  useEffect(() => {
    const synth = window.speechSynthesis;

    // Function to load and set voices
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
    };

    // Load voices - both immediately and when they become available
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const handleTestSpeech = () => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return;
    }

    const synth = window.speechSynthesis;

    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      "Welcome to our horror story platform. You can adjust these settings to customize how stories are read aloud."
    );

    utterance.volume = volume[0] / 100;
    utterance.rate = rate[0];
    utterance.pitch = pitch[0];

    if (voice) {
      const selectedVoice = voices.find(v => v.name === voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
    };

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
              Let stories be read aloud to enhance your experience
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            aria-label="Toggle text-to-speech"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Voice Settings</h3>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Volume</span>
                <span>{volume}%</span>
              </div>
              <Slider
                value={volume}
                onValueChange={setVolume}
                min={0}
                max={100}
                step={1}
                disabled={!enabled}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Speed</span>
                <span>{rate}x</span>
              </div>
              <Slider
                value={rate}
                onValueChange={setRate}
                min={0.5}
                max={2}
                step={0.1}
                disabled={!enabled}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pitch</span>
                <span>{pitch}</span>
              </div>
              <Slider
                value={pitch}
                onValueChange={setPitch}
                min={0.5}
                max={2}
                step={0.1}
                disabled={!enabled}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Voice</label>
              <Select
                value={voice}
                onValueChange={setVoice}
                disabled={!enabled || voices.length === 0}
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
            disabled={!enabled}
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