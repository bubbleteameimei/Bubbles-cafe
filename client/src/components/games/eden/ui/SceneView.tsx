import React, { useState, useEffect } from 'react';
import { SceneViewProps, Hotspot, Exit, SceneItem } from '../types';

/**
 * SceneView Component - Renders the current scene with interactive elements
 */
const SceneView: React.FC<SceneViewProps> = ({
  scene,
  onHotspotInteract,
  onExitSelect,
  onItemTake
}) => {
  const [highlightedHotspot, setHighlightedHotspot] = useState<string | null>(null);
  const [fogOpacity, setFogOpacity] = useState<number>(0.3);
  const [lighting, setLighting] = useState<string>('normal');
  const [ambientSound, setAmbientSound] = useState<string | null>(null);
  
  // Apply scene effects when scene changes
  useEffect(() => {
    // Set fog based on scene's environment
    if (scene.environment) {
      if (scene.environment.fog !== undefined) {
        setFogOpacity(scene.environment.fog / 100); // Convert from 0-100 to 0-1
      }
      
      // Set lighting effect
      if (scene.environment.lighting) {
        setLighting(scene.environment.lighting);
      }
      
      // Set ambient sound
      if (scene.environment.ambientSound) {
        setAmbientSound(scene.environment.ambientSound);
        // In a real implementation, this would trigger sound playback
      }
    }
  }, [scene]);
  
  // Handle hotspot hover
  const handleHotspotMouseEnter = (hotspotId: string) => {
    setHighlightedHotspot(hotspotId);
  };
  
  // Handle hotspot hover end
  const handleHotspotMouseLeave = () => {
    setHighlightedHotspot(null);
  };
  
  // Get lighting class based on scene environment
  const getLightingClass = () => {
    switch (lighting) {
      case 'dark':
        return 'scene-lighting-dark';
      case 'dim':
        return 'scene-lighting-dim';
      case 'flicker':
        return 'scene-lighting-flicker';
      case 'moonlight':
        return 'scene-lighting-moonlight';
      case 'firelight':
        return 'scene-lighting-firelight';
      default:
        return 'scene-lighting-normal';
    }
  };
  
  // Render hotspots for the current scene
  const renderHotspots = () => {
    if (!scene.hotspots) return null;
    
    return scene.hotspots.map(hotspot => {
      // Skip hidden hotspots
      if (hotspot.hidden) return null;
      
      const isHighlighted = highlightedHotspot === hotspot.id;
      
      return (
        <div
          key={hotspot.id}
          className={`scene-hotspot ${isHighlighted ? 'highlighted' : ''}`}
          style={{
            left: `${hotspot.x}%`,
            top: `${hotspot.y}%`,
            width: `${hotspot.width || 5}%`,
            height: `${hotspot.height || 5}%`,
          }}
          onClick={() => onHotspotInteract(hotspot.id)}
          onMouseEnter={() => handleHotspotMouseEnter(hotspot.id)}
          onMouseLeave={handleHotspotMouseLeave}
          title={hotspot.name}
        >
          {isHighlighted && (
            <div className="hotspot-tooltip">
              {hotspot.name}
            </div>
          )}
        </div>
      );
    });
  };
  
  // Render exits for the current scene
  const renderExits = () => {
    if (!scene.exits) return null;
    
    return scene.exits.map(exit => {
      // Skip hidden exits
      if (exit.hidden) return null;
      
      return (
        <div
          key={exit.id}
          className={`scene-exit ${exit.locked ? 'locked' : ''}`}
          style={{
            left: `${exit.x}%`,
            top: `${exit.y}%`,
            width: `${exit.width || 10}%`,
            height: `${exit.height || 10}%`,
          }}
          onClick={() => onExitSelect(exit.id)}
          title={exit.name}
        >
          <div className="exit-icon">
            {exit.locked ? '🔒' : '➡️'}
          </div>
          <div className="exit-name">{exit.name}</div>
        </div>
      );
    });
  };
  
  // Render items in the scene
  const renderItems = () => {
    if (!scene.items) return null;
    
    return scene.items.map(item => {
      // Skip hidden items
      if (item.hidden) return null;
      
      return (
        <div
          key={item.id}
          className="scene-item"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: `${item.width || 3}%`,
            height: `${item.height || 3}%`,
          }}
          onClick={() => onItemTake(item.id)}
          title={item.name || 'Item'}
        >
          <div className="item-glow" />
        </div>
      );
    });
  };
  
  return (
    <div className={`scene-view ${getLightingClass()}`}>
      {/* Background image */}
      {scene.backgroundImage && (
        <div 
          className="scene-background"
          style={{ backgroundImage: `url(${scene.backgroundImage})` }}
        />
      )}
      
      {/* Foreground elements */}
      {scene.foregroundImage && (
        <div 
          className="scene-foreground"
          style={{ backgroundImage: `url(${scene.foregroundImage})` }}
        />
      )}
      
      {/* Interactive elements */}
      <div className="scene-interactive-elements">
        {renderHotspots()}
        {renderExits()}
        {renderItems()}
      </div>
      
      {/* Environmental effects */}
      <div 
        className="scene-fog"
        style={{ opacity: fogOpacity }}
      />
      
      {/* Scene information */}
      <div className="scene-info">
        <h2 className="scene-name">{scene.name}</h2>
        {scene.description && (
          <p className="scene-description">{scene.description}</p>
        )}
      </div>
      
      <style>
        {`
          .scene-view {
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
            z-index: 1;
            transition: filter 1s ease;
          }
          
          .scene-foreground {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            z-index: 3;
            pointer-events: none;
          }
          
          .scene-interactive-elements {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2;
          }
          
          .scene-hotspot {
            position: absolute;
            cursor: pointer;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0);
            transition: all 0.3s ease;
          }
          
          .scene-hotspot:hover, .scene-hotspot.highlighted {
            border-color: rgba(255, 255, 255, 0.5);
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
          }
          
          .hotspot-tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            white-space: nowrap;
            font-size: 14px;
            margin-bottom: 8px;
            z-index: 10;
          }
          
          .scene-exit {
            position: absolute;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          }
          
          .exit-icon {
            font-size: 20px;
            margin-bottom: 5px;
            opacity: 0.7;
            transition: opacity 0.3s ease;
          }
          
          .exit-name {
            color: white;
            background-color: rgba(0, 0, 0, 0.6);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            text-align: center;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .scene-exit:hover .exit-icon {
            opacity: 1;
          }
          
          .scene-exit:hover .exit-name {
            opacity: 1;
          }
          
          .scene-exit.locked .exit-icon {
            opacity: 0.5;
          }
          
          .scene-item {
            position: absolute;
            cursor: pointer;
            z-index: 4;
          }
          
          .item-glow {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: rgba(255, 255, 200, 0.3);
            box-shadow: 0 0 15px rgba(255, 255, 150, 0.5);
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.2); opacity: 1; }
          }
          
          .scene-fog {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #000;
            mix-blend-mode: multiply;
            pointer-events: none;
            z-index: 5;
            transition: opacity 1s ease;
          }
          
          .scene-info {
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 6;
            color: white;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
            opacity: 0.7;
            transition: opacity 0.3s;
            max-width: 400px;
          }
          
          .scene-info:hover {
            opacity: 1;
          }
          
          .scene-name {
            margin: 0 0 5px 0;
            font-size: 24px;
          }
          
          .scene-description {
            margin: 0;
            font-size: 16px;
            line-height: 1.4;
          }
          
          /* Lighting effects */
          .scene-lighting-dark .scene-background {
            filter: brightness(0.3) saturate(0.7);
          }
          
          .scene-lighting-dim .scene-background {
            filter: brightness(0.6) saturate(0.8);
          }
          
          .scene-lighting-flicker .scene-background {
            animation: flicker 5s infinite;
          }
          
          .scene-lighting-moonlight .scene-background {
            filter: brightness(0.4) saturate(0.6) hue-rotate(40deg);
          }
          
          .scene-lighting-firelight .scene-background {
            filter: brightness(0.7) saturate(1.2) sepia(0.3);
            animation: fireflicker 3s infinite;
          }
          
          @keyframes flicker {
            0%, 100% { filter: brightness(0.5) saturate(0.8); }
            50% { filter: brightness(0.4) saturate(0.7); }
            25%, 75% { filter: brightness(0.55) saturate(0.85); }
          }
          
          @keyframes fireflicker {
            0%, 100% { filter: brightness(0.7) saturate(1.2) sepia(0.3); }
            50% { filter: brightness(0.6) saturate(1.1) sepia(0.25); }
          }
        `}
      </style>
    </div>
  );
};

export default SceneView;