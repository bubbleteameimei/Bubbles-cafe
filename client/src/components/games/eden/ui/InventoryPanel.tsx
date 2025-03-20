import React, { useState, useRef, useEffect } from 'react';
import { Item } from '../types';

interface InventoryPanelProps {
  items: Item[];
  onItemUse: (itemId: string) => void;
  onItemExamine?: (itemId: string) => void;
  onItemCombine?: (item1Id: string, item2Id: string) => void;
  isOpen: boolean;
  onInventoryClose?: () => void;
}

/**
 * Displays and manages the player's inventory with categories and item interactions
 */
const InventoryPanel: React.FC<InventoryPanelProps> = ({
  items,
  onItemUse,
  onItemExamine,
  onItemCombine,
  isOpen,
  onInventoryClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [combineMode, setCombineMode] = useState<boolean>(false);
  const [firstSelectedItem, setFirstSelectedItem] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [tooltipContent, setTooltipContent] = useState<{title: string, description: string}>({title: '', description: ''});
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Define inventory categories
  const categories = [
    { id: 'all', label: 'All', icon: '≡' },
    { id: 'key', label: 'Keys', icon: '🔑' },
    { id: 'tool', label: 'Tools', icon: '🔧' },
    { id: 'weapon', label: 'Weapons', icon: '🔪' },
    { id: 'consumable', label: 'Consumables', icon: '💊' },
    { id: 'document', label: 'Documents', icon: '📜' },
    { id: 'artifact', label: 'Artifacts', icon: '🔮' },
    { id: 'quest', label: 'Quest', icon: '📌' },
    { id: 'lore', label: 'Lore', icon: '📚' },
  ];
  
  // Filter items based on selected category
  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);
  
  // Handle item click
  const handleItemClick = (itemId: string) => {
    if (combineMode) {
      // If in combine mode, handle item combinations
      if (firstSelectedItem && firstSelectedItem !== itemId) {
        if (onItemCombine) {
          onItemCombine(firstSelectedItem, itemId);
        }
        setCombineMode(false);
        setFirstSelectedItem(null);
        setSelectedItem(null);
      } else {
        setFirstSelectedItem(itemId);
        setSelectedItem(itemId);
      }
    } else {
      // Normal item selection
      setSelectedItem(itemId === selectedItem ? null : itemId);
    }
  };
  
  // Handle item action button clicks
  const handleUse = () => {
    if (selectedItem) {
      onItemUse(selectedItem);
      setSelectedItem(null);
    }
  };
  
  const handleExamine = () => {
    if (selectedItem && onItemExamine) {
      onItemExamine(selectedItem);
    }
  };
  
  const handleCombine = () => {
    setCombineMode(!combineMode);
    setFirstSelectedItem(combineMode ? null : selectedItem);
    
    if (combineMode) {
      // Exiting combine mode
      setSelectedItem(null);
    }
  };
  
  const handleCancel = () => {
    setSelectedItem(null);
    setCombineMode(false);
    setFirstSelectedItem(null);
  };
  
  // Handle tooltip position and content
  const handleItemHover = (
    e: React.MouseEvent<HTMLDivElement>,
    item: Item
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.right + 10,
      y: rect.top
    });
    setTooltipContent({
      title: item.name,
      description: item.description
    });
    setShowTooltip(true);
  };
  
  // Toggle inventory expansion
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Close inventory panel if isOpen changes to false
  useEffect(() => {
    if (!isOpen) {
      setSelectedItem(null);
      setCombineMode(false);
      setFirstSelectedItem(null);
    }
  }, [isOpen]);
  
  // Close tooltip when mouse leaves the item
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };
  
  // Close tooltip when clicking outside of inventory
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // If the inventory is closed, don't render anything
  if (!isOpen) {
    return null;
  }
  
  // Get the selected item's details if there is one
  const selectedItemDetails = selectedItem
    ? items.find(item => item.id === selectedItem)
    : null;
  
  // Helper function to get item icon
  const getItemIcon = (category?: string) => {
    switch (category) {
      case 'key':
        return '🔑';
      case 'tool':
        return '🔧';
      case 'weapon':
        return '🔪';
      case 'consumable':
        return '💊';
      case 'document':
        return '📜';
      case 'artifact':
        return '🔮';
      case 'quest':
        return '📌';
      case 'lore':
        return '📚';
      default:
        return '❓';
    }
  };
  
  return (
    <div
      ref={containerRef}
      className="inventory-panel"
      style={{
        position: 'fixed',
        bottom: isExpanded ? '20px' : 'min(30%, 300px)',
        right: '20px',
        width: isExpanded ? 'min(90%, 800px)' : '300px',
        height: isExpanded ? 'min(80%, 600px)' : '400px',
        backgroundColor: 'rgba(20, 15, 30, 0.92)',
        borderRadius: '10px',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(3px)',
        border: '1px solid rgba(120, 100, 180, 0.5)',
        transition: 'all 0.3s ease-in-out',
        padding: '10px',
        color: '#e0e0e8',
        fontFamily: 'serif',
        zIndex: 500,
        overflow: 'hidden'
      }}
    >
      {/* Inventory Header */}
      <div
        className="inventory-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '5px 10px',
          borderBottom: '1px solid rgba(120, 100, 180, 0.5)',
          marginBottom: '10px',
          height: '40px'
        }}
      >
        <h3 style={{ margin: 0, fontWeight: 'bold', color: '#d0c0ff' }}>Inventory</h3>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Maximize/Minimize Button */}
          <button
            onClick={toggleExpansion}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(200, 180, 255, 0.8)',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '0 5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(120, 100, 180, 0.3)';
              e.currentTarget.style.color = 'rgba(220, 210, 255, 1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'rgba(200, 180, 255, 0.8)';
            }}
          >
            {isExpanded ? '◻' : '❐'}
          </button>
          
          {/* Close Button */}
          {onInventoryClose && (
            <button
              onClick={onInventoryClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(200, 180, 255, 0.8)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '0 5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(120, 100, 180, 0.3)';
                e.currentTarget.style.color = 'rgba(220, 210, 255, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(200, 180, 255, 0.8)';
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      <div
        className="inventory-content"
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden'
        }}
      >
        {/* Inventory Categories */}
        <div
          className="inventory-categories"
          style={{
            width: '70px',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid rgba(120, 100, 180, 0.3)',
            paddingRight: '10px',
            gap: '5px',
            overflowY: 'auto',
            scrollbarWidth: 'thin'
          }}
        >
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                background: selectedCategory === category.id
                  ? 'rgba(80, 50, 100, 0.6)'
                  : 'transparent',
                border: 'none',
                padding: '8px 5px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: selectedCategory === category.id
                  ? '#e0d0ff'
                  : '#c0b0e0',
                fontWeight: selectedCategory === category.id
                  ? 'bold'
                  : 'normal',
                transition: 'all 0.2s ease',
                fontSize: '0.8rem',
                textAlign: 'center',
                height: '60px'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(80, 50, 100, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
        
        {/* Items Grid */}
        <div
          className="items-grid"
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: isExpanded ? 'repeat(auto-fill, minmax(80px, 1fr))' : 'repeat(3, 1fr)',
            gap: '10px',
            padding: '10px',
            overflowY: 'auto',
            alignContent: 'start'
          }}
        >
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div
                key={item.id}
                className="inventory-item"
                onMouseEnter={(e) => handleItemHover(e, item)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleItemClick(item.id)}
                style={{
                  backgroundColor: selectedItem === item.id || firstSelectedItem === item.id
                    ? 'rgba(90, 60, 130, 0.7)'
                    : 'rgba(60, 40, 90, 0.5)',
                  border: combineMode && firstSelectedItem === item.id
                    ? '2px dashed rgba(220, 170, 50, 0.8)'
                    : selectedItem === item.id
                      ? '2px solid rgba(150, 120, 220, 0.8)'
                      : '1px solid rgba(120, 100, 180, 0.5)',
                  borderRadius: '6px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  aspectRatio: '1/1',
                  boxShadow: selectedItem === item.id || firstSelectedItem === item.id
                    ? '0 0 10px rgba(150, 120, 220, 0.4)'
                    : 'none'
                }}
                onMouseOver={(e) => {
                  if (selectedItem !== item.id && firstSelectedItem !== item.id) {
                    e.currentTarget.style.backgroundColor = 'rgba(70, 50, 110, 0.6)';
                    e.currentTarget.style.borderColor = 'rgba(140, 110, 200, 0.7)';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedItem !== item.id && firstSelectedItem !== item.id) {
                    e.currentTarget.style.backgroundColor = 'rgba(60, 40, 90, 0.5)';
                    e.currentTarget.style.borderColor = 'rgba(120, 100, 180, 0.5)';
                  }
                }}
              >
                {/* Item Quantity Badge (if quantity > 1) */}
                {item.quantity && item.quantity > 1 && (
                  <div
                    className="quantity-badge"
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      backgroundColor: 'rgba(100, 50, 150, 0.9)',
                      borderRadius: '50%',
                      width: '22px',
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      color: 'white',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    {item.quantity}
                  </div>
                )}
                
                {/* Item Icon */}
                <div
                  style={{
                    fontSize: '1.8rem',
                    margin: '5px 0',
                    lineHeight: 1
                  }}
                >
                  {item.icon || getItemIcon(item.category)}
                </div>
                
                {/* Item Name */}
                <div
                  style={{
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    marginTop: '5px',
                    fontWeight: 'bold',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    maxWidth: '100%'
                  }}
                >
                  {item.name}
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                gridColumn: '1/-1',
                textAlign: 'center',
                padding: '20px',
                color: '#aaa',
                fontStyle: 'italic',
                fontSize: '0.9rem'
              }}
            >
              No items found in this category.
            </div>
          )}
        </div>
        
        {/* Item Details */}
        {isExpanded && selectedItemDetails && (
          <div
            className="item-details"
            style={{
              width: '250px',
              borderLeft: '1px solid rgba(120, 100, 180, 0.3)',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              overflow: 'auto'
            }}
          >
            <h4
              style={{
                margin: '0 0 5px 0',
                color: '#d0c0ff',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '1.2rem'
              }}
            >
              <span>{selectedItemDetails.icon || getItemIcon(selectedItemDetails.category)}</span>
              {selectedItemDetails.name}
            </h4>
            
            <div
              style={{
                backgroundColor: 'rgba(50, 30, 70, 0.4)',
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '5px',
                fontSize: '0.9rem',
                lineHeight: 1.4,
                color: '#d8d0e0'
              }}
            >
              {selectedItemDetails.description}
            </div>
            
            {selectedItemDetails.properties && Object.keys(selectedItemDetails.properties).length > 0 && (
              <div
                style={{
                  backgroundColor: 'rgba(50, 30, 70, 0.4)',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '0.85rem'
                }}
              >
                <h5 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#c0b0e0' }}>Properties</h5>
                <ul
                  style={{
                    margin: 0,
                    padding: '0 0 0 15px',
                    listStyle: 'disc',
                    color: '#b8a8d8'
                  }}
                >
                  {Object.entries(selectedItemDetails.properties || {}).map(([key, value]) => (
                    <li key={key} style={{ marginBottom: '4px' }}>
                      <strong>{key}:</strong> {value.toString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Item Action Buttons */}
      {selectedItem && (
        <div
          className="item-actions"
          style={{
            display: 'flex',
            gap: '8px',
            padding: '10px',
            borderTop: '1px solid rgba(120, 100, 180, 0.3)',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={handleCancel}
            className="action-button"
            style={{
              backgroundColor: 'rgba(80, 60, 100, 0.5)',
              color: '#d0c0f0',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(90, 70, 120, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(80, 60, 100, 0.5)';
            }}
          >
            Cancel
          </button>
          
          {onItemExamine && (
            <button
              onClick={handleExamine}
              className="action-button"
              style={{
                backgroundColor: 'rgba(60, 80, 120, 0.6)',
                color: '#c0d0f0',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(70, 90, 140, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(60, 80, 120, 0.6)';
              }}
            >
              Examine
            </button>
          )}
          
          {onItemCombine && (
            <button
              onClick={handleCombine}
              className="action-button"
              style={{
                backgroundColor: combineMode 
                  ? 'rgba(130, 100, 20, 0.7)' 
                  : 'rgba(100, 70, 30, 0.6)',
                color: '#f0e0c0',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = combineMode
                  ? 'rgba(150, 120, 30, 0.7)'
                  : 'rgba(120, 90, 40, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = combineMode
                  ? 'rgba(130, 100, 20, 0.7)'
                  : 'rgba(100, 70, 30, 0.6)';
              }}
            >
              {combineMode ? 'Combining...' : 'Combine'}
            </button>
          )}
          
          <button
            onClick={handleUse}
            className="action-button"
            style={{
              backgroundColor: 'rgba(40, 80, 60, 0.7)',
              color: '#b0e0d0',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(50, 100, 80, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(40, 80, 60, 0.7)';
            }}
          >
            Use
          </button>
        </div>
      )}
      
      {/* Tooltip */}
      {showTooltip && (
        <div
          className="item-tooltip"
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            backgroundColor: 'rgba(40, 30, 60, 0.95)',
            padding: '10px',
            borderRadius: '6px',
            boxShadow: '0 3px 15px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(120, 100, 180, 0.5)',
            zIndex: 1000,
            maxWidth: '250px',
            backdropFilter: 'blur(3px)',
            pointerEvents: 'none',
            transform: 'translateY(-5px)',
            opacity: 0.95,
            transition: 'opacity 0.3s, transform 0.3s',
            fontSize: '0.9rem'
          }}
        >
          <h4 style={{ margin: '0 0 5px 0', color: '#e0d0ff' }}>{tooltipContent.title}</h4>
          <p style={{ margin: 0, color: '#c0b0e0', fontSize: '0.85rem', lineHeight: 1.4 }}>
            {tooltipContent.description}
          </p>
        </div>
      )}
      
      {/* Combine mode hint */}
      {combineMode && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '10px',
            backgroundColor: 'rgba(130, 100, 20, 0.8)',
            color: '#fff',
            textAlign: 'center',
            borderRadius: '10px 10px 0 0',
            fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            animation: 'pulse 2s infinite'
          }}
        >
          Select another item to combine with {
            firstSelectedItem ? items.find(i => i.id === firstSelectedItem)?.name : '...'
          }
        </div>
      )}
      
      {/* Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.9; }
            50% { opacity: 1; }
          }
          
          /* Custom scrollbar */
          .inventory-categories::-webkit-scrollbar,
          .items-grid::-webkit-scrollbar,
          .item-details::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          
          .inventory-categories::-webkit-scrollbar-track,
          .items-grid::-webkit-scrollbar-track,
          .item-details::-webkit-scrollbar-track {
            background: rgba(60, 40, 80, 0.1);
            border-radius: 4px;
          }
          
          .inventory-categories::-webkit-scrollbar-thumb,
          .items-grid::-webkit-scrollbar-thumb,
          .item-details::-webkit-scrollbar-thumb {
            background: rgba(120, 100, 180, 0.4);
            border-radius: 4px;
          }
          
          .inventory-categories::-webkit-scrollbar-thumb:hover,
          .items-grid::-webkit-scrollbar-thumb:hover,
          .item-details::-webkit-scrollbar-thumb:hover {
            background: rgba(140, 120, 200, 0.5);
          }
        `}
      </style>
    </div>
  );
};

export default InventoryPanel;