import React, { useState, useEffect } from 'react';
import { SceneViewProps, Scene, Hotspot, SceneItem, Exit } from '../types';

/**
 * SceneView - Displays and manages interactive game scenes
 */
const SceneView: React.FC<SceneViewProps> = ({
  scene,
  onHotspotInteract,
  onExitSelect,
  onItemTake,
  visitedExits = [],
  inventoryItems = []
}) => {
  const [hoverHotspotId, setHoverHotspotId] = useState<string | null>(null);
  const [hoverExitId, setHoverExitId] = useState<string | null>(null);
  const [hoverItemId, setHoverItemId] = useState<string | null>(null);
  const [transitionState, setTransitionState] = useState<'in' | 'visible' | 'out'>('in');
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Handle scene transitions
  useEffect(() => {
    // Initial transition in
    setTransitionState('in');
    const timer = setTimeout(() => {
      setTransitionState('visible');
    }, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, [scene.id]);
  
  // Check if an exit is locked
  const isExitLocked = (exit: Exit): boolean => {
    // If exit has no lock, it's always unlocked
    if (!exit.locked) return false;
    
    // If exit requires an item that's not in inventory, it's locked
    if (exit.lockType === 'item' && exit.requiredItem) {
      return !inventoryItems.some(item => item.id === exit.requiredItem);
    }
    
    // If exit requires a flag that's not set, it's locked
    if (exit.lockType === 'flag' && exit.requiredFlag) {
      // This would need to check against game state flags
      // For demo purposes, assume flags would be checked in the parent component
      return true;
    }
    
    return exit.locked;
  };
  
  // Handle exit click
  const handleExitClick = (exitId: string, exit: Exit) => {
    if (isExitLocked(exit)) {
      // Show locked message if available
      if (exit.lockedMessage) {
        // Would typically show this via the notification system
        alert(exit.lockedMessage);
      }
      return;
    }
    
    // Begin transition out
    setTransitionState('out');
    
    // Delay the actual navigation to allow for transition animation
    setTimeout(() => {
      if (onExitSelect) {
        onExitSelect(exitId);
      }
    }, scene.transition?.duration || 500);
  };
  
  // Handle hotspot click
  const handleHotspotClick = (hotspotId: string) => {
    if (onHotspotInteract) {
      onHotspotInteract(hotspotId);
    }
  };
  
  // Handle item click
  const handleItemClick = (itemId: string) => {
    if (onItemTake) {
      onItemTake(itemId);
    }
  };
  
  // Handle mouse movement for tooltips
  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({
      x: e.clientX,
      y: e.clientY
    });
  };
  
  // Get transition class based on current state and scene settings
  const getTransitionClass = () => {
    const transitionType = scene.transition?.type || 'fade';
    
    switch (transitionState) {
      case 'in':
        return `scene-transition-${transitionType}-in`;
      case 'out':
        return `scene-transition-${transitionType}-out`;
      default:
        return '';
    }
  };
  
  return (
    <div 
      className={`scene-container ${getTransitionClass()}`}
      onMouseMove={handleMouseMove}
    >
      {/* Scene Background */}
      <div className="scene-background">
        {scene.backgroundImage ? (
          <img 
            src={scene.backgroundImage}
            alt={scene.name || 'Scene'} 
            className="scene-image"
          />
        ) : (
          <div className="scene-placeholder" />
        )}
      </div>
      
      {/* Scene Overlay Effects */}
      {scene.overlayEffect && (
        <div className={`scene-overlay scene-overlay-${scene.overlayEffect}`} />
      )}
      
      {/* Hotspots */}
      <div className="hotspots-container">
        {scene.hotspots?.map(hotspot => (
          <div
            key={hotspot.id}
            className={`hotspot ${hoverHotspotId === hotspot.id ? 'hotspot-hover' : ''}`}
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              width: `${hotspot.width}%`,
              height: `${hotspot.height}%`,
              borderRadius: hotspot.shape === 'circle' ? '50%' : '0'
            }}
            onClick={() => handleHotspotClick(hotspot.id)}
            onMouseEnter={() => {
              setHoverHotspotId(hotspot.id);
              setShowTooltip(true);
              setTooltipText(hotspot.tooltip || 'Examine');
            }}
            onMouseLeave={() => {
              setHoverHotspotId(null);
              setShowTooltip(false);
            }}
          />
        ))}
      </div>
      
      {/* Scene Items */}
      <div className="items-container">
        {scene.items?.map(item => (
          <div
            key={item.id}
            className={`scene-item ${hoverItemId === item.id ? 'scene-item-hover' : ''}`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: `${item.width}%`,
              height: `${item.height}%`
            }}
            onClick={() => handleItemClick(item.id)}
            onMouseEnter={() => {
              setHoverItemId(item.id);
              setShowTooltip(true);
              setTooltipText(item.tooltip || (item.icon ? `Take ${item.icon}` : 'Take item'));
            }}
            onMouseLeave={() => {
              setHoverItemId(null);
              setShowTooltip(false);
            }}
          >
            {item.visualCue && (
              <div className="item-visual-cue" />
            )}
          </div>
        ))}
      </div>
      
      {/* Exits */}
      <div className="exits-container">
        {scene.exits?.map(exit => (
          <div
            key={exit.id}
            className={`scene-exit ${
              hoverExitId === exit.id ? 'scene-exit-hover' : ''
            } ${
              isExitLocked(exit) ? 'scene-exit-locked' : ''
            } ${
              visitedExits.includes(exit.id) ? 'scene-exit-visited' : ''
            }`}
            style={{
              left: `${exit.x}%`,
              top: `${exit.y}%`,
              width: `${exit.width}%`,
              height: `${exit.height}%`
            }}
            onClick={() => handleExitClick(exit.id, exit)}
            onMouseEnter={() => {
              setHoverExitId(exit.id);
              setShowTooltip(true);
              setTooltipText(
                isExitLocked(exit) 
                  ? (exit.lockedTooltip || 'Locked')
                  : (exit.tooltip || 'Go here')
              );
            }}
            onMouseLeave={() => {
              setHoverExitId(null);
              setShowTooltip(false);
            }}
          >
            {exit.icon && <div className="exit-icon">{exit.icon}</div>}
          </div>
        ))}
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div 
          className="scene-tooltip"
          style={{
            left: tooltipPosition.x + 15,
            top: tooltipPosition.y + 15
          }}
        >
          {tooltipText}
        </div>
      )}
      
      <style>{`
        .scene-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: #000;
        }
        
        /* Scene background */
        .scene-background {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .scene-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .scene-placeholder {
          width: 100%;
          height: 100%;
          background-color: #111;
        }
        
        /* Scene overlay effects */
        .scene-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }
        
        .scene-overlay-fog {
          background-image: url('/assets/fog-overlay.png');
          opacity: 0.5;
          animation: fog-movement 60s infinite alternate;
        }
        
        .scene-overlay-dark {
          background-color: rgba(0, 0, 0, 0.5);
        }
        
        .scene-overlay-eerie {
          background: radial-gradient(circle at center, rgba(20, 0, 40, 0.3) 0%, rgba(10, 0, 20, 0.7) 100%);
          mix-blend-mode: multiply;
        }
        
        @keyframes fog-movement {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        
        /* Hotspots */
        .hotspots-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .hotspot {
          position: absolute;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0);
          background-color: rgba(255, 255, 255, 0);
          transition: all 0.2s ease;
          pointer-events: auto;
        }
        
        .hotspot-hover {
          border: 1px solid rgba(255, 255, 255, 0.3);
          background-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
        }
        
        /* Scene items */
        .items-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .scene-item {
          position: absolute;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0);
          background-color: rgba(255, 255, 255, 0);
          transition: all 0.2s ease;
          pointer-events: auto;
        }
        
        .scene-item-hover {
          border: 1px solid rgba(255, 255, 100, 0.3);
          background-color: rgba(255, 255, 100, 0.1);
          box-shadow: 0 0 15px rgba(255, 255, 100, 0.3);
        }
        
        .item-visual-cue {
          position: absolute;
          width: 20px;
          height: 20px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(255, 255, 0, 0.5);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.3; }
        }
        
        /* Exits */
        .exits-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .scene-exit {
          position: absolute;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0);
          background-color: rgba(255, 255, 255, 0);
          transition: all 0.2s ease;
          pointer-events: auto;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .scene-exit-hover {
          border: 1px solid rgba(100, 200, 255, 0.3);
          background-color: rgba(100, 200, 255, 0.1);
          box-shadow: 0 0 15px rgba(100, 200, 255, 0.3);
        }
        
        .scene-exit-locked {
          cursor: not-allowed;
        }
        
        .scene-exit-locked.scene-exit-hover {
          border: 1px solid rgba(255, 100, 100, 0.3);
          background-color: rgba(255, 100, 100, 0.1);
          box-shadow: 0 0 15px rgba(255, 100, 100, 0.3);
        }
        
        .scene-exit-visited {
          border: 1px solid rgba(100, 255, 100, 0.1);
        }
        
        .exit-icon {
          color: rgba(255, 255, 255, 0.7);
          font-size: 24px;
        }
        
        /* Tooltip */
        .scene-tooltip {
          position: fixed;
          background-color: rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 14px;
          pointer-events: none;
          z-index: 1000;
          max-width: 200px;
          white-space: nowrap;
        }
        
        /* Transitions */
        .scene-transition-fade-in {
          animation: fadeIn 0.5s forwards;
        }
        
        .scene-transition-fade-out {
          animation: fadeOut 0.5s forwards;
        }
        
        .scene-transition-slide-in {
          animation: slideIn 0.5s forwards;
        }
        
        .scene-transition-slide-out {
          animation: slideOut 0.5s forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        
        @keyframes slideOut {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default SceneView;