import React, { useState, useRef } from 'react';
import { InventoryPanelProps, InventoryItem } from '../types';

/**
 * InventoryPanel Component - Displays and manages player inventory items
 */
const InventoryPanel: React.FC<InventoryPanelProps> = ({
  inventory,
  onItemSelect,
  onItemUse,
  onItemExamine,
  onItemCombine
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [combineMode, setCombineMode] = useState<boolean>(false);
  const [firstItemId, setFirstItemId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Toggle inventory panel expansion
  const togglePanel = () => {
    setIsExpanded(!isExpanded);
    // Reset selection when closing
    if (isExpanded) {
      setSelectedItem(null);
      setCombineMode(false);
      setFirstItemId(null);
    }
  };
  
  // Handle item selection
  const handleItemSelect = (itemId: string) => {
    if (combineMode) {
      // In combine mode, select the second item
      if (firstItemId && firstItemId !== itemId) {
        onItemCombine(firstItemId, itemId);
        setCombineMode(false);
        setFirstItemId(null);
        setSelectedItem(null);
      }
    } else {
      // Toggle selection
      setSelectedItem(selectedItem === itemId ? null : itemId);
      onItemSelect(itemId);
    }
  };
  
  // Handle item use
  const handleItemUse = (itemId: string) => {
    onItemUse(itemId);
    setSelectedItem(null);
  };
  
  // Handle item examination
  const handleItemExamine = (itemId: string) => {
    onItemExamine(itemId);
    setSelectedItem(null);
  };
  
  // Start combine mode
  const handleCombineStart = (itemId: string) => {
    setCombineMode(true);
    setFirstItemId(itemId);
  };
  
  // Cancel combine mode
  const handleCombineCancel = () => {
    setCombineMode(false);
    setFirstItemId(null);
  };
  
  // Find item by ID
  const getItemById = (itemId: string): InventoryItem | undefined => {
    return inventory.find(item => item.id === itemId);
  };
  
  return (
    <>
      {/* Inventory toggle button */}
      <button 
        className="inventory-toggle"
        onClick={togglePanel}
        aria-label={isExpanded ? 'Close inventory' : 'Open inventory'}
      >
        {isExpanded ? '✕' : '🎒'}
      </button>
      
      {/* Inventory panel */}
      <div 
        ref={panelRef}
        className={`inventory-panel ${isExpanded ? 'expanded' : ''}`}
      >
        <div className="inventory-header">
          <h3>Inventory {inventory.length > 0 && `(${inventory.length})`}</h3>
          {combineMode && (
            <button 
              className="combine-cancel-btn" 
              onClick={handleCombineCancel}
            >
              Cancel Combine
            </button>
          )}
        </div>
        
        {/* Inventory items grid */}
        <div className="inventory-grid">
          {inventory.length === 0 ? (
            <div className="inventory-empty">Inventory is empty</div>
          ) : (
            inventory.map(item => (
              <div 
                key={item.id}
                className={`inventory-item ${selectedItem === item.id ? 'selected' : ''} ${
                  firstItemId === item.id ? 'combine-first' : ''
                }`}
                onClick={() => handleItemSelect(item.id)}
              >
                {item.image ? (
                  <img src={item.image} alt={item.name} className="item-image" />
                ) : (
                  <div className="item-icon">{item.icon || '📦'}</div>
                )}
                <div className="item-name">{item.name}</div>
              </div>
            ))
          )}
        </div>
        
        {/* Item actions (when an item is selected) */}
        {selectedItem && !combineMode && (
          <div className="item-actions">
            <div className="item-details">
              <h4>{getItemById(selectedItem)?.name}</h4>
              <p>{getItemById(selectedItem)?.description}</p>
            </div>
            <div className="action-buttons">
              <button 
                className="action-btn use-btn"
                onClick={() => handleItemUse(selectedItem)}
              >
                Use
              </button>
              <button 
                className="action-btn examine-btn"
                onClick={() => handleItemExamine(selectedItem)}
              >
                Examine
              </button>
              <button 
                className="action-btn combine-btn"
                onClick={() => handleCombineStart(selectedItem)}
              >
                Combine
              </button>
            </div>
          </div>
        )}
        
        {/* Combine mode instructions */}
        {combineMode && (
          <div className="combine-instructions">
            <p>Select another item to combine with {getItemById(firstItemId || '')?.name}</p>
          </div>
        )}
      </div>
      
      <style>
        {`
          .inventory-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background-color: rgba(40, 40, 60, 0.8);
            color: white;
            border: 2px solid rgba(100, 100, 150, 0.4);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            z-index: 800;
            transition: all 0.3s ease;
          }
          
          .inventory-toggle:hover {
            background-color: rgba(60, 60, 80, 0.9);
          }
          
          .inventory-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 320px;
            height: 400px;
            background-color: rgba(30, 30, 40, 0.9);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(100, 100, 150, 0.4);
            border-radius: 8px;
            z-index: 790;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transform: translateY(calc(100% + 20px));
            transition: transform 0.3s ease;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
          }
          
          .inventory-panel.expanded {
            transform: translateY(0);
          }
          
          .inventory-header {
            padding: 10px 15px;
            background-color: rgba(40, 40, 60, 0.8);
            border-bottom: 1px solid rgba(100, 100, 150, 0.4);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .inventory-header h3 {
            margin: 0;
            color: white;
            font-size: 18px;
            font-weight: bold;
          }
          
          .combine-cancel-btn {
            background-color: rgba(150, 60, 60, 0.5);
            border: 1px solid rgba(200, 100, 100, 0.5);
            color: white;
            padding: 3px 8px;
            font-size: 12px;
            border-radius: 3px;
            cursor: pointer;
          }
          
          .inventory-grid {
            flex: 1;
            padding: 10px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            overflow-y: auto;
          }
          
          .inventory-empty {
            grid-column: span 4;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100px;
            color: #aaa;
            font-style: italic;
          }
          
          .inventory-item {
            aspect-ratio: 1;
            background-color: rgba(50, 50, 70, 0.5);
            border: 1px solid rgba(100, 100, 150, 0.3);
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 5px;
            transition: all 0.2s;
            position: relative;
          }
          
          .inventory-item:hover {
            background-color: rgba(60, 60, 90, 0.7);
            border-color: rgba(150, 150, 200, 0.5);
          }
          
          .inventory-item.selected {
            background-color: rgba(80, 100, 120, 0.8);
            border-color: rgba(100, 180, 255, 0.6);
            box-shadow: 0 0 8px rgba(100, 150, 255, 0.4);
          }
          
          .inventory-item.combine-first {
            background-color: rgba(100, 80, 120, 0.8);
            border-color: rgba(180, 100, 255, 0.6);
            box-shadow: 0 0 8px rgba(150, 100, 255, 0.4);
          }
          
          .item-image {
            width: 70%;
            height: 70%;
            object-fit: contain;
          }
          
          .item-icon {
            font-size: 24px;
            margin-bottom: 5px;
          }
          
          .item-name {
            font-size: 10px;
            color: white;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
            padding: 0 2px;
          }
          
          .item-actions {
            background-color: rgba(40, 40, 60, 0.8);
            border-top: 1px solid rgba(100, 100, 150, 0.4);
            padding: 10px;
          }
          
          .item-details {
            margin-bottom: 10px;
          }
          
          .item-details h4 {
            margin: 0 0 5px 0;
            color: white;
            font-size: 16px;
          }
          
          .item-details p {
            margin: 0;
            color: #ccc;
            font-size: 12px;
            line-height: 1.4;
          }
          
          .action-buttons {
            display: flex;
            gap: 5px;
          }
          
          .action-btn {
            flex: 1;
            padding: 6px 0;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s;
          }
          
          .use-btn {
            background-color: rgba(50, 100, 150, 0.5);
            border: 1px solid rgba(70, 140, 210, 0.5);
            color: white;
          }
          
          .use-btn:hover {
            background-color: rgba(60, 120, 180, 0.7);
          }
          
          .examine-btn {
            background-color: rgba(50, 150, 100, 0.5);
            border: 1px solid rgba(70, 210, 140, 0.5);
            color: white;
          }
          
          .examine-btn:hover {
            background-color: rgba(60, 180, 120, 0.7);
          }
          
          .combine-btn {
            background-color: rgba(150, 50, 150, 0.5);
            border: 1px solid rgba(210, 70, 210, 0.5);
            color: white;
          }
          
          .combine-btn:hover {
            background-color: rgba(180, 60, 180, 0.7);
          }
          
          .combine-instructions {
            background-color: rgba(40, 40, 60, 0.8);
            border-top: 1px solid rgba(100, 100, 150, 0.4);
            padding: 10px;
            color: #ccc;
            font-size: 12px;
            text-align: center;
          }
          
          @media (max-width: 500px) {
            .inventory-panel {
              width: calc(100% - 40px);
              right: 20px;
              height: 350px;
              bottom: 15px;
            }
            
            .inventory-toggle {
              width: 40px;
              height: 40px;
              right: 15px;
              bottom: 15px;
              font-size: 16px;
            }
          }
        `}
      </style>
    </>
  );
};

export default InventoryPanel;