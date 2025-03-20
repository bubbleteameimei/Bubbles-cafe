import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Search, Info } from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryPanelProps {
  items: InventoryItem[];
  onItemUse: (item: InventoryItem) => void;
  onItemSelect: (item: InventoryItem) => void;
  isOpen: boolean;
  onClose: () => void;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({
  items,
  onItemUse,
  onItemSelect,
  isOpen,
  onClose
}) => {
  const [filter, setFilter] = useState('');
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);
  
  if (!isOpen) return null;
  
  const handleItemClick = (item: InventoryItem) => {
    setDetailItem(item);
  };
  
  const handleUseItem = (item: InventoryItem) => {
    onItemUse(item);
    setDetailItem(null);
  };
  
  const filteredItems = filter 
    ? items.filter(item => 
        item.name.toLowerCase().includes(filter.toLowerCase()) || 
        item.description.toLowerCase().includes(filter.toLowerCase())
      )
    : items;
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="relative bg-gray-900 rounded-lg w-full max-w-4xl h-3/4 overflow-hidden flex flex-col"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <div className="border-b border-gray-800 p-4 flex justify-between items-center">
          <h2 className="text-xl font-serif text-amber-200">Inventory</h2>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="pl-9 py-1 pr-4 bg-gray-800 text-white rounded-md text-sm w-64 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Item Grid */}
          <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-10 text-gray-400">
                {items.length === 0 ? "Your inventory is empty." : "No items match your search."}
              </div>
            ) : (
              filteredItems.map(item => (
                <motion.div
                  key={item.id}
                  className={`bg-gray-800 rounded-md p-3 cursor-pointer transition-colors duration-200 hover:bg-gray-700 flex flex-col items-center ${detailItem?.id === item.id ? 'ring-2 ring-amber-500' : ''}`}
                  onClick={() => handleItemClick(item)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-16 h-16 rounded-md bg-gray-900 flex items-center justify-center mb-2">
                    {item.iconUrl ? (
                      <img 
                        src={item.iconUrl} 
                        alt={item.name} 
                        className="w-12 h-12 object-contain" 
                      />
                    ) : (
                      <Sparkles className="w-8 h-8 text-amber-400" />
                    )}
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{item.type}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
          {/* Item Details */}
          <AnimatePresence>
            {detailItem && (
              <motion.div 
                className="border-l border-gray-800 w-96 p-6 bg-gray-900"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-medium">{detailItem.name}</h3>
                  <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 mb-6 flex items-center justify-center">
                  {detailItem.iconUrl ? (
                    <img 
                      src={detailItem.iconUrl} 
                      alt={detailItem.name} 
                      className="w-24 h-24 object-contain" 
                    />
                  ) : (
                    <Sparkles className="w-16 h-16 text-amber-400" />
                  )}
                </div>
                
                <div className="mb-4">
                  <div className="text-xs text-amber-300 uppercase tracking-wider mb-1">Type</div>
                  <div className="text-sm">{detailItem.type}</div>
                </div>
                
                {detailItem.properties && Object.keys(detailItem.properties).length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-amber-300 uppercase tracking-wider mb-1">Properties</div>
                    <div className="text-sm grid grid-cols-2 gap-2">
                      {Object.entries(detailItem.properties).map(([key, value]) => (
                        <div key={key} className="flex items-baseline">
                          <span className="text-gray-400 mr-2 capitalize">{key}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <div className="text-xs text-amber-300 uppercase tracking-wider mb-1">Description</div>
                  <p className="text-sm text-gray-300">{detailItem.description}</p>
                </div>
                
                {detailItem.lore && (
                  <div className="mb-6">
                    <div className="flex items-center text-xs text-blue-300 uppercase tracking-wider mb-1">
                      <Info size={12} className="mr-1" />
                      <span>Lore</span>
                    </div>
                    <p className="text-sm italic text-blue-200/80">{detailItem.lore}</p>
                  </div>
                )}
                
                <div className="flex space-x-4 mt-auto">
                  <button
                    onClick={() => handleUseItem(detailItem)}
                    className="flex-1 py-2 px-4 bg-amber-700 hover:bg-amber-600 rounded-md text-sm font-medium"
                  >
                    Use
                  </button>
                  
                  <button
                    onClick={() => onItemSelect(detailItem)}
                    className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium"
                  >
                    Examine
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InventoryPanel;