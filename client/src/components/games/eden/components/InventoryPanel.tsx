import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, RotateCw } from 'lucide-react';
import { Item } from '../types';

interface InventoryPanelProps {
  items: Item[];
  onItemUse: (item: Item) => void;
  onItemSelect: (item: Item) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function InventoryPanel({ items, onItemUse, onItemSelect, isOpen, onClose }: InventoryPanelProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Select an item to see details
  const handleItemSelect = (item: Item) => {
    setSelectedItem(item);
    onItemSelect(item);
  };
  
  // Use the selected item
  const handleItemUse = () => {
    if (selectedItem) {
      onItemUse(selectedItem);
      setShowTooltip(true);
      
      // Hide the tooltip after a delay
      setTimeout(() => {
        setShowTooltip(false);
      }, 2000);
    }
  };
  
  // Render the item details panel
  const renderItemDetails = () => {
    if (!selectedItem) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="bg-gray-900/90 p-4 rounded-lg w-full mt-4"
      >
        <div className="flex items-start mb-4">
          <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden mr-4">
            {selectedItem.image ? (
              <img 
                src={selectedItem.image} 
                alt={selectedItem.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No image
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{selectedItem.name}</h3>
            {selectedItem.type && (
              <span className="inline-block bg-gray-800 px-2 py-1 rounded text-xs text-gray-300 mb-2">
                {selectedItem.type}
              </span>
            )}
            <p className="text-gray-300 text-sm">{selectedItem.description}</p>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-4">
          <button
            onClick={handleItemUse}
            className="flex-1 bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors flex items-center justify-center"
          >
            <RotateCw size={16} className="mr-2" />
            Use Item
          </button>
          
          {/* Action Tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-full left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-sm p-2 rounded mt-2"
              >
                {selectedItem.canUse ? 'Item used!' : 'Cannot use item here'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };
  
  // Render the inventory grid
  const renderInventoryGrid = () => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-32 text-gray-400">
          <Info size={24} className="mb-2" />
          <p>Your inventory is empty</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
        {items.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => handleItemSelect(item)}
            className={`p-2 bg-gray-800/70 hover:bg-gray-700/70 rounded transition-colors flex flex-col items-center ${
              selectedItem?.id === item.id ? 'ring-2 ring-purple-500' : ''
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-12 h-12 bg-gray-900 rounded overflow-hidden mb-1">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                  No image
                </div>
              )}
            </div>
            <span className="text-xs text-center text-white truncate w-full">{item.name}</span>
            {item.quantity && item.quantity > 1 && (
              <span className="text-xs bg-gray-900 px-1 rounded-full text-gray-300 absolute top-0 right-0">
                {item.quantity}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    );
  };
  
  // Main component render
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-16 right-4 w-80 sm:w-96 bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-lg shadow-xl p-4 z-10"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-lg font-semibold">Inventory</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Inventory Grid */}
          {renderInventoryGrid()}
          
          {/* Item Details */}
          <AnimatePresence>
            {selectedItem && renderItemDetails()}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}