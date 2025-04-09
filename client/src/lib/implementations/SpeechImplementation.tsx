import React, { useState, useEffect } from 'react';
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  PlayCircle, 
  PauseCircle, 
  StopCircle, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX
} from 'lucide-react';

// Text to speech component with voice selection and rate control
export const TextToSpeechReader = ({ text = "" }) => {
  const { speak, cancel, speaking, supported, voices } = useSpeechSynthesis();
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const previousVolumeRef = React.useRef(volume);

  // Set default voice when voices are loaded
  useEffect(() => {
    if (voices.length > 0) {
      // Try to find an English voice
      const englishVoice = voices.find(voice => 
        voice.lang.includes('en-') && voice.name.includes('Female')
      );
      setSelectedVoice(englishVoice || voices[0]);
    }
  }, [voices]);

  // Handle mute toggle
  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolumeRef.current);
      setIsMuted(false);
    } else {
      previousVolumeRef.current = volume;
      setVolume(0);
      setIsMuted(true);
    }
  };

  // Handle speak action
  const handleSpeak = () => {
    if (text && selectedVoice) {
      speak({ 
        text, 
        voice: selectedVoice,
        rate,
        pitch,
        volume
      });
    }
  };

  if (!supported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Text to Speech</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Your browser does not support speech synthesis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Text to Speech
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="voice-select">Voice</Label>
          <select
            id="voice-select"
            value={voices.indexOf(selectedVoice as SpeechSynthesisVoice)}
            onChange={(e) => setSelectedVoice(voices[parseInt(e.target.value)])}
            disabled={speaking || voices.length === 0}
            className="w-full p-2 border rounded-md"
          >
            {voices.length === 0 ? (
              <option>Loading voices...</option>
            ) : (
              voices.map((voice, index) => (
                <option key={index} value={index}>
                  {voice.name} ({voice.lang})
                </option>
              ))
            )}
          </select>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="rate-slider">Speed: {rate.toFixed(1)}x</Label>
          </div>
          <Slider
            id="rate-slider"
            min={0.5}
            max={2}
            step={0.1}
            value={[rate]}
            onValueChange={(value) => setRate(value[0])}
            disabled={speaking}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="pitch-slider">Pitch: {pitch.toFixed(1)}</Label>
          </div>
          <Slider
            id="pitch-slider"
            min={0.5}
            max={2}
            step={0.1}
            value={[pitch]}
            onValueChange={(value) => setPitch(value[0])}
            disabled={speaking}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="volume-slider">Volume: {(volume * 100).toFixed(0)}%</Label>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </Button>
          </div>
          <Slider
            id="volume-slider"
            min={0}
            max={1}
            step={0.05}
            value={[volume]}
            onValueChange={(value) => {
              setVolume(value[0]);
              setIsMuted(value[0] === 0);
            }}
          />
        </div>
        
        <div className="bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
          <p className="text-sm">
            {text || "No text provided. Please provide text to be read aloud."}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="justify-between">
        {speaking ? (
          <>
            <Button 
              variant="outline" 
              onClick={cancel}
              className="flex gap-2 items-center"
            >
              <StopCircle size={18} />
              Stop
            </Button>
            <span className="text-sm text-muted-foreground animate-pulse">Speaking...</span>
          </>
        ) : (
          <Button 
            onClick={handleSpeak} 
            disabled={!text || !selectedVoice}
            className="flex gap-2 items-center"
          >
            <PlayCircle size={18} />
            Read Aloud
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Speech recognition component
export const VoiceSearchComponent = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { listen, listening, stop, supported } = useSpeechRecognition({
    onResult: (result) => {
      setTranscript(result);
    },
    onEnd: () => {
      setIsListening(false);
    },
  });

  const toggleListening = () => {
    if (isListening) {
      stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      listen({ interimResults: true });
    }
  };

  const handleClear = () => {
    setTranscript('');
  };

  if (!supported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Voice Search</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Your browser does not support speech recognition.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice Search
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="voice-toggle"
            checked={isListening} 
            onCheckedChange={toggleListening}
          />
          <Label htmlFor="voice-toggle">
            {isListening ? 'Listening...' : 'Start listening'}
          </Label>
        </div>
        
        <div className="relative">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full min-h-[100px] p-3 rounded-md border resize-none"
            placeholder="Speak to search..."
          />
          {isListening && (
            <div className="absolute right-3 top-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="justify-between">
        <Button 
          variant="outline" 
          onClick={handleClear}
          disabled={!transcript}
        >
          Clear
        </Button>
        
        <Button 
          onClick={toggleListening}
          variant={isListening ? "destructive" : "default"}
          className="flex gap-2 items-center"
        >
          {isListening ? (
            <>
              <MicOff size={18} />
              Stop Listening
            </>
          ) : (
            <>
              <Mic size={18} />
              Start Listening
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Combined accessibility features
export const AccessibilityFeatures = ({ sampleText = "This is a sample text that will be read aloud using the speech synthesis API. You can adjust the voice, rate, pitch, and volume to customize how it sounds." }) => {
  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold">Accessibility Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextToSpeechReader text={sampleText} />
        <VoiceSearchComponent />
      </div>
    </div>
  );
};

export default AccessibilityFeatures;