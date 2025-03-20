import React from 'react';
import { Item } from '../types';

interface InventoryPanelProps {
  items: Item[];
  onItemUse: (itemId: string) => void;
  onInventoryClose: () => void;
  isOpen: boolean;
}

/**
 * Displays and manages the player's inventory items
 */
const InventoryPanel: React.FC<InventoryPanelProps> = ({
  items,
  onItemUse,
  onInventoryClose,
  isOpen
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="inventory-panel" style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      width: '300px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid #333',
      borderRadius: '5px',
      padding: '15px',
      zIndex: 100
    }}>
      <div className="inventory-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{ margin: 0, color: '#fff' }}>Inventory</h3>
        <button 
          onClick={onInventoryClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#aaa',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ×
        </button>
      </div>
      
      {items.length === 0 ? (
        <div className="empty-inventory" style={{ color: '#aaa', textAlign: 'center', padding: '20px 0' }}>
          Your inventory is empty.
        </div>
      ) : (
        <div className="inventory-items" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px'
        }}>
          {items.map((item) => (
            <div 
              key={item.id} 
              className="inventory-item"
              onClick={() => onItemUse(item.id)}
              style={{
                backgroundColor: '#222',
                border: '1px solid #444',
                borderRadius: '4px',
                padding: '10px',
                cursor: item.isUsable ? 'pointer' : 'default',
                opacity: item.isUsable ? 1 : 0.7,
                textAlign: 'center'
              }}
              title={item.description}
            >
              <div className="item-name" style={{ color: '#fff', fontSize: '14px', marginBottom: '5px' }}>
                {item.name}
              </div>
              
              {item.isConsumable && (
                <div className="item-consumable" style={{ 
                  fontSize: '10px', 
                  color: '#ff9900',
                  marginTop: '5px'
                }}>
                  Consumable
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryPanel;