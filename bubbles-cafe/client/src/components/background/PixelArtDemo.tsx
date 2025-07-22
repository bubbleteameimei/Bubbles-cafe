import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PixelArtBackground from './PixelArtBackground';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const PixelArtDemo: React.FC = () => {
  // Demo state
  const [activePattern, setActivePattern] = useState<string>('haunted');
  const [pixelSize, setPixelSize] = useState<number>(16);
  const [customColors, setCustomColors] = useState<string[]>(['#1a1a1a', '#3d3d3d', '#6e6e6e', '#9e9e9e']);
  const [useCustomColors, setUseCustomColors] = useState<boolean>(false);
  const [width, setWidth] = useState<number>(480);
  const [height, setHeight] = useState<number>(320);
  
  // Pattern options
  const patternOptions = [
    { value: 'haunted', label: 'Haunted Mansion' },
    { value: 'forest', label: 'Dark Forest' },
    { value: 'graveyard', label: 'Graveyard' },
    { value: 'cave', label: 'Cave/Dungeon' },
    { value: 'blood', label: 'Blood Splatter' },
  ];
  
  // Update a specific color in the custom palette
  const updateColor = (index: number, newColor: string) => {
    const newColors = [...customColors];
    newColors[index] = newColor;
    setCustomColors(newColors);
  };
  
  // Add a new color to the custom palette
  const addColor = () => {
    if (customColors.length < 6) {
      setCustomColors([...customColors, '#000000']);
    }
  };
  
  // Remove a color from the custom palette
  const removeColor = (index: number) => {
    if (customColors.length > 1) {
      const newColors = customColors.filter((_, i) => i !== index);
      setCustomColors(newColors);
    }
  };
  
  // Reset to default palette
  const resetToDefault = () => {
    setUseCustomColors(false);
    switch (activePattern) {
      case 'haunted':
        setCustomColors(['#1a1a1a', '#3d3d3d', '#6e6e6e', '#9e9e9e']);
        break;
      case 'forest':
        setCustomColors(['#2d4f1e', '#1a2e29', '#5c3c1d']);
        break;
      case 'graveyard':
        setCustomColors(['#444444', '#666666', '#999999']);
        break;
      case 'cave':
        setCustomColors(['#252525', '#3d3d3d', '#5a5a5a', '#7a7a7a']);
        break;
      case 'blood':
        setCustomColors(['#8b0000', '#a30000', '#cf0000']);
        break;
      default:
        setCustomColors(['#1a1a1a', '#3d3d3d', '#6e6e6e', '#9e9e9e']);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Preview Panel */}
      <motion.div 
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg min-h-[400px] flex items-center justify-center"
        layoutId="preview-panel"
      >
        <div
          className="relative border border-gray-200 dark:border-gray-700 rounded overflow-hidden"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          <PixelArtBackground
            pattern={activePattern}
            pixelSize={pixelSize}
            palette={useCustomColors ? customColors : undefined}
            width={width}
            height={height}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 text-white p-6 rounded-lg max-w-xs text-center">
                <h2 className="text-2xl font-bold mb-2">Horror Awaits</h2>
                <p>This eerie background sets the perfect mood for your next terrifying tale.</p>
              </div>
            </div>
          </PixelArtBackground>
        </div>
      </motion.div>
      
      {/* Controls Panel */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Background Controls</h2>
        
        <div className="space-y-6">
          {/* Pattern Selection */}
          <div className="space-y-2">
            <Label htmlFor="pattern-select">Pattern</Label>
            <Select
              value={activePattern}
              onValueChange={(value) => {
                setActivePattern(value);
                if (!useCustomColors) {
                  resetToDefault();
                }
              }}
            >
              <SelectTrigger className="w-full" id="pattern-select">
                <SelectValue placeholder="Select a pattern" />
              </SelectTrigger>
              <SelectContent>
                {patternOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Pixel Size Slider */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="pixel-size">Pixel Size: {pixelSize}px</Label>
            </div>
            <Slider
              id="pixel-size"
              min={4}
              max={32}
              step={1}
              value={[pixelSize]}
              onValueChange={(value) => setPixelSize(value[0])}
              className="w-full"
            />
          </div>
          
          {/* Size Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width-input">Width (px)</Label>
              <Input
                id="width-input"
                type="number"
                min={100}
                max={1200}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height-input">Height (px)</Label>
              <Input
                id="height-input"
                type="number"
                min={100}
                max={800}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </div>
          </div>
          
          {/* Color Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Color Palette</Label>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={resetToDefault}
                >
                  Reset
                </Button>
                <Button 
                  size="sm" 
                  variant={useCustomColors ? "default" : "outline"}
                  onClick={() => setUseCustomColors(!useCustomColors)}
                >
                  {useCustomColors ? "Using Custom" : "Use Custom"}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {customColors.map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: color }}
                  />
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="w-16"
                  />
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    size="icon" 
                    variant="destructive"
                    onClick={() => removeColor(index)}
                    disabled={customColors.length <= 1}
                  >
                    <span className="sr-only">Remove color</span>
                    <span aria-hidden>×</span>
                  </Button>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                onClick={addColor}
                disabled={customColors.length >= 6}
                className="mt-2"
              >
                Add Color
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixelArtDemo;