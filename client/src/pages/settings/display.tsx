import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

interface HorrorEffects {
  ambient: boolean;
  jumpscares: boolean;
  weatherEffects: boolean;
  textEffects: boolean;
}

const defaultEffects: HorrorEffects = {
  ambient: false,
  jumpscares: false,
  weatherEffects: false,
  textEffects: false
};

export default function VisualHorrorSettingsPage() {
  const { toast } = useToast();
  const [ambienceLevel, setAmbienceLevel] = useState<number>(50);
  const [effects, setEffects] = useState<HorrorEffects>(defaultEffects);

  // Load saved preferences on component mount
  useEffect(() => {
    try {
      // Load theme
      const savedTheme = localStorage.getItem('horror-theme');
      if (savedTheme) {
        handleThemeChange(savedTheme, false);
      }

      // Load ambience level
      const savedAmbience = localStorage.getItem('ambience-level');
      if (savedAmbience) {
        setAmbienceLevel(Number(savedAmbience));
      }

      // Load effects
      const savedEffects = localStorage.getItem('horror-effects');
      if (savedEffects) {
        setEffects(JSON.parse(savedEffects));
      }
    } catch (error) {
      console.error('Error loading saved preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load saved preferences",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleThemeChange = (value: string, notify: boolean = true) => {
    if (notify) {
      toast({
        title: "Theme Updated",
        description: `Switched to ${value} theme`,
      });
    }
    // Save theme preference to localStorage
    localStorage.setItem('horror-theme', value);
  };

  const handleAmbienceChange = (value: number[]) => {
    const newValue = value[0];
    setAmbienceLevel(newValue);
    // Save ambience level to localStorage
    localStorage.setItem('ambience-level', newValue.toString());
  };

  const toggleEffect = (effect: keyof HorrorEffects) => {
    setEffects(prev => {
      const newEffects = {
        ...prev,
        [effect]: !prev[effect]
      };
      // Save effects state to localStorage
      localStorage.setItem('horror-effects', JSON.stringify(newEffects));
      return newEffects;
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-red-800 dark:text-red-500">Visual Horror Settings</h1>
      <p className="text-muted-foreground">Customize the horror elements and atmospheric effects for a more immersive reading experience.</p>

      <Card className="border-red-900/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader>
          <CardTitle>Horror Theme Settings</CardTitle>
          <CardDescription>Customize your nightmare experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-lg">Theme Variant</Label>
            <RadioGroup defaultValue="haunted" onValueChange={handleThemeChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="haunted" id="haunted" />
                <Label htmlFor="haunted">Haunted Mansion</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gothic" id="gothic" />
                <Label htmlFor="gothic">Gothic Horror</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lovecraftian" id="lovecraftian" />
                <Label htmlFor="lovecraftian">Cosmic Horror</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="psychological" id="psychological" />
                <Label htmlFor="psychological">Psychological Horror</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label className="text-lg">Ambience Intensity</Label>
            <Slider 
              value={[ambienceLevel]}
              max={100} 
              step={1}
              onValueChange={handleAmbienceChange}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Controls the intensity of atmospheric effects and animations
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ambient" className="text-lg">Ambient Sound Effects</Label>
                <p className="text-sm text-muted-foreground">Background sounds and eerie noises</p>
              </div>
              <Switch 
                id="ambient" 
                checked={effects.ambient}
                onCheckedChange={() => toggleEffect('ambient')}
                size="md"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="jumpscares" className="text-lg">Subtle Horror Effects</Label>
                <p className="text-sm text-muted-foreground">Occasional unsettling visual elements</p>
              </div>
              <Switch 
                id="jumpscares" 
                checked={effects.jumpscares}
                onCheckedChange={() => toggleEffect('jumpscares')}
                size="md"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weatherEffects" className="text-lg">Weather Effects</Label>
                <p className="text-sm text-muted-foreground">Atmospheric conditions like fog and rain</p>
              </div>
              <Switch 
                id="weatherEffects" 
                checked={effects.weatherEffects}
                onCheckedChange={() => toggleEffect('weatherEffects')}
                size="md"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="textEffects" className="text-lg">Dynamic Text Effects</Label>
                <p className="text-sm text-muted-foreground">Animated text and horror typography</p>
              </div>
              <Switch 
                id="textEffects" 
                checked={effects.textEffects}
                onCheckedChange={() => toggleEffect('textEffects')}
                size="md"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}