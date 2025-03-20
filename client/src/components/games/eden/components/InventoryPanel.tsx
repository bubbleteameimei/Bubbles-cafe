import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InventoryItem } from '../types';

interface InventoryPanelProps {
  items: InventoryItem[];
  onItemSelect: (item: InventoryItem) => void;
  onItemUse: (item: InventoryItem) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({
  items,
  onItemSelect,
  onItemUse,
  isOpen,
  onClose
}) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
    onItemSelect(item);
  };

  const handleItemUse = () => {
    if (selectedItem) {
      onItemUse(selectedItem);
      setSelectedItem(null);
    }
  };

  const getIconColorClass = (type: string) => {
    switch (type) {
      case 'weapon': return 'text-red-600 dark:text-red-400';
      case 'artifact': return 'text-purple-600 dark:text-purple-400';
      case 'key': return 'text-yellow-600 dark:text-yellow-400';
      case 'consumable': return 'text-green-600 dark:text-green-400';
      case 'quest': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 w-full max-w-md rounded-lg overflow-hidden shadow-xl"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">Inventory</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 grid grid-cols-4 gap-3">
              {items.length === 0 ? (
                <div className="col-span-4 text-center text-gray-500 dark:text-gray-400 py-8">
                  Your inventory is empty
                </div>
              ) : (
                items.map(item => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleItemClick(item)}
                    className={`p-2 rounded-lg border-2 ${
                      selectedItem?.id === item.id 
                        ? 'border-blue-500 dark:border-blue-400' 
                        : 'border-gray-200 dark:border-gray-700'
                    } flex flex-col items-center justify-center`}
                  >
                    <div className={`text-2xl ${getIconColorClass(item.type)}`}>
                      {item.icon}
                    </div>
                    <div className="mt-1 text-xs font-medium truncate w-full text-center">
                      {item.name}
                    </div>
                  </motion.button>
                ))
              )}
            </div>
            
            {selectedItem && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium">{selectedItem.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedItem.description}
                </p>
                {selectedItem.useAction && (
                  <button
                    onClick={handleItemUse}
                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-md text-sm"
                  >
                    Use Item
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InventoryPanel;