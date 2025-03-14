import { useState, useEffect, useRef } from "react";
import { Pause, Play, Volume2, Volume1, VolumeX, SkipForward, SkipBack, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AudioNarratorProps {
  content: string;
  title?: string;
  emotionalTone?: "neutral" | "creepy" | "suspense" | "terror" | "panic" | "whisper";
  autoScroll?: boolean;
  className?: string;
  onPositionChange?: (position: number) => void;
}

export function AudioNarrator({
  content,
  title,
  emotionalTone = "neutral",
  autoScroll = false,
  className,
  onPositionChange,
}: AudioNarratorProps) {
  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [highlightedText, setHighlightedText] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // References
  const speakTimeout = useRef<number | null>(null);
  const wordTimings = useRef<number[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const wordsArray = useRef<string[]>(content.split(/\s+/));
  
  // Emotional tone settings
  const toneSettings = {
    neutral: {
      rate: 0.9,
      pitch: 1.0,
      modulation: 0,
      filterFrequency: 0,
      filterQ: 0,
      tremolo: 0,
      echo: 0
    },
    creepy: {
      rate: 0.8,
      pitch: 0.8,
      modulation: 0.3,
      filterFrequency: 700,
      filterQ: 5,
      tremolo: 4,
      echo: 0.3
    },
    suspense: {
      rate: 0.7,
      pitch: 0.9,
      modulation: 0.1,
      filterFrequency: 1000,
      filterQ: 2,
      tremolo: 2,
      echo: 0.2
    },
    terror: {
      rate: 1.1,
      pitch: 0.6,
      modulation: 0.5,
      filterFrequency: 500,
      filterQ: 10,
      tremolo: 6,
      echo: 0.4
    },
    panic: {
      rate: 1.3,
      pitch: 1.2,
      modulation: 0.8,
      filterFrequency: 1200,
      filterQ: 8,
      tremolo: 8,
      echo: 0.1
    },
    whisper: {
      rate: 0.65,      // Even slower rate for a more deliberate, breathy whisper
      pitch: 0.5,      // Lower pitch for a softer, more intimate feel
      modulation: 0.2,  // More modulation to create a breathy effect
      filterFrequency: 2200, // Higher frequency to let through breathy sounds
      filterQ: 1.8,    // Sharper filter response for more clear whispers
      tremolo: 0.6,    // Slight tremolo for a subtle wavering effect
      echo: 0.35       // Moderate echo to create an ambient feeling
    }
  };

  // Initialize audio context and speech synthesis
  useEffect(() => {
    if (!isInitialized && window.speechSynthesis) {
      try {
        // Create AudioContext for effects processing
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(context);
        
        // Initialize speech synthesis
        const utterance = new SpeechSynthesisUtterance();
        
        // Make sure we have the latest voices
        const loadVoices = () => {
          // Get available voices and select a good one for narration
          const voices = window.speechSynthesis.getVoices();
          console.log(`Available voices: ${voices.length}`);
          
          if (voices.length > 0) {
            // Select different voices based on emotional tone
            let preferredVoices;
            
            if (emotionalTone === 'whisper') {
              // For whisper mode, prefer softer, feminine voices
              // Log all available voices to help with debugging
              console.log("Available voices for whisper mode:", voices.map(v => v.name));
              
              // Create a ranked list of preferred voices for whisper narration
              const whisperyVoices = voices.filter(voice => 
                voice.name.toLowerCase().includes('whisper') || 
                voice.name.toLowerCase().includes('soft') || 
                voice.name.toLowerCase().includes('quiet')
              );
              
              const feminineVoices = voices.filter(voice => 
                voice.name.includes('Samantha') || 
                voice.name.includes('Karen') ||
                voice.name.includes('Zira') ||
                voice.name.includes('Female') ||
                voice.name.includes('Moira') ||
                voice.name.includes('Veena') ||
                voice.name.includes('Tessa')
              );
              
              // Combine both lists, prioritizing actual whisper voices
              preferredVoices = [...whisperyVoices, ...feminineVoices];
              
              // If no specific voices found, fallback to these options
              if (preferredVoices.length === 0) {
                preferredVoices = [
                  voices.find(voice => voice.name.includes('Samantha')),
                  voices.find(voice => voice.name.includes('Google US English Female')),
                  voices.find(voice => voice.name.includes('Microsoft Zira')),
                  voices.find(voice => voice.name.includes('Karen'))
                ].filter(Boolean);
              }
            } else {
              // For other emotional tones, use appropriate voices
              preferredVoices = [
                voices.find(voice => voice.name.includes('Daniel')),
                voices.find(voice => voice.name.includes('Google US English Male')),
                voices.find(voice => voice.name.includes('Microsoft David')),
                voices.find(voice => voice.name.toLowerCase().includes(emotionalTone)),
                voices.find(voice => voice.name.includes('Google US English Female'))
              ].filter(Boolean);
            }
            
            if (preferredVoices.length > 0) {
              utterance.voice = preferredVoices[0] as SpeechSynthesisVoice;
              console.log(`Selected voice: ${utterance.voice.name}`);
            } else if (voices.length > 0) {
              // Fallback to any available voice
              utterance.voice = voices[0];
              console.log(`Fallback voice: ${utterance.voice.name}`);
            }
          }
        };
        
        // Check if voices are already loaded
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          loadVoices();
        } else {
          // Wait for voices to be loaded
          window.speechSynthesis.onvoiceschanged = loadVoices;
        }
        
        // Set initial properties
        const settings = toneSettings[emotionalTone];
        utterance.rate = settings.rate;
        utterance.pitch = settings.pitch;
        utterance.volume = volume;
      
      // Set up audio processing nodes for effects
      const gainNode = context.createGain();
      gainNode.gain.value = volume;
      gainNode.connect(context.destination);
      gainNodeRef.current = gainNode;

      // Create filter for tone coloration
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = settings.filterFrequency || 22050; // Default to max if not using filter
      filter.Q.value = settings.filterQ || 0;
      filter.connect(gainNode);
      filterRef.current = filter;

      // Store reference to utterance
      utteranceRef.current = utterance;
      
      // Generate word timings (approximate)
      generateWordTimings();
      
      // Mark as initialized
      setIsInitialized(true);
      
      // Clean up on unmount
      return () => {
        stopNarration();
        if (context.state !== 'closed') {
          context.close();
        }
      };
    } catch (error) {
      console.error("Error initializing audio context:", error);
      setError("Failed to initialize audio. Please try again.");
    }
  }
  }, [isInitialized, volume, emotionalTone, content]);

  // Generate approximate word timings
  const generateWordTimings = () => {
    const words = wordsArray.current;
    const settings = toneSettings[emotionalTone];
    const avgWordDuration = 0.3 / settings.rate; // Approximate time per word
    
    let totalTime = 0;
    const timings = words.map(word => {
      // Words with punctuation and longer words take more time
      const hasPunctuation = /[.!?,;:]/.test(word);
      const wordLength = word.length;
      const wordTime = avgWordDuration * (hasPunctuation ? 1.5 : 1) * (wordLength > 8 ? 1.2 : 1);
      
      totalTime += wordTime;
      return totalTime;
    });
    
    wordTimings.current = timings;
    setDuration(totalTime);
    
    // Prepare highlighted text for display
    setHighlightedText(words.map((_, i) => i === 0 ? 'active' : 'inactive'));
  };

  // Effect to apply emotional tone modulations
  useEffect(() => {
    if (isInitialized && utteranceRef.current) {
      const settings = toneSettings[emotionalTone];
      
      // Update speech synthesis settings
      utteranceRef.current.rate = settings.rate;
      utteranceRef.current.pitch = settings.pitch;
      
      // Update filter settings if in use
      if (filterRef.current && settings.filterFrequency > 0) {
        filterRef.current.frequency.value = settings.filterFrequency;
        filterRef.current.Q.value = settings.filterQ;
      }
      
      // Regenerate word timings with new rate
      generateWordTimings();
    }
  }, [emotionalTone, isInitialized]);

  // Start narration
  const startNarration = () => {
    if (!isInitialized || isLoading) return;
    
    try {
      setIsLoading(true);
      if (audioContext?.state === 'suspended') {
        audioContext.resume();
      }
      
      const utterance = utteranceRef.current;
      if (!utterance) {
        throw new Error("Speech synthesis not initialized");
      }
      
      // Set up event handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsLoading(false);
        simulateWordHighlighting(0);
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setProgress(100);
        setCurrentTime(duration);
        setCurrentWordIndex(wordsArray.current.length - 1);
      };
      
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setError("Error during narration. Please try again.");
        setIsPlaying(false);
        setIsLoading(false);
      };
      
      // Prepare text for narration based on emotional tone
      let textToSpeak = content;
      
      // Special processing for whisper mode
      if (emotionalTone === 'whisper') {
        // For whisper mode, we add several effects to create a more authentic whisper
        
        // First, apply text transformations to make it sound more like a whisper
        textToSpeak = content
          // Add pauses between sentences for dramatic effect
          .replace(/([.!?])\s+/g, '$1... ')
          
          // Insert special SSML whisper markers for browsers that support it
          .replace(/\b(\w+)\b/g, '<prosody rate="slow" pitch="low" volume="soft">$1</prosody>')
          
          // Add extra spaces between words for slower pacing
          .replace(/\s+/g, '   ')
          
          // Add breath sounds at punctuation for realistic effect
          .replace(/,/g, ', <break time="0.3s"/> <prosody volume="x-soft">*inhale*</prosody> ')
          .replace(/\./g, '. <break time="0.5s"/> <prosody volume="x-soft">*soft breath*</prosody> ')
          
          // Add occasional whispery emphasis to important words
          .replace(/\b(fear|dark|death|blood|scream|hide|watch|listen|careful|behind|danger|hear|kill)\b/gi, 
                   '<emphasis level="strong">$1</emphasis>');
        
        // Log the formatted text for debugging
        console.log("Whisper text processing applied:", textToSpeak.substring(0, 100) + "...");
        
        // Ensure volume is appropriately lower for whisper effect
        if (utterance.volume > 0.4) {
          utterance.volume = 0.35; // Even lower volume for whisper
        }
      }
      
      // Set the text to narrate
      utterance.text = textToSpeak;
      
      // Start narration
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Failed to start narration:", err);
      setError("Failed to initialize audio narration. Please try again.");
      setIsLoading(false);
    }
  };

  // Stop narration
  const stopNarration = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    
    // Clear any pending timeouts
    if (speakTimeout.current !== null) {
      window.clearTimeout(speakTimeout.current);
      speakTimeout.current = null;
    }
  };

  // Pause/Resume narration
  const togglePlayPause = () => {
    if (isPlaying) {
      stopNarration();
    } else {
      startNarration();
    }
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    // Speech synthesis API doesn't support seeking, so we need to restart
    // and calculate the new position
    stopNarration();
    
    // Calculate new time
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
    
    // Find the closest word to this time position
    const newWordIndex = wordTimings.current.findIndex(time => time >= newTime);
    setCurrentWordIndex(newWordIndex >= 0 ? newWordIndex : 0);
    
    // Update progress
    const newProgress = (newTime / duration) * 100;
    setProgress(newProgress);
    
    // Restart from new position if we were playing
    if (isPlaying) {
      // Get remaining text
      let remainingText = wordsArray.current.slice(newWordIndex).join(' ');
      
      // Apply whisper formatting if in whisper mode
      if (emotionalTone === 'whisper') {
        remainingText = remainingText
          .replace(/([.!?])\s+/g, '$1... ')
          .replace(/\s+/g, '  ')
          .replace(/,/g, ', *soft breath* ')
          .replace(/\./g, '. *soft breath* ');
      }
      
      const utterance = utteranceRef.current;
      if (utterance) {
        utterance.text = remainingText;
        window.speechSynthesis.speak(utterance);
        simulateWordHighlighting(newWordIndex);
      }
    }
  };

  // Simulate word highlighting during narration
  const simulateWordHighlighting = (startIndex: number) => {
    if (speakTimeout.current !== null) {
      window.clearTimeout(speakTimeout.current);
    }
    
    const words = wordsArray.current;
    if (startIndex >= words.length) return;
    
    setCurrentWordIndex(startIndex);
    
    // Update highlighted text array
    const newHighlightedText = words.map((_, i) => {
      if (i < startIndex) return 'spoken';
      if (i === startIndex) return 'active';
      return 'inactive';
    });
    setHighlightedText(newHighlightedText);
    
    // Scroll to the current word if autoScroll is enabled
    if (autoScroll && contentRef.current) {
      const wordElements = contentRef.current.querySelectorAll('.word');
      if (wordElements[startIndex]) {
        wordElements[startIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
    
    // Calculate time until next word
    const currentWordTime = startIndex === 0 ? wordTimings.current[0] : 
      wordTimings.current[startIndex] - wordTimings.current[startIndex - 1];
    
    // Move to next word after the calculated time
    speakTimeout.current = window.setTimeout(() => {
      // Update current time and progress
      const newTime = wordTimings.current[startIndex];
      setCurrentTime(newTime);
      setProgress((newTime / duration) * 100);
      
      // Call position change callback if provided
      if (onPositionChange) {
        onPositionChange(startIndex / words.length);
      }
      
      // Move to next word
      simulateWordHighlighting(startIndex + 1);
    }, currentWordTime * 1000);
  };

  // Format time display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    if (vol === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
    
    // Update utterance volume
    if (utteranceRef.current) {
      utteranceRef.current.volume = vol;
    }
    
    // Update gain node
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = vol;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      handleVolumeChange([volume || 0.7]);
    } else {
      setIsMuted(true);
      
      // Store the current volume but set actual volume to 0
      if (utteranceRef.current) {
        utteranceRef.current.volume = 0;
      }
      
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = 0;
      }
    }
  };

  // Reset narration
  const resetNarration = () => {
    stopNarration();
    setCurrentTime(0);
    setProgress(0);
    setCurrentWordIndex(0);
    
    // Update highlighted text array
    const newHighlightedText = wordsArray.current.map((_, i) => i === 0 ? 'active' : 'inactive');
    setHighlightedText(newHighlightedText);
  };

  // Render the narration UI
  return (
    <div className={cn("rounded-lg border shadow-sm bg-card/80 backdrop-blur-sm w-full overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="text-sm font-medium">{title || "Story Narration"}</h3>
            <p className="text-xs text-muted-foreground">Whisper-like audio narration</p>
          </div>
        </div>
        <Badge variant="outline" className="capitalize">
          {emotionalTone} Mode
        </Badge>
      </div>
      
      {/* Audio playback controls */}
      <div className="p-4 space-y-4">
        {/* Progress bar */}
        <div className="space-y-1">
          <Slider
            value={[progress]}
            min={0}
            max={100}
            step={0.1}
            aria-label="Narration progress"
            className="cursor-pointer"
            onValueChange={(val) => {
              const newProgress = val[0];
              const newTime = (newProgress / 100) * duration;
              
              // Find the closest word to this time position
              const newWordIndex = wordTimings.current.findIndex(time => time >= newTime);
              if (newWordIndex >= 0) {
                stopNarration();
                setCurrentTime(newTime);
                setProgress(newProgress);
                setCurrentWordIndex(newWordIndex);
                
                // Update highlighted text
                const newHighlightedText = wordsArray.current.map((_, i) => {
                  if (i < newWordIndex) return 'spoken';
                  if (i === newWordIndex) return 'active';
                  return 'inactive';
                });
                setHighlightedText(newHighlightedText);
                
                // Restart from new position if we were playing
                if (isPlaying) {
                  // Get remaining text
                  let remainingText = wordsArray.current.slice(newWordIndex).join(' ');
                  
                  // Apply whisper formatting if in whisper mode
                  if (emotionalTone === 'whisper') {
                    remainingText = remainingText
                      .replace(/([.!?])\s+/g, '$1... ')
                      .replace(/\s+/g, '  ')
                      .replace(/,/g, ', *soft breath* ')
                      .replace(/\./g, '. *soft breath* ');
                  }
                  
                  const utterance = utteranceRef.current;
                  if (utterance) {
                    utterance.text = remainingText;
                    window.speechSynthesis.speak(utterance);
                    simulateWordHighlighting(newWordIndex);
                  }
                }
              }
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <div>{formatTime(currentTime)}</div>
            <div>{formatTime(duration)}</div>
          </div>
        </div>
        
        {/* Playback controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(-10)}
              disabled={isLoading || currentTime <= 0}
              aria-label="Skip backward 10 seconds"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              variant={isPlaying ? "outline" : "default"}
              size="icon"
              onClick={togglePlayPause}
              disabled={isLoading}
              className={isPlaying ? "border-primary/50" : ""}
              aria-label={isPlaying ? "Pause narration" : "Play narration"}
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(10)}
              disabled={isLoading || currentTime >= duration}
              aria-label="Skip forward 10 seconds"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={resetNarration}
              disabled={isLoading || (currentTime === 0 && !isPlaying)}
              aria-label="Reset narration"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : volume > 0.5 ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <Volume1 className="h-4 w-4" />
              )}
            </Button>
            
            <div className="w-20">
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                aria-label="Volume"
                onValueChange={handleVolumeChange}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Narration text with highlighting */}
      <div 
        ref={contentRef}
        className="p-4 max-h-40 overflow-y-auto text-sm border-t"
      >
        {/* Display error if there is one */}
        {error && (
          <p className="text-destructive text-xs mb-2">
            {error}
          </p>
        )}
        
        {/* The narrated text with highlighting */}
        <p className="leading-relaxed">
          {wordsArray.current.map((word, index) => (
            <span
              key={index}
              className={cn(
                "word transition-colors duration-300",
                highlightedText[index] === 'active' && "text-primary font-medium",
                highlightedText[index] === 'spoken' && "opacity-70",
                highlightedText[index] === 'inactive' && "opacity-50"
              )}
            >
              {word}{' '}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}