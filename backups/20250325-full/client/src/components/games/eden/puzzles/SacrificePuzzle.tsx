import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Skull, Heart, Droplets, Rabbet } from 'lucide-react';

interface SacrificePuzzleProps {
  data: {
    items: {
      id: string;
      name: string;
      type: 'blood' | 'memory' | 'soul' | 'treasure' | 'life';
      value: number;
      description: string;
    }[];
    targetValue: number;
    maxSelections: number;
    description: string;
  };
  onSolveAttempt: (success: boolean) => void;
}

export function SacrificePuzzle({ data, onSolveAttempt }: SacrificePuzzleProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleItemClick = (itemId: string) => {
    if (isAnimating) return;
    
    if (selectedItems.includes(itemId)) {
      // Remove item if already selected
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else if (selectedItems.length < data.maxSelections) {
      // Add item if not at max selections
      setSelectedItems([...selectedItems, itemId]);
    }
  };
  
  const getSelectedValue = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = data.items.find(item => item.id === itemId);
      return total + (item?.value || 0);
    }, 0);
  };
  
  const handleSubmit = () => {
    // Check if the solution is valid
    const selectedValue = getSelectedValue();
    const isCorrect = selectedValue === data.targetValue;
    
    // Visual feedback
    setIsAnimating(true);
    
    setTimeout(() => {
      onSolveAttempt(isCorrect);
      setIsAnimating(false);
      
      if (!isCorrect) {
        // Clear selection on failure
        setSelectedItems([]);
      }
    }, 1000);
  };
  
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'blood':
        return <Droplets className="h-5 w-5 text-red-500" />;
      case 'memory':
        return <Rabbet className="h-5 w-5 text-blue-400" />;
      case 'soul':
        return <Heart className="h-5 w-5 text-purple-400" />;
      case 'treasure':
        return <Flame className="h-5 w-5 text-yellow-400" />;
      case 'life':
        return <Skull className="h-5 w-5 text-gray-400" />;
      default:
        return <Flame className="h-5 w-5 text-amber-400" />;
    }
  };
  
  return (
    <div className="sacrifice-puzzle">
      <div className="mb-6">
        <p className="text-amber-50 mb-4">{data.description}</p>
        
        {/* Ritual altar visualization */}
        <div className="ritual-altar relative p-6 border-2 border-red-900/30 bg-black rounded-md mb-6">
          <div className="absolute inset-0 bg-red-900/10 animate-pulse"></div>
          <div className="relative flex items-center justify-center">
            {selectedItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                <AnimatePresence>
                  {selectedItems.map((itemId) => {
                    const item = data.items.find(i => i.id === itemId);
                    if (!item) return null;
                    
                    return (
                      <motion.div
                        key={itemId}
                        className="border border-red-700 bg-red-950/30 rounded-md p-2 flex items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        {getItemIcon(item.type)}
                        <span className="text-sm text-red-200">{item.name}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-red-700 opacity-70 flex flex-col items-center">
                <Flame className="h-10 w-10 animate-pulse" />
                <span className="text-sm mt-2">The altar awaits your sacrifice</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Current sacrifice value */}
        <div className="bg-gray-900 p-3 rounded-md mb-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">Sacrifice Power:</div>
            <div className="text-amber-400 font-bold">{getSelectedValue()} / {data.targetValue}</div>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
            <motion.div 
              className="h-full bg-red-700" 
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min(100, (getSelectedValue() / data.targetValue) * 100)}%`,
                backgroundColor: getSelectedValue() > data.targetValue ? '#ef4444' : '#b91c1c'
              }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500 text-right">
            ({selectedItems.length}/{data.maxSelections} items)
          </div>
        </div>
        
        {/* Available items */}
        <div className="grid gap-2 mb-4">
          {data.items.map((item) => (
            <motion.div
              key={item.id}
              className={`p-3 border rounded-md cursor-pointer transition-all
                ${selectedItems.includes(item.id) 
                  ? 'border-red-700 bg-red-950/30' 
                  : 'border-gray-700 hover:border-red-900 bg-gray-900'}`}
              onClick={() => handleItemClick(item.id)}
              animate={
                isAnimating && selectedItems.includes(item.id)
                  ? { borderColor: ['rgba(185, 28, 28, 0.5)', 'rgba(220, 38, 38, 1)', 'rgba(185, 28, 28, 0.5)'] }
                  : {}
              }
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-1">
                {getItemIcon(item.type)}
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-red-400 ml-auto">Value: {item.value}</span>
              </div>
              <p className="text-xs text-gray-400">{item.description}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 border-red-900/50 hover:bg-red-900/20 text-red-400"
            onClick={() => setSelectedItems([])}
            disabled={selectedItems.length === 0 || isAnimating}
          >
            Clear All
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-amber-900/50 hover:bg-amber-900/20 text-amber-400"
            onClick={handleSubmit}
            disabled={selectedItems.length === 0 || isAnimating}
          >
            Perform Sacrifice
          </Button>
        </div>
      </div>
    </div>
  );
}