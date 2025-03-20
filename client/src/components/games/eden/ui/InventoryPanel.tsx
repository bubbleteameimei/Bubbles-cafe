import React, { useState } from 'react';
import { Item } from '../types';

interface InventoryPanelProps {
  items: Item[];
  onItemUse: (itemId: string) => void;
  onInventoryClose: () => void;
  isOpen: boolean;
}

/**
 * Displays and manages the player's inventory with item categories
 */
const InventoryPanel: React.FC<InventoryPanelProps> = ({
  items,
  onItemUse,
  onInventoryClose,
  isOpen
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  // Don't render if inventory is closed
  if (!isOpen) {
    return null;
  }
  
  // Get all available categories from items
  const getCategories = (): string[] => {
    const categories = new Set<string>();
    
    items.forEach(item => {
      if (item.category) {
        categories.add(item.category);
      }
    });
    
    return ['all', ...Array.from(categories)];
  };
  
  // Filter items by selected category
  const getFilteredItems = (): Item[] => {
    if (selectedCategory === 'all') {
      return items;
    }
    
    return items.filter(item => item.category === selectedCategory);
  };
  
  // Handle item selection
  const handleItemSelect = (item: Item) => {
    setSelectedItem(item);
  };
  
  // Handle item use
  const handleItemUse = () => {
    if (selectedItem) {
      onItemUse(selectedItem.id);
      setSelectedItem(null);
    }
  };
  
  return (
    <div className="inventory-panel" style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      width: '350px',
      backgroundColor: 'rgba(20, 25, 35, 0.9)',
      borderRadius: '8px',
      padding: '15px',
      color: '#fff',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(100, 120, 150, 0.3)',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      zIndex: 1000
    }}>
      {/* Inventory header */}
      <div className="inventory-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '10px'
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '18px',
          color: '#e0e0ff',
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(100, 100, 255, 0.3)'
        }}>
          Inventory
        </h3>
        <button
          onClick={onInventoryClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#aaa',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 5px'
          }}
        >
          ×
        </button>
      </div>
      
      {/* Category tabs */}
      <div className="inventory-categories" style={{
        display: 'flex',
        gap: '5px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '10px'
      }}>
        {getCategories().map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: '5px 10px',
              backgroundColor: selectedCategory === category 
                ? 'rgba(80, 100, 180, 0.8)' 
                : 'rgba(40, 50, 80, 0.6)',
              border: '1px solid rgba(100, 120, 180, 0.5)',
              borderRadius: '5px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              textTransform: 'capitalize'
            }}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Items grid */}
      <div className="inventory-items" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        maxHeight: '220px',
        overflowY: 'auto',
        padding: '5px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(100, 120, 150, 0.5) rgba(30, 40, 60, 0.3)'
      }}>
        {getFilteredItems().map(item => (
          <div
            key={item.id}
            className={`inventory-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
            onClick={() => handleItemSelect(item)}
            style={{
              width: '100%',
              aspectRatio: '1',
              backgroundColor: selectedItem?.id === item.id 
                ? 'rgba(80, 120, 200, 0.3)' 
                : 'rgba(40, 50, 70, 0.5)',
              border: selectedItem?.id === item.id 
                ? '2px solid rgba(100, 150, 250, 0.8)' 
                : '1px solid rgba(100, 120, 150, 0.3)',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '5px',
              position: 'relative',
              transition: 'all 0.2s'
            }}
          >
            {/* Item icon */}
            <div className="item-icon" style={{
              fontSize: '24px',
              marginBottom: '5px'
            }}>
              {getItemIcon(item.type)}
            </div>
            
            {/* Item name */}
            <div className="item-name" style={{
              fontSize: '12px',
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%'
            }}>
              {item.name}
            </div>
            
            {/* Item count badge (if quantity > 1) */}
            {item.quantity && item.quantity > 1 && (
              <div className="item-count" style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                backgroundColor: 'rgba(80, 120, 200, 0.8)',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                {item.quantity}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Item details */}
      {selectedItem && (
        <div className="inventory-item-details" style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '10px'
        }}>
          <div className="item-header" style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <div className="item-icon-large" style={{
              fontSize: '30px',
              marginRight: '10px',
              backgroundColor: 'rgba(60, 80, 120, 0.5)',
              width: '40px',
              height: '40px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '8px',
              border: '1px solid rgba(100, 150, 200, 0.4)'
            }}>
              {getItemIcon(selectedItem.type)}
            </div>
            <div>
              <h4 style={{ 
                margin: '0 0 5px 0',
                color: '#fff',
                fontSize: '16px'
              }}>
                {selectedItem.name}
              </h4>
              <div className="item-type" style={{
                fontSize: '12px',
                color: '#aaa',
                textTransform: 'capitalize'
              }}>
                {selectedItem.type} {selectedItem.category && `• ${selectedItem.category}`}
              </div>
            </div>
          </div>
          
          {/* Item description */}
          <p className="item-description" style={{
            margin: '0 0 10px 0',
            fontSize: '14px',
            lineHeight: 1.4,
            color: '#ddd'
          }}>
            {selectedItem.description}
          </p>
          
          {/* Action buttons */}
          <div className="item-actions" style={{
            display: 'flex',
            gap: '10px'
          }}>
            <button
              onClick={handleItemUse}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: 'rgba(60, 100, 150, 0.7)',
                color: '#fff',
                border: '1px solid rgba(100, 140, 200, 0.5)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Use
            </button>
            <button
              onClick={() => setSelectedItem(null)}
              style={{
                padding: '8px',
                backgroundColor: 'rgba(60, 60, 80, 0.7)',
                color: '#ccc',
                border: '1px solid rgba(100, 100, 120, 0.5)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                width: '80px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get an icon based on item type
const getItemIcon = (type: string): string => {
  switch (type) {
    case 'key':
      return '🔑';
    case 'document':
      return '📄';
    case 'weapon':
      return '🗡️';
    case 'tool':
      return '🔧';
    case 'potion':
      return '🧪';
    case 'food':
      return '🍞';
    case 'artifact':
      return '🏺';
    case 'book':
      return '📕';
    case 'clothing':
      return '👕';
    case 'relic':
      return '✨';
    default:
      return '📦';
  }
};

export default InventoryPanel;