import React, { useState } from 'react';
import { SceneViewProps, Hotspot, Exit, SceneItem } from '../types';

/**
 * SceneView component - Renders the current game scene with interactable elements
 */
const SceneView: React.FC<SceneViewProps> = ({
  scene,
  onHotspotInteract,
  onExitSelect,
  onItemTake
}) => {
  const [hoveredElement, setHoveredElement] = useState<{ type: string, id: string, name: string } | null>(null);
  
  // Handle mouse hovering over scene elements
  const handleMouseEnter = (type: string, id: string, name: string) => {
    setHoveredElement({ type, id, name });
  };
  
  // Handle mouse leaving scene elements
  const handleMouseLeave = () => {
    setHoveredElement(null);
  };
  
  // Handle scene interactions
  const handleHotspotClick = (hotspotId: string) => {
    onHotspotInteract(hotspotId);
  };
  
  const handleExitClick = (exitId: string) => {
    onExitSelect(exitId);
  };
  
  const handleItemClick = (itemId: string) => {
    onItemTake(itemId);
  };
  
  // Generate CSS filters based on scene lighting
  const getSceneEffects = (): string => {
    switch (scene.lighting) {
      case 'dark':
        return 'brightness(0.6) contrast(1.1)';
      case 'fog':
        return 'brightness(0.8) contrast(0.9) blur(1px)';
      case 'fire':
        return 'brightness(0.8) sepia(0.3) hue-rotate(-10deg)';
      case 'magical':
        return 'brightness(1.1) saturate(1.3) hue-rotate(5deg)';
      default:
        return 'brightness(1) contrast(1)';
    }
  };
  
  return (
    <div className="scene-view-container">
      {/* Scene Background */}
      <div 
        className="scene-background" 
        style={{ 
          backgroundImage: `url(${scene.background})`,
          filter: getSceneEffects()
        }}
      />
      
      {/* Overlay for scene interaction elements */}
      <div className="scene-interaction-layer">
        {/* Hotspots */}
        {scene.hotspots?.map((hotspot: Hotspot) => (
          <div
            key={hotspot.id}
            className="hotspot"
            style={{
              left: `${hotspot.x}px`,
              top: `${hotspot.y}px`,
              width: `${hotspot.width}px`,
              height: `${hotspot.height}px`
            }}
            onMouseEnter={() => handleMouseEnter('hotspot', hotspot.id, hotspot.name)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleHotspotClick(hotspot.id)}
            title={hotspot.name}
            role="button"
            aria-label={`Interact with ${hotspot.name}`}
            tabIndex={0}
          />
        ))}
        
        {/* Exits */}
        {scene.exits?.map((exit: Exit) => (
          <div
            key={exit.id}
            className="exit"
            style={{
              left: `${exit.position.x}px`,
              top: `${exit.position.y}px`,
              width: `${exit.position.width}px`,
              height: `${exit.position.height}px`
            }}
            onMouseEnter={() => handleMouseEnter('exit', exit.id, exit.name)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleExitClick(exit.id)}
            title={exit.name}
            role="button"
            aria-label={`Go to ${exit.name}`}
            tabIndex={0}
          />
        ))}
        
        {/* Items */}
        {scene.items?.map((item: SceneItem) => (
          <div
            key={item.id}
            className="scene-item"
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
              width: `${item.width}px`,
              height: `${item.height}px`
            }}
            onMouseEnter={() => handleMouseEnter('item', item.id, 'Item')}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleItemClick(item.id)}
            title="Item"
            role="button"
            aria-label="Pick up item"
            tabIndex={0}
          />
        ))}
      </div>
      
      {/* Tooltip for hovering */}
      {hoveredElement && (
        <div
          className="scene-tooltip"
          style={{
            left: hoveredElement.type === 'exit' ? '50%' : undefined,
            bottom: hoveredElement.type === 'exit' ? '20px' : undefined,
            transform: hoveredElement.type === 'exit' ? 'translateX(-50%)' : undefined
          }}
        >
          <span className="tooltip-text">{hoveredElement.name}</span>
        </div>
      )}
      
      {/* Scene name display */}
      <div className="scene-name-display">
        <h2>{scene.name}</h2>
      </div>
      
      <style>
        {`
          .scene-view-container {
            position: relative;
            width: 100%;
            height: 100vh;
            overflow: hidden;
          }
          
          .scene-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            transition: filter 1s ease-out;
          }
          
          .scene-interaction-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
          }
          
          .hotspot {
            position: absolute;
            cursor: pointer;
            border: 2px solid transparent;
            border-radius: 5px;
            transition: border-color 0.2s;
          }
          
          .hotspot:hover {
            border-color: rgba(255, 255, 255, 0.5);
            background-color: rgba(255, 255, 255, 0.1);
          }
          
          .exit {
            position: absolute;
            cursor: pointer;
            border: 2px solid transparent;
            border-radius: 3px;
            transition: all 0.3s;
          }
          
          .exit:hover {
            border-color: rgba(200, 255, 200, 0.5);
            background-color: rgba(100, 255, 100, 0.1);
          }
          
          .scene-item {
            position: absolute;
            cursor: pointer;
            border: 2px solid transparent;
            border-radius: 50%;
            transition: all 0.3s;
          }
          
          .scene-item:hover {
            border-color: rgba(255, 215, 0, 0.7);
            background-color: rgba(255, 215, 0, 0.2);
            transform: scale(1.1);
          }
          
          .scene-tooltip {
            position: absolute;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 14px;
            z-index: 100;
            pointer-events: none;
            animation: fadeIn 0.2s ease-out;
            bottom: 10%;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            min-width: 100px;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .tooltip-text {
            white-space: nowrap;
          }
          
          .scene-name-display {
            position: absolute;
            top: 20px;
            left: 0;
            width: 100%;
            text-align: center;
            z-index: 10;
            pointer-events: none;
          }
          
          .scene-name-display h2 {
            display: inline-block;
            margin: 0;
            padding: 5px 15px;
            background-color: rgba(0, 0, 0, 0.6);
            color: white;
            border-radius: 4px;
            font-size: 18px;
            font-weight: 500;
            letter-spacing: 1px;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
          }
          
          /* Focus styles for accessibility */
          .hotspot:focus, .exit:focus, .scene-item:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.6);
          }
        `}
      </style>
    </div>
  );
};

export default SceneView;