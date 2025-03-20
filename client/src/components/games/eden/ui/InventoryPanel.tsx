import React, { useState, useEffect } from 'react';
import { InventoryPanelProps, InventoryItem } from '../types';

/**
 * InventoryPanel - Displays and manages player's inventory with item categories
 */
const InventoryPanel: React.FC<InventoryPanelProps> = ({
  items,
  isOpen,
  onClose,
  onItemSelect,
  onItemCombine,
  onItemExamine,
  selectedItemId
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [examineMode, setExamineMode] = useState<boolean>(false);
  const [combineMode, setCombineMode] = useState<boolean>(false);
  
  // Group items by category
  const itemCategories = {
    all: items,
    quest: items.filter(item => item.category === 'quest'),
    key: items.filter(item => item.category === 'key'),
    tool: items.filter(item => item.category === 'tool' || item.category === 'weapon'),
    document: items.filter(item => item.category === 'document'),
    consumable: items.filter(item => item.category === 'consumable'),
    artifact: items.filter(item => item.category === 'artifact' || item.category === 'container')
  };
  
  // Current category items
  const currentItems = itemCategories[activeTab as keyof typeof itemCategories] || itemCategories.all;
  
  // Update selected item when selectedItemId prop changes
  useEffect(() => {
    if (selectedItemId) {
      const item = items.find(i => i.id === selectedItemId) || null;
      setSelectedItem(item);
    } else {
      setSelectedItem(null);
    }
  }, [selectedItemId, items]);
  
  // Handle tab change
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };
  
  // Handle item click
  const handleItemClick = (item: InventoryItem) => {
    if (combineMode && selectedItem && selectedItem.id !== item.id) {
      // If in combine mode and different item is clicked
      if (onItemCombine) {
        onItemCombine(selectedItem.id, item.id);
      }
      setCombineMode(false);
      setSelectedItem(null);
    } else {
      // Regular item selection
      setSelectedItem(item);
      
      if (onItemSelect) {
        onItemSelect(item.id);
      }
    }
  };
  
  // Handle use/select button click
  const handleUseClick = () => {
    if (selectedItem && onItemSelect) {
      onItemSelect(selectedItem.id);
      setExamineMode(false);
      onClose();
    }
  };
  
  // Handle examine button click
  const handleExamineClick = () => {
    if (selectedItem && onItemExamine) {
      onItemExamine(selectedItem.id);
      setExamineMode(true);
    }
  };
  
  // Handle combine button click
  const handleCombineClick = () => {
    setCombineMode(true);
  };
  
  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quest':
        return '📜';
      case 'key':
        return '🔑';
      case 'tool':
      case 'weapon':
        return '🔨';
      case 'document':
        return '📄';
      case 'consumable':
        return '🧪';
      case 'artifact':
      case 'container':
        return '💎';
      default:
        return '📦';
    }
  };
  
  // Get category label
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'quest': return 'Quest Items';
      case 'key': return 'Keys';
      case 'tool': return 'Tools & Weapons';
      case 'document': return 'Documents';
      case 'consumable': return 'Consumables';
      case 'artifact': return 'Artifacts';
      case 'all': return 'All Items';
      default: return category;
    }
  };
  
  // Check if item is combinable
  const isItemCombinable = (item: InventoryItem) => {
    return item.combinable && item.combinableWith && item.combinableWith.length > 0;
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="inventory-overlay">
      <div className="inventory-container">
        <div className="inventory-header">
          <h2>Inventory</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close inventory"
          >
            ✕
          </button>
        </div>
        
        <div className="inventory-tabs">
          {Object.keys(itemCategories).map(category => (
            <button
              key={category}
              className={`inventory-tab ${activeTab === category ? 'active' : ''}`}
              onClick={() => handleTabChange(category)}
              disabled={itemCategories[category as keyof typeof itemCategories].length === 0}
            >
              <span className="tab-icon">{getCategoryIcon(category)}</span>
              <span className="tab-label">{getCategoryLabel(category)}</span>
              <span className="tab-count">{itemCategories[category as keyof typeof itemCategories].length}</span>
            </button>
          ))}
        </div>
        
        <div className="inventory-content">
          <div className="items-grid">
            {currentItems.length === 0 ? (
              <div className="empty-category">No items in this category</div>
            ) : (
              currentItems.map(item => (
                <div
                  key={item.id}
                  className={`inventory-item ${selectedItem?.id === item.id ? 'selected' : ''} ${combineMode && selectedItem?.id !== item.id ? 'combinable' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="item-icon">
                    {item.iconUrl ? (
                      <img src={item.iconUrl} alt={item.name} />
                    ) : (
                      getCategoryIcon(item.category || 'default')
                    )}
                  </div>
                  <div className="item-name">{item.name}</div>
                </div>
              ))
            )}
          </div>
          
          {selectedItem && (
            <div className="item-details">
              <div className="item-image">
                {selectedItem.detailImageUrl ? (
                  <img src={selectedItem.detailImageUrl} alt={selectedItem.name} />
                ) : selectedItem.iconUrl ? (
                  <img src={selectedItem.iconUrl} alt={selectedItem.name} className="item-icon-large" />
                ) : (
                  <div className="item-icon-placeholder">
                    {getCategoryIcon(selectedItem.category || 'default')}
                  </div>
                )}
              </div>
              
              <h3 className="item-title">{selectedItem.name}</h3>
              
              <div className="item-description">
                {selectedItem.description}
              </div>
              
              {selectedItem.notes && (
                <div className="item-notes">
                  <h4>Notes:</h4>
                  <p>{selectedItem.notes}</p>
                </div>
              )}
              
              <div className="item-actions">
                <button 
                  className="item-action use"
                  onClick={handleUseClick}
                >
                  Use
                </button>
                
                {onItemExamine && (
                  <button 
                    className="item-action examine"
                    onClick={handleExamineClick}
                  >
                    Examine
                  </button>
                )}
                
                {isItemCombinable(selectedItem) && (
                  <button 
                    className={`item-action combine ${combineMode ? 'active' : ''}`}
                    onClick={handleCombineClick}
                  >
                    Combine
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {combineMode && selectedItem && (
          <div className="combine-instructions">
            Select another item to combine with {selectedItem.name}
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
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 300;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }
        
        .inventory-container {
          width: 100%;
          max-width: 900px;
          max-height: 80vh;
          background-color: rgba(30, 30, 40, 0.95);
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(100, 100, 150, 0.4);
          display: flex;
          flex-direction: column;
          font-family: 'Times New Roman', serif;
          color: #e0e0e0;
          overflow: hidden;
          position: relative;
          animation: slideUp 0.3s ease;
        }
        
        .inventory-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid rgba(100, 100, 150, 0.4);
        }
        
        .inventory-header h2 {
          margin: 0;
          font-size: 22px;
          color: #d0d0e0;
        }
        
        .close-button {
          background: none;
          border: none;
          color: #a0a0b0;
          font-size: 18px;
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .close-button:hover {
          background-color: rgba(80, 80, 100, 0.4);
          color: #e0e0e0;
        }
        
        .inventory-tabs {
          display: flex;
          padding: 0 10px;
          border-bottom: 1px solid rgba(100, 100, 150, 0.4);
          overflow-x: auto;
          scrollbar-width: thin;
        }
        
        .inventory-tab {
          background: none;
          border: none;
          color: #a0a0b0;
          padding: 10px 15px;
          font-size: 14px;
          cursor: pointer;
          position: relative;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .inventory-tab.active {
          color: #e0e0e0;
          border-bottom-color: #7e57c2;
        }
        
        .inventory-tab:hover:not(.active):not(:disabled) {
          color: #d0d0e0;
          background-color: rgba(80, 80, 100, 0.2);
        }
        
        .inventory-tab:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        
        .tab-icon {
          font-size: 16px;
        }
        
        .tab-count {
          background-color: rgba(80, 80, 100, 0.4);
          font-size: 11px;
          padding: 1px 6px;
          border-radius: 10px;
          margin-left: 4px;
        }
        
        .inventory-content {
          display: flex;
          flex: 1;
          overflow: hidden;
          max-height: calc(80vh - 110px);
        }
        
        .items-grid {
          flex: 1;
          padding: 15px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
          gap: 10px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 100, 150, 0.4) rgba(30, 30, 40, 0.5);
          max-height: 100%;
        }
        
        .empty-category {
          grid-column: 1 / -1;
          padding: 20px;
          text-align: center;
          color: #a0a0b0;
          font-style: italic;
        }
        
        .inventory-item {
          border: 1px solid rgba(100, 100, 150, 0.4);
          border-radius: 6px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.2s;
          background-color: rgba(50, 50, 70, 0.5);
        }
        
        .inventory-item.selected {
          background-color: rgba(70, 70, 100, 0.6);
          border-color: #7e57c2;
          box-shadow: 0 0 5px rgba(126, 87, 194, 0.4);
        }
        
        .inventory-item.combinable {
          background-color: rgba(60, 80, 60, 0.5);
          border-color: rgba(100, 180, 100, 0.6);
        }
        
        .inventory-item:hover:not(.selected) {
          background-color: rgba(60, 60, 80, 0.7);
          transform: translateY(-2px);
        }
        
        .item-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          background-color: rgba(40, 40, 50, 0.7);
          border-radius: 6px;
          padding: 5px;
        }
        
        .item-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .item-name {
          font-size: 12px;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          max-width: 100%;
          word-break: break-word;
        }
        
        .item-details {
          width: 300px;
          padding: 15px;
          border-left: 1px solid rgba(100, 100, 150, 0.4);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 100, 150, 0.4) rgba(30, 30, 40, 0.5);
          background-color: rgba(40, 40, 60, 0.6);
        }
        
        .item-image {
          width: 100%;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(20, 20, 30, 0.7);
          border-radius: 8px;
          margin-bottom: 15px;
          overflow: hidden;
        }
        
        .item-image img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .item-icon-large {
          width: 80px;
          height: 80px;
        }
        
        .item-icon-placeholder {
          font-size: 60px;
          color: #a0a0b0;
          opacity: 0.7;
        }
        
        .item-title {
          margin: 0 0 10px 0;
          font-size: 18px;
          color: #d0d0e0;
          text-align: center;
        }
        
        .item-description {
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 15px;
          color: #b0b0c0;
        }
        
        .item-notes {
          background-color: rgba(60, 60, 80, 0.5);
          padding: 10px;
          border-radius: 6px;
          font-size: 13px;
          margin-bottom: 15px;
          border-left: 3px solid #7e57c2;
        }
        
        .item-notes h4 {
          margin: 0 0 5px 0;
          font-size: 14px;
          color: #c0c0d0;
        }
        
        .item-notes p {
          margin: 0;
          color: #b0b0c0;
          font-style: italic;
        }
        
        .item-actions {
          display: flex;
          gap: 10px;
          margin-top: auto;
          padding-top: 15px;
        }
        
        .item-action {
          flex: 1;
          padding: 8px 10px;
          border: 1px solid rgba(100, 100, 150, 0.4);
          border-radius: 6px;
          background-color: rgba(50, 50, 70, 0.6);
          color: #d0d0e0;
          font-family: inherit;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .item-action:hover {
          background-color: rgba(70, 70, 100, 0.7);
        }
        
        .item-action.use:hover {
          background-color: rgba(60, 80, 60, 0.7);
          border-color: rgba(100, 180, 100, 0.6);
        }
        
        .item-action.examine:hover {
          background-color: rgba(60, 60, 90, 0.7);
          border-color: rgba(100, 150, 180, 0.6);
        }
        
        .item-action.combine {
          background-color: rgba(60, 60, 80, 0.6);
        }
        
        .item-action.combine:hover, .item-action.combine.active {
          background-color: rgba(80, 60, 90, 0.7);
          border-color: rgba(180, 100, 180, 0.6);
        }
        
        .combine-instructions {
          background-color: rgba(60, 50, 70, 0.8);
          color: #d0d0e0;
          text-align: center;
          padding: 10px;
          font-size: 14px;
          border-top: 1px solid rgba(100, 100, 150, 0.4);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @media (max-width: 768px) {
          .inventory-container {
            max-width: 100%;
            max-height: 90vh;
          }
          
          .inventory-content {
            flex-direction: column;
            max-height: calc(90vh - 130px);
          }
          
          .items-grid {
            max-height: 40vh;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          }
          
          .item-details {
            width: 100%;
            border-left: none;
            border-top: 1px solid rgba(100, 100, 150, 0.4);
            max-height: 40vh;
          }
          
          .item-image {
            height: 140px;
          }
          
          .inventory-tab {
            padding: 8px 12px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default InventoryPanel;