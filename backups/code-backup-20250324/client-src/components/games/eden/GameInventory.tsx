import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Swords, Key, BookMarked, Potion, PlusCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameEngine } from './GameEngine';
import { InventoryItem } from './types';

interface GameInventoryProps {
  inventory: string[];
  onClose: () => void;
  gameEngine: GameEngine | null;
}

export function GameInventory({ inventory, onClose, gameEngine }: GameInventoryProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  
  useEffect(() => {
    if (!gameEngine) return;
    
    // Get inventory item details
    const itemDetails = inventory.map(itemId => {
      const item = gameEngine.getInventoryItemDetails(itemId);
      return item;
    }).filter(Boolean) as InventoryItem[];
    
    setItems(itemDetails);
  }, [inventory, gameEngine]);
  
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'weapon':
        return <Swords className="h-5 w-5 text-red-400" />;
      case 'key':
        return <Key className="h-5 w-5 text-yellow-400" />;
      case 'artifact':
        return <BookMarked className="h-5 w-5 text-blue-400" />;
      case 'consumable':
        return <Potion className="h-5 w-5 text-green-400" />;
      default:
        return <PlusCircle className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
  };
  
  const handleUseItem = () => {
    if (!selectedItem || !gameEngine) return;
    
    gameEngine.useInventoryItem(selectedItem.id);
    setSelectedItem(null);
  };
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <Card className="bg-black border-amber-900/50 p-4 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-amber-50">Inventory</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Your inventory is empty.</p>
              <p className="text-sm mt-2">Explore Eden's Hollow to find useful items.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {items.map((item, index) => (
                <div 
                  key={index}
                  className={`p-3 border rounded-md cursor-pointer transition-all
                    ${selectedItem?.id === item.id 
                      ? 'border-amber-500 bg-amber-950/30' 
                      : 'border-gray-800 hover:border-amber-700'}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getItemIcon(item.type)}
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          )}
          
          {selectedItem && (
            <div className="mt-4 border-t border-amber-900/30 pt-4">
              <div className="flex flex-col md:flex-row items-start gap-4">
                <div className="flex-grow">
                  <h3 className="text-lg font-medium text-amber-50 mb-1">
                    {selectedItem.name}
                  </h3>
                  <p className="text-gray-400 mb-3">{selectedItem.description}</p>
                  
                  {selectedItem.properties && selectedItem.properties.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-bold text-amber-200 mb-1">Properties</h4>
                      <ul className="text-sm text-gray-300">
                        {selectedItem.properties.map((prop, idx) => (
                          <li key={idx} className="mb-1">{prop}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0 flex flex-col gap-2 min-w-[100px]">
                  {selectedItem.useAction && (
                    <Button 
                      variant="outline"
                      className="border-amber-900/50 hover:bg-amber-900/20 w-full"
                      onClick={handleUseItem}
                    >
                      Use
                    </Button>
                  )}
                  <Button 
                    variant="ghost"
                    className="text-gray-400 w-full"
                    onClick={() => setSelectedItem(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}