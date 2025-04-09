import React, { useState } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Slider 
} from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

// Hero section with dynamic typing animation
export const AnimatedHero = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-slate-800 text-white py-20 px-4 rounded-lg shadow-xl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Discover{' '}
          <TypeAnimation
            sequence={[
              'Immersive Stories', 2000,
              'Haunting Tales', 2000,
              'Cosmic Horror', 2000,
              'Psychological Thrillers', 2000,
              'Supernatural Mysteries', 2000,
            ]}
            wrapper="span"
            speed={50}
            className="text-primary"
            repeat={Infinity}
          />
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Experience a new dimension of interactive storytelling where your choices shape the narrative.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="font-medium">
            Start Reading
          </Button>
          <Button variant="outline" size="lg" className="font-medium border-white text-white hover:bg-white/10">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

// Interactive text reveal component
export const InteractiveTextReveal = () => {
  const [revealed, setRevealed] = useState(false);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-900 text-white">
        <CardTitle>The Ancient Manuscript</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="prose prose-sm max-w-none">
          <p>The researcher had spent decades searching for this text. Now that it was in front of him, he hesitated...</p>
          
          {!revealed ? (
            <div className="py-8 flex justify-center">
              <Button onClick={() => setRevealed(true)}>Reveal the Text</Button>
            </div>
          ) : (
            <div className="my-4 p-4 bg-slate-100 rounded-md">
              <TypeAnimation
                sequence={[
                  `That is not dead which can eternal lie,
And with strange aeons even death may die.`,
                ]}
                wrapper="div"
                cursor={true}
                repeat={1}
                speed={80}
                className="font-serif italic text-slate-800"
                style={{ whiteSpace: 'pre-line' }}
              />
            </div>
          )}
          
          {revealed && (
            <p className="mt-4">
              As the words appeared on the page, the researcher felt a chill move through the room. Had he finally found the answer he'd been seeking all these years?
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Customizable animation playground
export const TypeAnimationPlayground = () => {
  const [sequence, setSequence] = useState<(string | number)[]>([
    'Welcome to the typing animation playground', 1000,
    'Customize your animation', 1000,
    'And see it in action!', 1000,
  ]);
  
  const [speed, setSpeed] = useState(40);
  const [cursor, setCursor] = useState(true);
  const [repeat, setRepeat] = useState<number | typeof Infinity>(Infinity);
  const [wrapper, setWrapper] = useState('h2');
  
  const [newText, setNewText] = useState('');
  const [newDelay, setNewDelay] = useState(1000);
  
  // Add new item to sequence
  const addToSequence = () => {
    if (newText.trim()) {
      setSequence([...sequence, newText, newDelay]);
      setNewText('');
    }
  };
  
  // Reset sequence
  const resetSequence = () => {
    setSequence([
      'Welcome to the typing animation playground', 1000,
      'Customize your animation', 1000,
      'And see it in action!', 1000,
    ]);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Type Animation Playground</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="configure">Configure</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="py-6">
            <div className="min-h-[200px] flex items-center justify-center p-6 bg-slate-100 rounded-lg">
              <TypeAnimation
                sequence={sequence}
                wrapper={wrapper as any}
                speed={speed}
                cursor={cursor}
                repeat={repeat}
                className="text-center text-2xl"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="configure" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="speed">Animation Speed: {speed}</Label>
                <Slider
                  id="speed"
                  min={10}
                  max={100}
                  step={5}
                  value={[speed]}
                  onValueChange={(value) => setSpeed(value[0])}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wrapper">HTML Element</Label>
                  <Select
                    value={wrapper}
                    onValueChange={setWrapper}
                  >
                    <SelectTrigger id="wrapper">
                      <SelectValue placeholder="Select element" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="h1">Heading 1</SelectItem>
                      <SelectItem value="h2">Heading 2</SelectItem>
                      <SelectItem value="h3">Heading 3</SelectItem>
                      <SelectItem value="p">Paragraph</SelectItem>
                      <SelectItem value="span">Span</SelectItem>
                      <SelectItem value="div">Div</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="repeat">Repeat</Label>
                  <Select
                    value={repeat === Infinity ? "infinity" : repeat.toString()}
                    onValueChange={(value) => setRepeat(value === "infinity" ? Infinity : parseInt(value))}
                  >
                    <SelectTrigger id="repeat">
                      <SelectValue placeholder="Select repeat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Once</SelectItem>
                      <SelectItem value="2">Twice</SelectItem>
                      <SelectItem value="3">Three times</SelectItem>
                      <SelectItem value="infinity">Infinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="cursor"
                  checked={cursor}
                  onCheckedChange={setCursor}
                />
                <Label htmlFor="cursor">Show cursor</Label>
              </div>
            </div>
            
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Animation Sequence</h3>
              <div className="space-y-2">
                {sequence.map((item, index) => (
                  <div key={index} className="text-sm border p-2 rounded">
                    {typeof item === 'string' ? (
                      <span>Text: "{item}"</span>
                    ) : (
                      <span>Delay: {item}ms</span>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-3">
                  <Input
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Add new text..."
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    value={newDelay}
                    onChange={(e) => setNewDelay(parseInt(e.target.value))}
                    min={100}
                    max={5000}
                    step={100}
                  />
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={resetSequence}>
                  Reset
                </Button>
                <Button onClick={addToSequence} disabled={!newText.trim()}>
                  Add to Sequence
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Complete demo component
export const TypeAnimationDemo = () => {
  return (
    <div className="space-y-10 p-4">
      <h1 className="text-3xl font-bold">Text Animation Examples</h1>
      
      <AnimatedHero />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InteractiveTextReveal />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Interactive Story Elements</h2>
          <p className="text-muted-foreground">
            Type animations can create suspense and engagement in interactive storytelling. 
            Click the button to reveal the hidden text.
          </p>
        </div>
      </div>
      
      <TypeAnimationPlayground />
    </div>
  );
};

export default TypeAnimationDemo;