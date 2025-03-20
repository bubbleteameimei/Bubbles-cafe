import React, { useState } from 'react';
import { InventoryPanelProps, InventoryItem } from '../types';

/**
 * InventoryPanel component - Displays and manages player's inventory items
 */
const InventoryPanel: React.FC<InventoryPanelProps> = ({
  inventory,
  onItemSelect,
  onItemCombine,
  onItemUse,
  onItemExamine
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [combineMode, setCombineMode] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  // Toggle inventory visibility
  const toggleInventory = () => {
    setIsOpen(!isOpen);
    
    // Clear selection when closing
    if (isOpen) {
      setSelectedItem(null);
      setCombineMode(false);
    }
  };
  
  // Get item by ID
  const getItemById = (id: string): InventoryItem | undefined => {
    return inventory.find(item => item.id === id);
  };
  
  // Handle item selection
  const handleItemSelect = (itemId: string) => {
    // If we're in combine mode, attempt to combine items
    if (combineMode && selectedItem && selectedItem !== itemId) {
      onItemCombine(selectedItem, itemId);
      setSelectedItem(null);
      setCombineMode(false);
      return;
    }
    
    // Otherwise just select the item
    setSelectedItem(itemId === selectedItem ? null : itemId);
    onItemSelect(itemId);
  };
  
  // Handle item use
  const handleUseItem = () => {
    if (selectedItem) {
      onItemUse(selectedItem);
      // Keep inventory open but clear selection
      setSelectedItem(null);
      setCombineMode(false);
    }
  };
  
  // Handle item examination
  const handleExamineItem = () => {
    if (selectedItem) {
      onItemExamine(selectedItem);
      // Keep selection active after examining
    }
  };
  
  // Enter combine mode
  const handleCombineStart = () => {
    if (selectedItem) {
      setCombineMode(true);
    }
  };
  
  // Cancel current action
  const handleCancel = () => {
    setSelectedItem(null);
    setCombineMode(false);
  };
  
  // Filter items by category
  const filterItems = (items: InventoryItem[]): InventoryItem[] => {
    if (!categoryFilter) return items;
    return items.filter(item => item.category === categoryFilter);
  };
  
  // Group items by category
  const getCategoryGroups = (): string[] => {
    const categories = new Set<string>();
    inventory.forEach(item => {
      if (item.category) categories.add(item.category);
    });
    return Array.from(categories);
  };
  
  // Get selected item details
  const getSelectedItemDetails = () => {
    if (!selectedItem) return null;
    return getItemById(selectedItem);
  };
  
  return (
    <>
      {/* Inventory toggle button */}
      <button 
        className="inventory-toggle" 
        onClick={toggleInventory}
        aria-label="Toggle inventory"
      >
        <span className="inventory-icon">🎒</span>
        <span className="inventory-count">{inventory.length}</span>
      </button>
      
      {/* Inventory panel */}
      {isOpen && (
        <div className="inventory-panel">
          <div className="inventory-header">
            <h3>Inventory {combineMode && "- Combine Mode"}</h3>
            
            {/* Category filters */}
            <div className="category-filters">
              <button 
                className={`category-filter ${!categoryFilter ? 'active' : ''}`}
                onClick={() => setCategoryFilter(null)}
              >
                All
              </button>
              
              {getCategoryGroups().map(category => (
                <button
                  key={category}
                  className={`category-filter ${categoryFilter === category ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
            
            <button className="close-button" onClick={toggleInventory}>×</button>
          </div>
          
          <div className="inventory-content">
            <div className="items-grid">
              {filterItems(inventory).map(item => (
                <div 
                  key={item.id}
                  className={`inventory-item ${selectedItem === item.id ? 'selected' : ''}`}
                  onClick={() => handleItemSelect(item.id)}
                >
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-name">{item.name}</div>
                </div>
              ))}
              
              {filterItems(inventory).length === 0 && (
                <div className="empty-category">
                  {categoryFilter 
                    ? `No ${categoryFilter} items found`
                    : "Your inventory is empty"
                  }
                </div>
              )}
            </div>
            
            {/* Item details */}
            {selectedItem && getSelectedItemDetails() && (
              <div className="item-details">
                <h4>{getSelectedItemDetails()?.name}</h4>
                <p>{getSelectedItemDetails()?.description}</p>
                {getSelectedItemDetails()?.lore && (
                  <p className="item-lore">{getSelectedItemDetails()?.lore}</p>
                )}
                
                <div className="item-actions">
                  <button 
                    className="action-button"
                    onClick={handleUseItem}
                    disabled={combineMode}
                  >
                    Use
                  </button>
                  
                  {getSelectedItemDetails()?.examinable && (
                    <button 
                      className="action-button"
                      onClick={handleExamineItem}
                      disabled={combineMode}
                    >
                      Examine
                    </button>
                  )}
                  
                  {getSelectedItemDetails()?.combinable && !combineMode && (
                    <button 
                      className="action-button"
                      onClick={handleCombineStart}
                    >
                      Combine
                    </button>
                  )}
                  
                  {(selectedItem || combineMode) && (
                    <button 
                      className="action-button cancel-button"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  )}
                </div>
                
                {combineMode && (
                  <div className="combine-instructions">
                    Select another item to combine with {getSelectedItemDetails()?.name}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      <style>
        {`
          .inventory-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.7);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            cursor: pointer;
            font-size: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            transition: all 0.2s;
          }
          
          .inventory-toggle:hover {
            transform: scale(1.1);
            background-color: rgba(30, 30, 50, 0.8);
          }
          
          .inventory-icon {
            font-size: 24px;
          }
          
          .inventory-count {
            position: absolute;
            top: -5px;
            right: -5px;
            background-color: #ff3333;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .inventory-panel {
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 400px;
            height: 500px;
            background-color: rgba(20, 20, 30, 0.9);
            border: 1px solid rgba(100, 100, 150, 0.4);
            border-radius: 8px;
            color: white;
            z-index: 100;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
          }
          
          .inventory-header {
            padding: 10px 15px;
            border-bottom: 1px solid rgba(100, 100, 150, 0.4);
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .inventory-header h3 {
            margin: 0;
            font-size: 18px;
          }
          
          .close-button {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            line-height: 1;
          }
          
          .close-button:hover {
            color: white;
          }
          
          .inventory-content {
            display: flex;
            flex-direction: column;
            flex: 1;
            overflow: hidden;
          }
          
          .category-filters {
            display: flex;
            gap: 5px;
            margin: 10px 0;
            overflow-x: auto;
            padding: 0 15px;
            scrollbar-width: thin;
          }
          
          .category-filter {
            background-color: rgba(60, 60, 80, 0.6);
            border: none;
            border-radius: 4px;
            color: rgba(255, 255, 255, 0.8);
            padding: 5px 10px;
            font-size: 12px;
            cursor: pointer;
            white-space: nowrap;
          }
          
          .category-filter.active {
            background-color: rgba(80, 100, 200, 0.8);
            color: white;
          }
          
          .items-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            padding: 15px;
            overflow-y: auto;
            max-height: 200px;
          }
          
          .inventory-item {
            background-color: rgba(40, 40, 60, 0.8);
            border: 1px solid rgba(100, 100, 150, 0.3);
            border-radius: 4px;
            padding: 8px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .inventory-item:hover {
            background-color: rgba(60, 60, 100, 0.8);
            transform: translateY(-2px);
          }
          
          .inventory-item.selected {
            border-color: rgba(200, 200, 255, 0.8);
            box-shadow: 0 0 10px rgba(100, 150, 255, 0.4);
            background-color: rgba(60, 70, 120, 0.8);
          }
          
          .item-image {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 5px;
          }
          
          .item-image img {
            max-width: 100%;
            max-height: 100%;
          }
          
          .item-name {
            font-size: 10px;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
          }
          
          .empty-category {
            grid-column: 1 / -1;
            text-align: center;
            color: rgba(255, 255, 255, 0.6);
            font-style: italic;
            padding: 20px;
          }
          
          .item-details {
            padding: 15px;
            border-top: 1px solid rgba(100, 100, 150, 0.4);
          }
          
          .item-details h4 {
            margin: 0 0 8px 0;
          }
          
          .item-details p {
            margin: 0 0 10px 0;
            font-size: 14px;
            line-height: 1.4;
            color: rgba(255, 255, 255, 0.9);
          }
          
          .item-lore {
            font-style: italic;
            color: rgba(200, 200, 255, 0.9) !important;
            border-left: 3px solid rgba(100, 100, 200, 0.5);
            padding-left: 10px;
            margin-top: 10px;
            font-size: 12px !important;
          }
          
          .item-actions {
            display: flex;
            gap: 8px;
            margin-top: 15px;
          }
          
          .action-button {
            background-color: rgba(60, 70, 120, 0.8);
            border: 1px solid rgba(100, 120, 200, 0.4);
            border-radius: 4px;
            color: white;
            padding: 6px 12px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .action-button:hover:not(:disabled) {
            background-color: rgba(80, 100, 180, 0.9);
          }
          
          .action-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .cancel-button {
            background-color: rgba(120, 50, 60, 0.8);
            border-color: rgba(200, 100, 100, 0.4);
          }
          
          .cancel-button:hover {
            background-color: rgba(180, 70, 80, 0.9);
          }
          
          .combine-instructions {
            margin-top: 10px;
            font-size: 12px;
            color: rgba(200, 255, 200, 0.9);
            text-align: center;
            padding: 5px;
            background-color: rgba(50, 100, 50, 0.3);
            border-radius: 4px;
          }
          
          @media (max-width: 500px) {
            .inventory-panel {
              width: calc(100% - 40px);
              height: 60vh;
            }
            
            .items-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
        `}
      </style>
    </>
  );
};

export default InventoryPanel;