import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Play, Pause } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TextToSpeechPage() {
  // Initialize state from localStorage with defaults
  const [enabled, setEnabled] = useState(localStorage.getItem('tts-enabled') === 'true' || false);
  const [volume, setVolume] = useState([parseInt(localStorage.getItem('tts-volume') || '75')]);
  const [rate, setRate] = useState([parseFloat(localStorage.getItem('tts-rate') || '1')]);
  const [pitch, setPitch] = useState([parseFloat(localStorage.getItem('tts-pitch') || '1')]);
  const [voice, setVoice] = useState(localStorage.getItem('tts-voice') || "");
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [autoPlay, setAutoPlay] = useState(localStorage.getItem('tts-autoplay') === 'true' || false);
  const [highlightText, setHighlightText] = useState(localStorage.getItem('tts-highlight') !== 'false');

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tts-enabled', enabled.toString());
    localStorage.setItem('tts-volume', volume[0].toString());
    localStorage.setItem('tts-rate', rate[0].toString());
    localStorage.setItem('tts-pitch', pitch[0].toString());
    localStorage.setItem('tts-voice', voice);
    localStorage.setItem('tts-autoplay', autoPlay.toString());
    localStorage.setItem('tts-highlight', highlightText.toString());
  }, [enabled, volume, rate, pitch, voice, autoPlay, highlightText]);

  // Initialize speech synthesis and handle voices loading
  useEffect(() => {
    const synth = window.speechSynthesis;

    // Function to load and strictly filter English voices
    const loadVoices = () => {
      const allVoices = synth.getVoices();
      
      // Only include English voices - strict filtering
      const englishVoices = allVoices.filter(voice => 
        // Include voices that explicitly mention English in language code
        voice.lang.startsWith('en-') || 
        // Also include some high-quality voices that may be labeled as "en" without region
        voice.lang === 'en'
      );
      
      // Sort the voices by quality and language specificity
      const sortedVoices = englishVoices.sort((a, b) => {
        // First priority: Premium branded voices
        const premiumBrandsA = ['Google', 'Microsoft', 'Apple', 'Amazon', 'Neural'].some(brand => 
          a.name.includes(brand));
        const premiumBrandsB = ['Google', 'Microsoft', 'Apple', 'Amazon', 'Neural'].some(brand => 
          b.name.includes(brand));
        
        if (premiumBrandsA && !premiumBrandsB) return -1;
        if (!premiumBrandsA && premiumBrandsB) return 1;
        
        // Second priority: en-US or en-GB (major English varieties)
        const majorVarietyA = a.lang === 'en-US' || a.lang === 'en-GB';
        const majorVarietyB = b.lang === 'en-US' || b.lang === 'en-GB';
        
        if (majorVarietyA && !majorVarietyB) return -1;
        if (!majorVarietyA && majorVarietyB) return 1;
        
        // Third priority: Natural/quality indicators in name
        const qualityNameA = a.name.toLowerCase().includes('natural') || a.name.toLowerCase().includes('premium');
        const qualityNameB = b.name.toLowerCase().includes('natural') || b.name.toLowerCase().includes('premium');
        
        if (qualityNameA && !qualityNameB) return -1;
        if (!qualityNameA && qualityNameB) return 1;
        
        return 0;
      });
      
      // Limit to top 6 voices to avoid overwhelming selection but provide good options
      const limitedVoices = sortedVoices.slice(0, 6);
      
      // Use english voices if we have some, otherwise fall back to a minimal selection of top voices
      setVoices(limitedVoices.length > 0 ? limitedVoices : allVoices.filter(v => 
        v.lang.includes('en') || ['Google', 'Microsoft', 'Apple'].some(brand => v.name.includes(brand))
      ).slice(0, 3));
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
      "The old house creaked as the wind howled outside. A shadow moved across the wall, though I was alone. This is how stories will sound with your current settings."
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
      <h1 className="text-3xl font-bold">Text-to-Speech Settings</h1>
      <p className="text-muted-foreground mb-4">Customize the voice and reading settings for story narration.</p>

      <Card className="p-6 space-y-6 mb-6">
        <CardHeader className="p-0">
          <CardTitle>Tips for Best Experience</CardTitle>
          <CardDescription>How to get the best narration for horror stories</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <ul className="space-y-2 list-disc pl-5">
            <li>Choose voices with good pronunciation and natural intonation</li>
            <li>Try slightly slower speeds (0.9x) for dramatic effect</li>
            <li>Adjust the pitch for character voices (lower for mysterious tone)</li>
            <li>Enable text highlighting to follow along while listening</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="p-6 space-y-6">
        <CardHeader>
          <CardTitle>Voice Settings</CardTitle>
          <CardDescription>Customize how stories are read aloud to you</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="tts-enable">Enable Text-to-Speech</Label>
              <p className="text-sm text-muted-foreground">
                Let stories be read aloud to enhance your experience
              </p>
            </div>
            <Switch
              id="tts-enable"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Voice</Label>
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
                      <div className="flex flex-col">
                        <span>{voice.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {voice.lang.split('-')[0].toUpperCase()} - {voice.localService ? 'Local' : 'Cloud'}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Volume</Label>
                <span className="text-sm text-muted-foreground">{volume}%</span>
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
              <div className="flex justify-between">
                <Label>Speed</Label>
                <span className="text-sm text-muted-foreground">{rate}x</span>
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
              <div className="flex justify-between">
                <Label>Pitch</Label>
                <span className="text-sm text-muted-foreground">{pitch}</span>
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

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-play">Auto-play for new stories</Label>
              <Switch
                id="auto-play"
                checked={autoPlay}
                onCheckedChange={setAutoPlay}
                disabled={!enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="highlight-text">Highlight text while reading</Label>
              <Switch
                id="highlight-text"
                checked={highlightText}
                onCheckedChange={setHighlightText}
                disabled={!enabled}
              />
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
        </CardContent>
      </Card>
    </div>
  );
}