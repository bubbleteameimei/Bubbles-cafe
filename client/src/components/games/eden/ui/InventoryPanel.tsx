import React, { useState, useEffect } from 'react';
import { InventoryPanelProps, InventoryItem } from '../types';

/**
 * InventoryPanel - Displays and manages player inventory items
 */
const InventoryPanel: React.FC<InventoryPanelProps> = ({
  inventory = [],
  onItemUse,
  onItemInspect,
  onItemCombine,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [combineMode, setCombineMode] = useState<boolean>(false);
  const [combineSource, setCombineSource] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<string | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number, y: number } | null>(null);
  const [contextMenuItemId, setContextMenuItemId] = useState<string | null>(null);
  const [sortMethod, setSortMethod] = useState<'name' | 'type' | 'recent'>('type');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Handle escape key press to close context menu or exit combine mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (contextMenuPosition) {
          setContextMenuPosition(null);
          setContextMenuItemId(null);
        } else if (combineMode) {
          setCombineMode(false);
          setCombineSource(null);
        } else if (detailItem) {
          setDetailItem(null);
        } else {
          handleClose();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenuPosition, combineMode, detailItem]);
  
  // Handle clicks outside of context menu to close it
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenuPosition) {
        setContextMenuPosition(null);
        setContextMenuItemId(null);
      }
    };
    
    window.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenuPosition]);
  
  // Close the inventory panel
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };
  
  // Handle item click
  const handleItemClick = (itemId: string) => {
    if (combineMode) {
      if (combineSource !== itemId) {
        handleItemCombine(combineSource!, itemId);
      }
    } else {
      setSelectedItem(selectedItem === itemId ? null : itemId);
    }
  };
  
  // Open context menu for an item
  const handleItemRightClick = (itemId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuItemId(itemId);
  };
  
  // Handle item use action
  const handleItemUse = (itemId: string) => {
    setContextMenuPosition(null);
    setContextMenuItemId(null);
    if (onItemUse) {
      onItemUse(itemId);
    }
  };
  
  // Handle item inspect action
  const handleItemInspect = (itemId: string) => {
    setContextMenuPosition(null);
    setContextMenuItemId(null);
    setDetailItem(itemId);
    if (onItemInspect) {
      onItemInspect(itemId);
    }
  };
  
  // Enter combine mode with a selected item
  const handleStartCombine = (itemId: string) => {
    setContextMenuPosition(null);
    setContextMenuItemId(null);
    setCombineMode(true);
    setCombineSource(itemId);
  };
  
  // Combine two items
  const handleItemCombine = (sourceId: string, targetId: string) => {
    setCombineMode(false);
    setCombineSource(null);
    if (onItemCombine) {
      onItemCombine(sourceId, targetId);
    }
  };
  
  // Cancel combine mode
  const handleCancelCombine = () => {
    setCombineMode(false);
    setCombineSource(null);
  };
  
  // Close item detail view
  const handleCloseDetail = () => {
    setDetailItem(null);
  };
  
  // Filter items based on search query
  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.type && item.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Sort items based on selected sort method
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortMethod) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'type':
        return (a.type || '').localeCompare(b.type || '');
      case 'recent':
        // Assuming items have a discoveredAt property
        return (b.discoveredAt || 0) - (a.discoveredAt || 0);
      default:
        return 0;
    }
  });
  
  // Find item by ID
  const getItemById = (id: string): InventoryItem | undefined => {
    return inventory.find(item => item.id === id);
  };
  
  // Render the current detail item
  const renderDetailView = () => {
    const item = detailItem ? getItemById(detailItem) : null;
    
    if (!item) return null;
    
    return (
      <div className="inventory-detail-overlay">
        <div className="inventory-detail">
          <div className="detail-header">
            <h3>{item.name}</h3>
            <button className="close-button" onClick={handleCloseDetail}>×</button>
          </div>
          
          <div className="detail-content">
            <div className="detail-image">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} />
              ) : (
                <div className="placeholder-image">{item.name.charAt(0)}</div>
              )}
            </div>
            
            <div className="detail-info">
              <p className="detail-description">{item.description}</p>
              
              {item.properties && Object.keys(item.properties).length > 0 && (
                <div className="detail-properties">
                  <h4>Properties:</h4>
                  <ul>
                    {Object.entries(item.properties).map(([key, value]) => (
                      <li key={key}>
                        <span className="property-name">{key}:</span> {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="detail-actions">
                <button 
                  className="action-button"
                  onClick={() => handleItemUse(item.id)}
                >
                  Use
                </button>
                
                <button 
                  className="action-button"
                  onClick={() => handleStartCombine(item.id)}
                >
                  Combine
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the inventory panel content
  return (
    <div className={`inventory-overlay ${isOpen ? 'inventory-visible' : 'inventory-hidden'}`}>
      <div className="inventory-panel">
        <div className="inventory-header">
          <h2>Inventory {inventory.length > 0 ? `(${inventory.length})` : ''}</h2>
          
          <div className="inventory-controls">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="clear-search" 
                  onClick={() => setSearchQuery('')}
                >
                  ×
                </button>
              )}
            </div>
            
            <div className="sort-controls">
              <label>Sort:</label>
              <select 
                value={sortMethod} 
                onChange={(e) => setSortMethod(e.target.value as 'name' | 'type' | 'recent')}
                className="sort-select"
              >
                <option value="type">Type</option>
                <option value="name">Name</option>
                <option value="recent">Recent</option>
              </select>
            </div>
            
            <button className="close-button" onClick={handleClose}>×</button>
          </div>
        </div>
        
        {combineMode && (
          <div className="combine-mode-notice">
            <p>Select an item to combine with {getItemById(combineSource!)?.name}</p>
            <button className="cancel-button" onClick={handleCancelCombine}>Cancel</button>
          </div>
        )}
        
        <div className="inventory-content">
          {sortedItems.length === 0 ? (
            searchQuery ? (
              <div className="empty-inventory">No items match your search.</div>
            ) : (
              <div className="empty-inventory">Your inventory is empty.</div>
            )
          ) : (
            <div className="inventory-grid">
              {sortedItems.map((item) => (
                <div 
                  key={item.id}
                  className={`inventory-item ${selectedItem === item.id ? 'selected' : ''} ${combineMode && combineSource === item.id ? 'combine-source' : ''}`}
                  onClick={() => handleItemClick(item.id)}
                  onContextMenu={(e) => handleItemRightClick(item.id, e)}
                >
                  <div className="item-icon">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <div className="icon-placeholder">{item.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-type">{item.type || 'Misc'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Item actions for selected item */}
        {selectedItem && !combineMode && (
          <div className="item-actions">
            <button 
              className="action-button"
              onClick={() => handleItemUse(selectedItem)}
            >
              Use
            </button>
            
            <button 
              className="action-button"
              onClick={() => handleItemInspect(selectedItem)}
            >
              Inspect
            </button>
            
            <button 
              className="action-button"
              onClick={() => handleStartCombine(selectedItem)}
            >
              Combine
            </button>
          </div>
        )}
      </div>
      
      {/* Context menu */}
      {contextMenuPosition && contextMenuItemId && (
        <div 
          className="context-menu"
          style={{
            left: `${contextMenuPosition.x}px`,
            top: `${contextMenuPosition.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="context-menu-item"
            onClick={() => handleItemUse(contextMenuItemId)}
          >
            Use
          </div>
          <div 
            className="context-menu-item"
            onClick={() => handleItemInspect(contextMenuItemId)}
          >
            Inspect
          </div>
          <div 
            className="context-menu-item"
            onClick={() => handleStartCombine(contextMenuItemId)}
          >
            Combine with...
          </div>
        </div>
      )}
      
      {/* Detail view */}
      {detailItem && renderDetailView()}
      
      <style jsx>{`
        .inventory-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
          transition: opacity 0.3s ease;
        }
        
        .inventory-hidden {
          opacity: 0;
        }
        
        .inventory-visible {
          opacity: 1;
        }
        
        .inventory-panel {
          background-color: rgba(20, 20, 30, 0.95);
          border: 2px solid rgba(100, 100, 150, 0.6);
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          height: 80%;
          max-height: 600px;
          display: flex;
          flex-direction: column;
          color: #e0e0e0;
          font-family: 'Times New Roman', serif;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
        }
        
        .inventory-header {
          background-color: rgba(40, 40, 60, 0.8);
          padding: 15px 20px;
          border-bottom: 1px solid rgba(100, 100, 150, 0.4);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .inventory-header h2 {
          margin: 0;
          font-size: 20px;
          color: #d0d0f0;
        }
        
        .inventory-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        
        .search-container {
          position: relative;
          flex: 1;
        }
        
        .search-input {
          width: 100%;
          padding: 8px 30px 8px 10px;
          border: 1px solid rgba(100, 100, 150, 0.5);
          border-radius: 4px;
          background-color: rgba(30, 30, 50, 0.7);
          color: #e0e0e0;
        }
        
        .clear-search {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #a0a0c0;
          font-size: 16px;
          cursor: pointer;
          padding: 0 5px;
        }
        
        .sort-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        
        .sort-select {
          padding: 6px 8px;
          border: 1px solid rgba(100, 100, 150, 0.5);
          border-radius: 4px;
          background-color: rgba(30, 30, 50, 0.7);
          color: #e0e0e0;
        }
        
        .close-button {
          background: none;
          border: none;
          color: #a0a0c0;
          font-size: 24px;
          cursor: pointer;
          line-height: 1;
          padding: 0 5px;
        }
        
        .close-button:hover {
          color: #ffffff;
        }
        
        .combine-mode-notice {
          padding: 10px 20px;
          background-color: rgba(50, 50, 80, 0.7);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .cancel-button {
          padding: 5px 10px;
          border: 1px solid rgba(100, 100, 150, 0.5);
          border-radius: 4px;
          background-color: rgba(80, 30, 30, 0.7);
          color: #e0e0e0;
          cursor: pointer;
        }
        
        .inventory-content {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
        }
        
        .empty-inventory {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          color: #909090;
          font-style: italic;
        }
        
        .inventory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 15px;
        }
        
        .inventory-item {
          border: 1px solid rgba(100, 100, 150, 0.4);
          border-radius: 6px;
          padding: 10px;
          background-color: rgba(40, 40, 60, 0.7);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        
        .inventory-item:hover {
          background-color: rgba(60, 60, 90, 0.8);
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .inventory-item.selected {
          border-color: #d0d0f0;
          background-color: rgba(80, 80, 120, 0.7);
        }
        
        .inventory-item.combine-source {
          border-color: #f0d0a0;
          background-color: rgba(120, 100, 80, 0.7);
        }
        
        .item-icon {
          width: 60px;
          height: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 4px;
          overflow: hidden;
          background-color: rgba(30, 30, 40, 0.7);
        }
        
        .item-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .icon-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(60, 60, 90, 0.5);
          font-size: 24px;
          font-weight: bold;
          color: #b0b0d0;
        }
        
        .item-details {
          text-align: center;
          width: 100%;
        }
        
        .item-name {
          font-size: 14px;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .item-type {
          font-size: 12px;
          color: #a0a0c0;
        }
        
        .item-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
          padding: 15px;
          border-top: 1px solid rgba(100, 100, 150, 0.4);
        }
        
        .action-button {
          padding: 8px 16px;
          border: 1px solid rgba(100, 100, 150, 0.5);
          border-radius: 4px;
          background-color: rgba(50, 50, 80, 0.7);
          color: #e0e0e0;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .action-button:hover {
          background-color: rgba(70, 70, 110, 0.8);
        }
        
        .context-menu {
          position: fixed;
          background-color: rgba(30, 30, 40, 0.95);
          border: 1px solid rgba(100, 100, 150, 0.6);
          border-radius: 4px;
          padding: 5px;
          z-index: 110;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }
        
        .context-menu-item {
          padding: 8px 12px;
          cursor: pointer;
          white-space: nowrap;
        }
        
        .context-menu-item:hover {
          background-color: rgba(60, 60, 90, 0.8);
        }
        
        .inventory-detail-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 110;
        }
        
        .inventory-detail {
          background-color: rgba(30, 30, 40, 0.95);
          border: 2px solid rgba(100, 100, 150, 0.6);
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 80%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .detail-header {
          background-color: rgba(40, 40, 60, 0.8);
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(100, 100, 150, 0.4);
        }
        
        .detail-header h3 {
          margin: 0;
          font-size: 18px;
          color: #d0d0f0;
        }
        
        .detail-content {
          display: flex;
          padding: 20px;
          gap: 20px;
          overflow-y: auto;
        }
        
        .detail-image {
          width: 120px;
          height: 120px;
          flex-shrink: 0;
          border-radius: 6px;
          overflow: hidden;
          background-color: rgba(40, 40, 60, 0.7);
        }
        
        .detail-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .placeholder-image {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(60, 60, 90, 0.5);
          font-size: 40px;
          font-weight: bold;
          color: #b0b0d0;
        }
        
        .detail-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .detail-description {
          font-size: 15px;
          line-height: 1.5;
          margin: 0;
          color: #d0d0d0;
        }
        
        .detail-properties {
          border-top: 1px solid rgba(100, 100, 150, 0.3);
          padding-top: 10px;
        }
        
        .detail-properties h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #c0c0e0;
        }
        
        .detail-properties ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        .detail-properties li {
          margin-bottom: 5px;
        }
        
        .property-name {
          color: #a0a0c0;
        }
        
        .detail-actions {
          display: flex;
          gap: 10px;
          margin-top: auto;
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .inventory-panel {
            width: 95%;
            height: 90%;
          }
          
          .inventory-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 10px;
          }
          
          .inventory-detail {
            width: 95%;
          }
          
          .detail-content {
            flex-direction: column;
            align-items: center;
          }
          
          .detail-image {
            width: 100px;
            height: 100px;
          }
        }
      `}</style>
    </div>
  );
};

export default InventoryPanel;