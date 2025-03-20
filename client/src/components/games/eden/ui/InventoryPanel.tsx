import React, { useState } from 'react';
import { Inventory, Item } from '../types';

export interface InventoryPanelProps {
  inventory: Inventory;
  onItemClick: (itemId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({
  inventory,
  onItemClick,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  if (!isOpen) {
    return null;
  }
  
  // Group items by category
  const categorizedItems: Record<string, Item[]> = { all: [] };
  inventory.items.forEach(item => {
    categorizedItems.all.push(item);
    
    const category = item.category || 'misc';
    if (!categorizedItems[category]) {
      categorizedItems[category] = [];
    }
    categorizedItems[category].push(item);
  });
  
  const categories = Object.keys(categorizedItems).filter(category => 
    categorizedItems[category].length > 0
  );
  
  // Handle item click
  const handleItemClick = (item: Item) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item);
    onItemClick(item.id);
  };
  
  // Filter displayed items based on active tab
  const displayedItems = categorizedItems[activeTab] || [];
  
  return (
    <div className="inventory-overlay">
      <div className="inventory-panel">
        <div className="inventory-header">
          <h2>Inventory</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="inventory-tabs">
          {categories.map(category => (
            <button
              key={category}
              className={`tab-button ${activeTab === category ? 'active' : ''}`}
              onClick={() => setActiveTab(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="inventory-content">
          {displayedItems.length === 0 ? (
            <div className="empty-inventory">
              No items in this category
            </div>
          ) : (
            <div className="item-grid">
              {displayedItems.map(item => (
                <div
                  key={item.id}
                  className={`item-slot ${selectedItem?.id === item.id ? 'selected' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="item-icon">
                    <img src={item.icon} alt={item.name} />
                    {item.quantity > 1 && (
                      <div className="item-quantity">{item.quantity}</div>
                    )}
                  </div>
                  <div className="item-name">{item.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {selectedItem && (
          <div className="item-details">
            <h3>{selectedItem.name}</h3>
            <p>{selectedItem.description}</p>
            <div className="item-properties">
              <div className="property">
                <span className="property-label">Type:</span>
                <span className="property-value">{selectedItem.type}</span>
              </div>
              {selectedItem.usable && (
                <button 
                  className="use-item-button"
                  onClick={() => handleItemClick(selectedItem)}
                >
                  Use Item
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .inventory-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 500;
        }
        
        .inventory-panel {
          background-color: rgba(30, 30, 35, 0.95);
          border: 2px solid #8a5c41;
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          height: 80%;
          max-height: 600px;
          display: flex;
          flex-direction: column;
          color: #eee;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
        }
        
        .inventory-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          background-color: rgba(50, 30, 20, 0.7);
          border-bottom: 1px solid #8a5c41;
          border-radius: 6px 6px 0 0;
        }
        
        .inventory-header h2 {
          margin: 0;
          font-size: 22px;
          font-family: 'Cinzel', serif;
          color: #f1d7c5;
        }
        
        .close-button {
          background: transparent;
          border: none;
          color: #aaa;
          font-size: 24px;
          cursor: pointer;
          padding: 0 5px;
          line-height: 1;
        }
        
        .close-button:hover {
          color: #fff;
        }
        
        .inventory-tabs {
          display: flex;
          padding: 0 10px;
          background-color: rgba(40, 25, 15, 0.7);
          border-bottom: 1px solid #6a4331;
          overflow-x: auto;
        }
        
        .tab-button {
          padding: 10px 15px;
          background-color: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          color: #ccc;
          cursor: pointer;
          font-size: 15px;
          white-space: nowrap;
        }
        
        .tab-button.active {
          color: #f1d7c5;
          border-bottom-color: #8a5c41;
        }
        
        .inventory-content {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
        }
        
        .empty-inventory {
          display: flex;
          height: 100%;
          justify-content: center;
          align-items: center;
          font-style: italic;
          color: #aaa;
        }
        
        .item-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          grid-gap: 10px;
        }
        
        .item-slot {
          background-color: rgba(60, 40, 30, 0.5);
          border: 1px solid #6a4331;
          border-radius: 4px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .item-slot:hover {
          background-color: rgba(80, 50, 30, 0.7);
        }
        
        .item-slot.selected {
          background-color: rgba(100, 60, 30, 0.8);
          border-color: #cf9a6b;
        }
        
        .item-icon {
          position: relative;
          width: 50px;
          height: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .item-icon img {
          max-width: 90%;
          max-height: 90%;
        }
        
        .item-quantity {
          position: absolute;
          bottom: -5px;
          right: -5px;
          background-color: rgba(0, 0, 0, 0.7);
          border: 1px solid #6a4331;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 12px;
        }
        
        .item-name {
          margin-top: 5px;
          font-size: 12px;
          text-align: center;
          word-break: break-word;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .item-details {
          padding: 15px;
          background-color: rgba(40, 25, 15, 0.7);
          border-top: 1px solid #6a4331;
        }
        
        .item-details h3 {
          margin: 0 0 10px;
          color: #f1d7c5;
          font-size: 18px;
        }
        
        .item-details p {
          margin: 0 0 10px;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .item-properties {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }
        
        .property {
          display: flex;
          font-size: 13px;
        }
        
        .property-label {
          color: #aaa;
          margin-right: 5px;
        }
        
        .property-value {
          color: #f1d7c5;
        }
        
        .use-item-button {
          background-color: #8a5c41;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 5px 12px;
          font-size: 14px;
          cursor: pointer;
        }
        
        .use-item-button:hover {
          background-color: #a47755;
        }
      `}</style>
    </div>
  );
};