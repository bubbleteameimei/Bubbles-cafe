import React, { useState, useEffect } from 'react';
import { SceneViewProps, Scene, Hotspot, Exit, SceneItem, SceneEffect } from '../types';

/**
 * SceneView - Displays the game scene with interactive elements
 */
const SceneView: React.FC<SceneViewProps> = ({
  scene,
  onHotspotClick,
  onExitClick,
  onItemClick,
  activeInventoryItem,
  lighting,
  fogAmount,
  effectFilters
}) => {
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [hoveredExit, setHoveredExit] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  
  // Reset hover states when scene changes
  useEffect(() => {
    setHoveredHotspot(null);
    setHoveredExit(null);
    setHoveredItem(null);
    setIsLoading(true);
    setImageLoaded(false);
  }, [scene.id]);
  
  // Handle hotspot click
  const handleHotspotClick = (hotspot: Hotspot) => {
    if (activeInventoryItem) {
      // Handle using inventory item on hotspot
      // This is handled by the parent component via onHotspotClick
    }
    onHotspotClick(hotspot.id);
  };
  
  // Handle exit click
  const handleExitClick = (exit: Exit) => {
    if (activeInventoryItem) {
      // Handle using inventory item on exit (e.g. using key on locked door)
      // This is handled by the parent component via onExitClick
    }
    onExitClick(exit.id);
  };
  
  // Handle scene item click
  const handleItemClick = (item: SceneItem) => {
    onItemClick(item.id);
  };
  
  // Handle background image load
  const handleImageLoaded = () => {
    setImageLoaded(true);
    setIsLoading(false);
  };
  
  // Get tooltip text for scene item
  const getItemTooltip = (item: SceneItem) => {
    if (activeInventoryItem) {
      return item.iconUrl ? `Use ${activeInventoryItem} on item` : 'Examine';
    } else {
      return item.tooltip || 'Take item';
    }
  };
  
  // Get tooltip text for hotspot
  const getHotspotTooltip = (hotspot: Hotspot) => {
    if (activeInventoryItem) {
      return `Use ${activeInventoryItem} on ${hotspot.name || 'this'}`;
    } else {
      return hotspot.tooltip || (hotspot.type === 'inspect' ? 'Examine' : 'Interact');
    }
  };
  
  // Get tooltip text for exit
  const getExitTooltip = (exit: Exit) => {
    if (activeInventoryItem && exit.lockState === 'locked') {
      return `Use ${activeInventoryItem} on ${exit.type}`;
    } else if (exit.lockState === 'locked') {
      return exit.tooltip || 'Locked';
    } else if (exit.lockState === 'sealed') {
      return exit.tooltip || 'Sealed';
    } else {
      return exit.tooltip || `Go to ${exit.type}`;
    }
  };
  
  // Get hotspot interaction cursor style
  const getHotspotCursorStyle = (hotspot: Hotspot) => {
    if (activeInventoryItem) {
      return 'cursor-use';
    } else {
      switch (hotspot.type) {
        case 'inspect':
          return 'cursor-inspect';
        case 'interact':
          return 'cursor-interact';
        case 'dialog':
          return 'cursor-talk';
        case 'puzzle':
          return 'cursor-puzzle';
        default:
          return 'cursor-interact';
      }
    }
  };
  
  // Get exit cursor style
  const getExitCursorStyle = (exit: Exit) => {
    if (activeInventoryItem && exit.lockState === 'locked') {
      return 'cursor-use';
    } else if (exit.lockState === 'locked') {
      return 'cursor-locked';
    } else if (exit.lockState === 'unlockable') {
      return 'cursor-key';
    } else if (exit.lockState === 'sealed') {
      return 'cursor-sealed';
    } else {
      return 'cursor-exit';
    }
  };
  
  return (
    <div className="scene-container">
      {/* Loading indicator */}
      {isLoading && (
        <div className="scene-loading">
          <div className="scene-loading-spinner"></div>
          <div className="scene-loading-text">Loading scene...</div>
        </div>
      )}
      
      {/* Scene background */}
      <div 
        className={`scene-background ${imageLoaded ? 'scene-loaded' : 'scene-loading'} lighting-${lighting || 'normal'}`}
        style={{ 
          backgroundImage: `url('${scene.backgroundUrl}')`,
          filter: `blur(${scene.blurAmount || 0}px)`
        }}
      >
        <img 
          src={scene.backgroundUrl} 
          alt={scene.name} 
          className="scene-preload-image" 
          onLoad={handleImageLoaded}
        />
      </div>
      
      {/* Fog overlay */}
      {(fogAmount > 0 || lighting === 'dark' || lighting === 'eerie') && (
        <div 
          className={`scene-fog lighting-${lighting || 'normal'}`}
          style={{ opacity: fogAmount / 10 }}
        ></div>
      )}
      
      {/* Scene overlay (optional) */}
      {scene.overlayUrl && (
        <div 
          className="scene-overlay"
          style={{ backgroundImage: `url('${scene.overlayUrl}')` }}
        ></div>
      )}
      
      {/* Ambient effects */}
      {scene.ambientEffects && scene.ambientEffects.length > 0 && (
        scene.ambientEffects.map((effect, index) => (
          <div 
            key={`effect-${index}`}
            className={`ambient-effect effect-${effect.type}`}
            style={{
              opacity: effect.intensity / 10,
              backgroundColor: effect.color
            }}
          ></div>
        ))
      )}
      
      {/* Hotspots */}
      {scene.hotspots.map((hotspot) => (
        <div
          key={hotspot.id}
          className={`scene-hotspot ${getHotspotCursorStyle(hotspot)} ${hoveredHotspot === hotspot.id ? 'hovered' : ''} ${activeInventoryItem ? 'with-item' : ''}`}
          style={{
            left: `${hotspot.x}%`,
            top: `${hotspot.y}%`,
            width: `${hotspot.width}%`,
            height: `${hotspot.height}%`
          }}
          onClick={() => handleHotspotClick(hotspot)}
          onMouseEnter={() => setHoveredHotspot(hotspot.id)}
          onMouseLeave={() => setHoveredHotspot(null)}
          data-tooltip={getHotspotTooltip(hotspot)}
        ></div>
      ))}
      
      {/* Exits */}
      {scene.exits.map((exit) => (
        <div
          key={exit.id}
          className={`scene-exit ${getExitCursorStyle(exit)} ${hoveredExit === exit.id ? 'hovered' : ''} ${activeInventoryItem ? 'with-item' : ''}`}
          style={{
            left: `${exit.x}%`,
            top: `${exit.y}%`,
            width: `${exit.width}%`,
            height: `${exit.height}%`
          }}
          onClick={() => handleExitClick(exit)}
          onMouseEnter={() => setHoveredExit(exit.id)}
          onMouseLeave={() => setHoveredExit(null)}
          data-tooltip={getExitTooltip(exit)}
        ></div>
      ))}
      
      {/* Scene items */}
      {scene.items.map((item) => (
        <div
          key={item.id}
          className={`scene-item ${hoveredItem === item.id ? 'hovered' : ''} ${activeInventoryItem ? 'with-item' : ''}`}
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: `${item.width}%`,
            height: `${item.height}%`,
            backgroundImage: item.iconUrl ? `url(${item.iconUrl})` : 'none'
          }}
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          data-tooltip={getItemTooltip(item)}
        ></div>
      ))}
      
      {/* Scene foreground (optional) */}
      {scene.foregroundUrl && (
        <div 
          className="scene-foreground"
          style={{ backgroundImage: `url('${scene.foregroundUrl}')` }}
        ></div>
      )}
      
      <style jsx>{`
        .scene-container {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: default;
        }
        
        .scene-loading {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          z-index: 50;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #e0e0e0;
          font-family: 'Times New Roman', serif;
        }
        
        .scene-loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #e0e0e0;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 15px;
        }
        
        .scene-loading-text {
          font-size: 18px;
          letter-spacing: 1px;
        }
        
        .scene-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          transition: filter 0.5s ease;
        }
        
        .scene-loading {
          opacity: 1;
          transition: opacity 0.3s ease;
        }
        
        .scene-loaded {
          opacity: 1;
          animation: fadeIn 0.5s ease;
        }
        
        .scene-preload-image {
          display: none;
        }
        
        .scene-fog {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(20, 20, 30, 0.5);
          mix-blend-mode: multiply;
          z-index: 10;
          pointer-events: none;
        }
        
        .scene-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          z-index: 20;
          pointer-events: none;
        }
        
        .scene-foreground {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          z-index: 40;
          pointer-events: none;
        }
        
        .ambient-effect {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 15;
          pointer-events: none;
        }
        
        .effect-fog {
          background-color: rgba(40, 40, 50, 0.6);
          animation: fogMove 120s infinite ease-in-out;
        }
        
        .effect-rain {
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(200, 200, 220, 0.3) 100%);
          animation: rainFall 1.5s infinite linear;
        }
        
        .effect-snow {
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 2px) 0 0;
          background-size: 10px 10px;
          animation: snowFall 10s infinite linear;
        }
        
        .effect-sparks {
          background-image: radial-gradient(circle, rgba(255, 180, 50, 0.7) 1px, transparent 2px);
          background-size: 100px 100px;
          animation: sparkle 3s infinite ease-in-out;
        }
        
        .effect-dust {
          background-image: radial-gradient(circle, rgba(200, 180, 120, 0.3) 1px, transparent 2px);
          background-size: 50px 50px;
          animation: dustMove 30s infinite linear;
        }
        
        .effect-lightning {
          background-color: rgba(200, 220, 255, 0);
          animation: lightning 10s infinite ease-out;
        }
        
        .scene-hotspot, .scene-exit, .scene-item {
          position: absolute;
          z-index: 30;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        
        .scene-hotspot.hovered, .scene-exit.hovered, .scene-item.hovered {
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
        }
        
        .scene-hotspot.hovered::after, .scene-exit.hovered::after, .scene-item.hovered::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(10, 10, 20, 0.9);
          color: #e0e0e0;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
          white-space: nowrap;
          z-index: 100;
          pointer-events: none;
          font-family: 'Times New Roman', serif;
        }
        
        .scene-item {
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
        
        .cursor-inspect { cursor: url('/assets/cursors/inspect.png'), help; }
        .cursor-interact { cursor: url('/assets/cursors/interact.png'), pointer; }
        .cursor-talk { cursor: url('/assets/cursors/talk.png'), pointer; }
        .cursor-puzzle { cursor: url('/assets/cursors/puzzle.png'), pointer; }
        .cursor-exit { cursor: url('/assets/cursors/exit.png'), pointer; }
        .cursor-locked { cursor: url('/assets/cursors/locked.png'), not-allowed; }
        .cursor-sealed { cursor: url('/assets/cursors/sealed.png'), not-allowed; }
        .cursor-key { cursor: url('/assets/cursors/key.png'), pointer; }
        .cursor-use { cursor: url('/assets/cursors/use.png'), pointer; }
        
        .lighting-bright {
          filter: brightness(1.2) contrast(1.1);
        }
        
        .lighting-dim {
          filter: brightness(0.8) contrast(1.1) saturate(0.9);
        }
        
        .lighting-dark {
          filter: brightness(0.5) contrast(1.2) saturate(0.8);
        }
        
        .lighting-eerie {
          filter: brightness(0.7) contrast(1.2) saturate(0.7) hue-rotate(10deg);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes fogMove {
          0% { opacity: 0.5; transform: translateX(-10%) translateY(0); }
          50% { opacity: 0.7; transform: translateX(10%) translateY(0); }
          100% { opacity: 0.5; transform: translateX(-10%) translateY(0); }
        }
        
        @keyframes rainFall {
          from { background-position: 0 0; }
          to { background-position: 0 100%; }
        }
        
        @keyframes snowFall {
          from { background-position: 0 0; }
          to { background-position: 10px 100%; }
        }
        
        @keyframes sparkle {
          0% { opacity: 0.2; }
          50% { opacity: 0.5; }
          100% { opacity: 0.2; }
        }
        
        @keyframes dustMove {
          from { background-position: 0 0; }
          to { background-position: 100px 100px; }
        }
        
        @keyframes lightning {
          0% { background-color: rgba(200, 220, 255, 0); }
          2% { background-color: rgba(200, 220, 255, 0.8); }
          3% { background-color: rgba(200, 220, 255, 0); }
          6% { background-color: rgba(200, 220, 255, 0.4); }
          8% { background-color: rgba(200, 220, 255, 0); }
          100% { background-color: rgba(200, 220, 255, 0); }
        }
        
        @media (max-width: 768px) {
          .scene-hotspot.hovered::after, .scene-exit.hovered::after, .scene-item.hovered::after {
            font-size: 12px;
            padding: 3px 6px;
          }
          
          .scene-loading-spinner {
            width: 40px;
            height: 40px;
          }
          
          .scene-loading-text {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default SceneView;