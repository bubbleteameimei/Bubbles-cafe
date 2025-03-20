import React, { useState, useEffect } from 'react';
import { Scene, InteractiveElement, Exit } from '../types';

export interface SceneViewProps {
  scene: Scene;
  onInteract: (elementId: string, actionType: string) => void;
  onExitClick: (exitId: string) => void;
}

export const SceneView: React.FC<SceneViewProps> = ({
  scene,
  onInteract,
  onExitClick
}) => {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [hoveredExit, setHoveredExit] = useState<string | null>(null);
  const [sceneLoaded, setSceneLoaded] = useState(false);
  
  // Trigger scene loaded effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSceneLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [scene.id]);
  
  // Reset hover states when scene changes
  useEffect(() => {
    setHoveredElement(null);
    setHoveredExit(null);
    setSceneLoaded(false);
    
    const timer = setTimeout(() => {
      setSceneLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [scene]);
  
  // Handle element hover
  const handleElementMouseEnter = (elementId: string) => {
    setHoveredElement(elementId);
  };
  
  // Handle element unhover
  const handleElementMouseLeave = () => {
    setHoveredElement(null);
  };
  
  // Handle exit hover
  const handleExitMouseEnter = (exitId: string) => {
    setHoveredExit(exitId);
  };
  
  // Handle exit unhover
  const handleExitMouseLeave = () => {
    setHoveredExit(null);
  };
  
  // Handle element click
  const handleElementClick = (element: InteractiveElement) => {
    // Use default action or first action if available
    const defaultAction = element.actions.find(a => a.isDefault) || element.actions[0];
    if (defaultAction) {
      onInteract(element.id, defaultAction.type);
    }
  };
  
  // Handle element right click to show action menu
  const handleElementRightClick = (
    e: React.MouseEvent,
    element: InteractiveElement
  ) => {
    e.preventDefault();
    
    // Implement context menu for multiple actions
    // This would be more complex in a real implementation
    if (element.actions.length > 1) {
      // For now, just use the first non-default action
      const alternativeAction = element.actions.find(a => !a.isDefault);
      if (alternativeAction) {
        onInteract(element.id, alternativeAction.type);
      }
    }
  };
  
  // Find the hovered element
  const getHoveredElement = () => {
    if (!hoveredElement) return null;
    return scene.interactiveElements.find(el => el.id === hoveredElement);
  };
  
  // Find the hovered exit
  const getHoveredExit = () => {
    if (!hoveredExit) return null;
    return scene.exits.find(exit => exit.id === hoveredExit);
  };
  
  // Check if an element has multiple actions
  const hasMultipleActions = (element: InteractiveElement) => {
    return element.actions.length > 1;
  };
  
  return (
    <div className={`scene-view ${sceneLoaded ? 'scene-loaded' : ''}`}>
      {/* Scene Background */}
      <div 
        className="scene-background"
        style={{ backgroundImage: `url(${scene.background})` }}
      >
        {/* Scene Title Overlay */}
        {scene.showTitle && (
          <div className="scene-title-overlay">
            <h2>{scene.title}</h2>
            {scene.subtitle && <p>{scene.subtitle}</p>}
          </div>
        )}
      
        {/* Interactive Elements */}
        {scene.interactiveElements.map(element => (
          <div
            key={element.id}
            className={`interactive-element ${hoveredElement === element.id ? 'element-hovered' : ''} ${hasMultipleActions(element) ? 'multiple-actions' : ''}`}
            style={{
              left: `${element.position.x}%`,
              top: `${element.position.y}%`,
              width: `${element.size.width}%`,
              height: `${element.size.height}%`
            }}
            onMouseEnter={() => handleElementMouseEnter(element.id)}
            onMouseLeave={handleElementMouseLeave}
            onClick={() => handleElementClick(element)}
            onContextMenu={(e) => handleElementRightClick(e, element)}
          >
            {hoveredElement === element.id && (
              <div className="element-tooltip">
                {element.name}
                {hasMultipleActions(element) && (
                  <span className="multiple-actions-indicator">⋮</span>
                )}
              </div>
            )}
          </div>
        ))}
        
        {/* Scene Exits */}
        {scene.exits.map(exit => (
          <div
            key={exit.id}
            className={`scene-exit ${hoveredExit === exit.id ? 'exit-hovered' : ''}`}
            style={{
              left: `${exit.position.x}%`,
              top: `${exit.position.y}%`,
              width: `${exit.size?.width || 10}%`,
              height: `${exit.size?.height || 10}%`
            }}
            onMouseEnter={() => handleExitMouseEnter(exit.id)}
            onMouseLeave={handleExitMouseLeave}
            onClick={() => onExitClick(exit.id)}
          >
            {hoveredExit === exit.id && (
              <div className="exit-tooltip">
                {exit.name || 'Exit'} 
                {exit.direction && (
                  <span className="exit-direction">
                    {exit.direction === 'north' && '↑'}
                    {exit.direction === 'east' && '→'}
                    {exit.direction === 'south' && '↓'}
                    {exit.direction === 'west' && '←'}
                    {exit.direction === 'up' && '⤴️'}
                    {exit.direction === 'down' && '⤵️'}
                  </span>
                )}
              </div>
            )}
            <div className="exit-indicator">
              {exit.direction === 'north' && '↑'}
              {exit.direction === 'east' && '→'}
              {exit.direction === 'south' && '↓'}
              {exit.direction === 'west' && '←'}
              {exit.direction === 'up' && '⤴️'}
              {exit.direction === 'down' && '⤵️'}
            </div>
          </div>
        ))}
        
        {/* Hover Information */}
        {getHoveredElement() && (
          <div className="hover-info">
            <h3>{getHoveredElement()?.name}</h3>
            {getHoveredElement()?.description && (
              <p>{getHoveredElement()?.description}</p>
            )}
          </div>
        )}
        
        {getHoveredExit() && (
          <div className="hover-info">
            <h3>{getHoveredExit()?.name || 'Exit'}</h3>
            {getHoveredExit()?.description && (
              <p>{getHoveredExit()?.description}</p>
            )}
          </div>
        )}
        
        {/* Visual Effects */}
        {scene.visualEffects && scene.visualEffects.map((effect, index) => (
          <div 
            key={`effect-${index}`}
            className={`visual-effect ${effect.type}`}
            style={{
              opacity: effect.opacity || 0.5,
              animationDuration: `${effect.duration || 5}s`,
              ...effect.style
            }}
          />
        ))}
      </div>
      
      <style jsx>{`
        .scene-view {
          position: relative;
          width: 100%;
          height: 100%;
          flex: 1;
          overflow: hidden;
          transition: opacity 0.5s ease;
          opacity: 0;
        }
        
        .scene-loaded {
          opacity: 1;
        }
        
        .scene-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        
        .scene-title-overlay {
          position: absolute;
          top: 20px;
          left: 20px;
          background-color: rgba(0, 0, 0, 0.6);
          padding: 10px 15px;
          border-radius: 5px;
          color: #f1d7c5;
          max-width: 80%;
          border-left: 4px solid #8a5c41;
          animation: fadeIn 1s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .scene-title-overlay h2 {
          margin: 0 0 5px;
          font-size: 20px;
        }
        
        .scene-title-overlay p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }
        
        .interactive-element {
          position: absolute;
          cursor: pointer;
          border-radius: 5px;
          transition: all 0.2s;
          z-index: 2;
        }
        
        .element-hovered {
          box-shadow: 0 0 0 2px rgba(138, 92, 65, 0.8), 0 0 10px rgba(255, 217, 180, 0.5);
        }
        
        .element-tooltip {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(20, 20, 25, 0.9);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: #f1d7c5;
          white-space: nowrap;
          pointer-events: none;
          border: 1px solid #8a5c41;
        }
        
        .multiple-actions-indicator {
          margin-left: 5px;
          color: #ffb973;
          font-weight: bold;
        }
        
        .scene-exit {
          position: absolute;
          cursor: pointer;
          border-radius: 5px;
          transition: all 0.2s;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2;
        }
        
        .exit-hovered {
          box-shadow: 0 0 0 2px rgba(138, 92, 65, 0.8), 0 0 10px rgba(255, 217, 180, 0.5);
        }
        
        .exit-tooltip {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(20, 20, 25, 0.9);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: #f1d7c5;
          white-space: nowrap;
          pointer-events: none;
          border: 1px solid #8a5c41;
        }
        
        .exit-direction {
          margin-left: 5px;
          font-size: 14px;
        }
        
        .exit-indicator {
          font-size: 18px;
          color: rgba(255, 217, 180, 0.7);
          text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }
        
        .hover-info {
          position: absolute;
          bottom: 80px;
          left: 20px;
          background-color: rgba(20, 20, 25, 0.9);
          padding: 10px 15px;
          border-radius: 5px;
          color: #f1d7c5;
          max-width: 300px;
          border-left: 4px solid #8a5c41;
          animation: fadeIn 0.3s ease;
          z-index: 3;
        }
        
        .hover-info h3 {
          margin: 0 0 5px;
          font-size: 16px;
          color: #ffb973;
        }
        
        .hover-info p {
          margin: 0;
          font-size: 14px;
        }
        
        /* Visual effects */
        .visual-effect {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .fog {
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0) 0%,
            rgba(200, 200, 220, 0.2) 50%,
            rgba(200, 200, 220, 0.3) 100%
          );
          animation: fogMove linear infinite;
        }
        
        .rain {
          background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path d="M20,2 L18,98" stroke="rgba(200,220,255,0.8)" stroke-width="1"/><path d="M40,2 L38,98" stroke="rgba(200,220,255,0.7)" stroke-width="1"/><path d="M60,2 L58,98" stroke="rgba(200,220,255,0.8)" stroke-width="1"/><path d="M80,2 L78,98" stroke="rgba(200,220,255,0.7)" stroke-width="1"/></svg>');
          animation: rainMove linear infinite;
        }
        
        .darkness {
          background-color: rgba(0, 0, 0, 0.5);
        }
        
        .glow {
          box-shadow: inset 0 0 50px rgba(255, 200, 100, 0.5);
          animation: glowPulse ease-in-out infinite alternate;
        }
        
        @keyframes fogMove {
          0% { background-position: 0% 0%; }
          100% { background-position: 0% 100%; }
        }
        
        @keyframes rainMove {
          0% { background-position: 0% 0%; }
          100% { background-position: 20% 100%; }
        }
        
        @keyframes glowPulse {
          0% { box-shadow: inset 0 0 30px rgba(255, 200, 100, 0.3); }
          100% { box-shadow: inset 0 0 70px rgba(255, 200, 100, 0.7); }
        }
      `}</style>
    </div>
  );
};